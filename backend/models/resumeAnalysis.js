const mongoose = require("mongoose")

const skillSchema = new mongoose.Schema({
    _id: false,
    skill: { type: String, required: true },
    category: { type: String, required: true }
})

const resumeAnalysisSchema = new mongoose.Schema({
    jobId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    team: {
        type: mongoose.Types.ObjectId,
        ref: "Team",
        index: true
    },
    candidateName: {
        type: String,
        trim: true,
        default: ""
    },
    fileName: {
        type: String,
        trim: true,
        default: ""
    },
    requirements: {
        type: String,
        required: true,
        maxlength: 8000
    },
    resumeTextPreview: {
        type: String,
        maxlength: 500,
        default: ""
    },
    status: {
        type: String,
        enum: ["processing", "completed", "failed"],
        default: "processing",
        index: true
    },
    score: Number,
    matchedSkills: [{ type: String }],
    missingSkills: [{ type: String }],
    extractedSkills: [skillSchema],
    summary: String,
    recommendations: [{ type: String }],
    textStats: {
        wordCount: Number,
        requirementSkillCount: Number,
        matchedRequirementSkillCount: Number
    },
    error: String,
    rawResult: mongoose.Schema.Types.Mixed,
    completedAt: Date
}, { timestamps: true })

module.exports = mongoose.model("ResumeAnalysis", resumeAnalysisSchema)
