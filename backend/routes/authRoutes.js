const express = require("express");
const router = express.Router();
const { register, verifyOtp, sendOtpAgain, login, initiateFP, resetPas } = require("../controllers/authController");
const validateRequest = require("../middlewares/validateRequest");
const {
    registerSchema,
    loginSchema,
    verifyOtpSchema,
    resendOtpSchema,
    forgotPasswordSchema,
    resetPasswordSchema
} = require("../validations/authValidation");

router.post("/register", validateRequest(registerSchema), register);
router.post("/verify", validateRequest(verifyOtpSchema), verifyOtp);
router.post("/login", validateRequest(loginSchema), login);
router.post("/resend-otp", validateRequest(resendOtpSchema), sendOtpAgain);
router.post("/FP", validateRequest(forgotPasswordSchema), initiateFP);
router.post("/RP", validateRequest(resetPasswordSchema), resetPas);

module.exports = router;