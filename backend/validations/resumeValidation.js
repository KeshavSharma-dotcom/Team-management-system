const Joi = require("joi")

const objectId = Joi.string().hex().length(24)

const startResumeAnalysisSchema = Joi.object({
    candidateName: Joi.string().trim().max(120).allow("", null),
    teamId: objectId.allow("", null),
    requirements: Joi.string().trim().min(10).max(8000).required(),
    resumeText: Joi.string().trim().max(300000).allow("", null),
    pdfBase64: Joi.string().max(10000000).allow("", null),
    fileName: Joi.string().trim().max(255).allow("", null)
}).custom((value, helpers) => {
    if (!value.resumeText && !value.pdfBase64) {
        return helpers.error("any.custom", { message: "Provide resume text or a PDF" })
    }
    return value
}, "resume content requirement")

module.exports = { startResumeAnalysisSchema }
