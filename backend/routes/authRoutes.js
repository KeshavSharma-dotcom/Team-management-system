const express = require("express")
const router = express.Router()
const {register, verifyOtp, sendOtpAgain, login, initiateFP, resetPas} = require("../controllers/authController")
const validateRequest = require("../middlewares/validateRequest")
const { registerSchema, loginSchema } = require("../validations/authValidation")

router.post("/register", validateRequest(registerSchema), register)
router.post("/verify",verifyOtp)
router.post("/login", validateRequest(loginSchema), login);
router.post("/resend-otp",sendOtpAgain)
router.post("/FP",initiateFP)
router.post("/RP",resetPas)

module.exports = router