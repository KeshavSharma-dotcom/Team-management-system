const express = require("express")
const router = express.Router()
const { authenticateUser } = require("../middlewares/authMiddleware")
const validateRequest = require("../middlewares/validateRequest")
const { startResumeAnalysisSchema } = require("../validations/resumeValidation")
const {
    startResumeAnalysis,
    getResumeAnalysis,
    getResumeHistory
} = require("../controllers/resumeController")

router.post("/analyze", authenticateUser, validateRequest(startResumeAnalysisSchema), startResumeAnalysis)
router.get("/history", authenticateUser, getResumeHistory)
router.get("/:jobId", authenticateUser, getResumeAnalysis)

module.exports = router
