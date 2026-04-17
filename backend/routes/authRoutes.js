const express = require("express")
const router = express.Router()
const {register, verifyOtp, sendOtpAgain, login, initiateFP, resetPas} = require("../controllers/authController")

router.post("/register",register)
router.post("/verify",verifyOtp)
router.post("/login",login);
router.post("/resend-otp",sendOtpAgain)
router.post("/FP",initiateFP)
router.post("/RP",resetPas)

module.exports = router