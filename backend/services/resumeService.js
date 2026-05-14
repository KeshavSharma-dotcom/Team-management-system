const crypto = require("crypto")
const ResumeAnalysis = require("../models/resumeAnalysis")
const Team = require("../models/team")
const AppError = require("../utils/AppError")
const logger = require("../utils/logger")
const appConfig = require("../config/appConfig")

class ResumeService {
    async createAnalysisJob(userId, payload) {
        const { resumeText, pdfBase64, requirements, candidateName, fileName, teamId } = payload

        if (!requirements || requirements.trim().length < 10) {
            throw new AppError("Project requirements must be at least 10 characters", 400)
        }

        if (!resumeText && !pdfBase64) {
            throw new AppError("Provide resume text or upload a PDF", 400)
        }

        if (teamId) {
            const team = await Team.findById(teamId).select("members")
            if (!team) throw new AppError("Team not found", 404)

            const isMember = team.members.some(member => member.user.toString() === userId)
            if (!isMember) throw new AppError("You are not a member of this team", 403)
        }

        return ResumeAnalysis.create({
            jobId: crypto.randomUUID(),
            user: userId,
            team: teamId || undefined,
            candidateName: candidateName || "",
            fileName: fileName || "",
            requirements: requirements.trim(),
            resumeTextPreview: resumeText ? resumeText.trim().slice(0, 500) : "",
            status: "processing"
        })
    }

    async runAnalysisJob(jobId, app) {
        const job = await ResumeAnalysis.findOne({ jobId })
        if (!job) return

        try {
            const analysisResult = await this.callAnalysisService(job, app)

            job.status = "completed"
            job.score = analysisResult.score
            job.matchedSkills = analysisResult.matchedSkills || []
            job.missingSkills = analysisResult.missingSkills || []
            job.extractedSkills = analysisResult.extractedSkills || []
            job.summary = analysisResult.summary
            job.recommendations = analysisResult.recommendations || []
            job.textStats = analysisResult.textStats || {}
            job.rawResult = analysisResult
            job.completedAt = new Date()
            await job.save()

            this.emitCompletion(app, job)
        } catch (error) {
            logger.error(`Resume analysis failed for job ${jobId}: ${error.message}`)
            job.status = "failed"
            job.error = error.message || "Resume analysis failed"
            job.completedAt = new Date()
            await job.save()
            this.emitCompletion(app, job)
        }
    }

    async callAnalysisService(job, app) {
        const queuedPayload = app?.locals?.resumePayloads?.get(job.jobId)
        if (!queuedPayload) {
            throw new AppError("Resume payload expired before processing", 410)
        }

        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), appConfig.integrations.resumeAnalysisTimeoutMs)
        const serviceUrl = appConfig.integrations.resumeAnalysisUrl

        try {
            const response = await fetch(`${serviceUrl}/analyze`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                signal: controller.signal,
                body: JSON.stringify({
                    text: queuedPayload.resumeText || undefined,
                    pdf_base64: queuedPayload.pdfBase64 || undefined,
                    requirements: job.requirements,
                    candidate_name: job.candidateName || undefined
                })
            })

            const contentType = response.headers.get("content-type") || ""
            const data = contentType.includes("application/json")
                ? await response.json()
                : { message: await response.text() }

            if (!response.ok) {
                throw new AppError(data.detail || data.message || "Resume analysis service rejected the request", response.status)
            }

            return data
        } finally {
            clearTimeout(timeout)
            app?.locals?.resumePayloads?.delete(job.jobId)
        }
    }

    emitCompletion(app, job) {
        const io = app?.get?.("io")
        if (!io) return

        io.to(`user:${job.user.toString()}`).emit("analysis-complete", {
            jobId: job.jobId,
            status: job.status,
            score: job.score
        })
    }

    async getAnalysisForUser(userId, jobId) {
        const analysis = await ResumeAnalysis.findOne({ jobId, user: userId })
            .select("-rawResult")
            .populate("team", "teamName")

        if (!analysis) throw new AppError("Resume analysis not found", 404)
        return analysis
    }

    async getHistoryForUser(userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit
        return ResumeAnalysis.find({ user: userId })
            .select("-rawResult")
            .populate("team", "teamName")
            .sort("-createdAt")
            .skip(skip)
            .limit(limit)
    }
}

module.exports = new ResumeService()
