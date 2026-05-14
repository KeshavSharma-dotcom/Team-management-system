const resumeService = require("../services/resumeService")
const asyncWrapper = require("../middlewares/asyncWrapper")
const sendResponse = require("../utils/sendResponse")
const logger = require("../utils/logger")

const startResumeAnalysis = asyncWrapper(async (req, res) => {
    const job = await resumeService.createAnalysisJob(req.user.userId, req.body)

    if (!req.app.locals.resumePayloads) {
        req.app.locals.resumePayloads = new Map()
    }

    req.app.locals.resumePayloads.set(job.jobId, {
        resumeText: req.body.resumeText,
        pdfBase64: req.body.pdfBase64
    })

    setImmediate(() => {
        resumeService.runAnalysisJob(job.jobId, req.app).catch(error => {
            logger.error(`Unexpected resume worker error: ${error.message}`)
        })
    })

    sendResponse(res, 202, "Resume analysis started", {
        jobId: job.jobId,
        status: job.status
    })
})

const getResumeAnalysis = asyncWrapper(async (req, res) => {
    const analysis = await resumeService.getAnalysisForUser(req.user.userId, req.params.jobId)
    sendResponse(res, 200, "Resume analysis retrieved", { analysis })
})

const getResumeHistory = asyncWrapper(async (req, res) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const analyses = await resumeService.getHistoryForUser(req.user.userId, page, limit)
    sendResponse(res, 200, "Resume analyses retrieved", { count: analyses.length, page, limit, analyses })
})

module.exports = { startResumeAnalysis, getResumeAnalysis, getResumeHistory }
