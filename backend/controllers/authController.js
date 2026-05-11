const authService = require("../services/authService");
const asyncWrapper = require("../middlewares/asyncWrapper");
const sendResponse = require("../utils/sendResponse");

const register = asyncWrapper(async (req, res) => {
    const result = await authService.register(req.body);
    sendResponse(res, 201, `OTP sent to ${result.email}`);
});

const login = asyncWrapper(async (req, res) => {
    const result = await authService.login(req.body.email, req.body.password);
    sendResponse(res, 200, "Login successful", result);
});

const verifyOtp = asyncWrapper(async (req, res) => {
    const { email, otp } = req.body;
    const result = await authService.verifyOtp(email, otp);
    sendResponse(res, 200, result.message);
});

const sendOtpAgain = asyncWrapper(async (req, res) => {
    const result = await authService.resendOtp(req.body.email);
    sendResponse(res, 200, `OTP resent to ${result.email}`);
});

const initiateFP = asyncWrapper(async (req, res) => {
    const result = await authService.initiateForgotPassword(req.body.email);
    sendResponse(res, 200, `Reset OTP sent to ${result.email}`);
});

const resetPas = asyncWrapper(async (req, res) => {
    const { email, otp, password } = req.body;
    const result = await authService.resetPassword(email, otp, password);
    sendResponse(res, 200, result.message);
});

module.exports = { register, verifyOtp, sendOtpAgain, login, initiateFP, resetPas };