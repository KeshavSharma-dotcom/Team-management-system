const User = require("../models/user");
const jwt = require("jsonwebtoken");
const asyncWrapper = require("../middlewares/asyncWrapper");
const sendResponse = require("../utils/sendResponse");
const AppError = require("../utils/AppError");
const sendEmail = require("../utils/sendEmail");

const OTP_EXPIRY_MS = 10 * 60 * 1000;

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const register = asyncWrapper(async (req, res) => {
    const { email, password, name, role } = req.body || {};

    if (!email || !password || !name) {
        throw new AppError("Email, password, and name are required", 400);
    }

    const normalizedEmail = email.toString().toLowerCase().trim();
    const cleanName = name.toString().trim();

    if (password.length < 8) {
        throw new AppError("Password must be at least 8 characters long", 400);
    }

    const exists = await User.exists({ email: normalizedEmail });
    if (exists) {
        throw new AppError("An account with this email already exists", 409);
    }

    const colors = ["#6366f1", "#818cf8", "#c084fc", "#f472b6", "#fb7185", "#38bdf8", "#4ade80", "#fbbf24"];
    const avatarColor = colors[Math.floor(Math.random() * colors.length)];

    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

    let user;
    try {
        user = await User.create({
            email: normalizedEmail,
            password,
            name: cleanName,
            role,
            otp,
            otpExpiresAt,
            avatarColor,
            isVerified: false
        });
    } catch (error) {
        if (error.code === 11000) {
            throw new AppError("An account with this email already exists", 409);
        }
        throw error;
    }

    try {
        await sendEmail({
            to: normalizedEmail,
            subject: "Your Team Management OTP",
            html: `<h2>Team Management</h2><p>Your OTP: <b>${otp}</b></p><p>This code expires in 10 minutes.</p>`
        });
    } catch (emailError) {
        // Output OTP to backend console so registration flow doesn't break during dev
        console.log(`\n===========================================`);
        console.log(`Registration OTP for ${normalizedEmail}: ${otp}`);
        console.log(`===========================================\n`);
    }

    sendResponse(res, 201, `OTP sent to ${normalizedEmail}`, { email: normalizedEmail });
});
const verifyOtp = asyncWrapper(async (req, res) => {
    const { email, otp } = req.body || {};

    if (!email || !otp) {
        throw new AppError("Email and OTP are required", 400);
    }

    const normalizedEmail = email.toString().toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    const user = await User.findOne({ email: normalizedEmail }).select("+otp +otpExpiresAt");
    if (!user) {
        throw new AppError("User not found", 404);
    }

    if (user.isVerified) {
        return sendResponse(res, 200, "Account is already verified");
    }

    if (!user.otp || user.otp !== cleanOtp) {
        throw new AppError("Invalid OTP", 400);
    }

    if (!user.otpExpiresAt || user.otpExpiresAt.getTime() < Date.now()) {
        throw new AppError("OTP has expired. Please request a new one.", 400);
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    sendResponse(res, 200, "Account verified successfully");
});

const sendOtpAgain = asyncWrapper(async (req, res) => {
    const { email } = req.body || {};

    if (!email) {
        throw new AppError("Email is required", 400);
    }

    const normalizedEmail = email.toString().toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
        throw new AppError("User not found", 404);
    }
    if (user.isVerified) {
        throw new AppError("Account is already verified", 400);
    }

    const newOtp = generateOtp();
    const newExpiry = new Date(Date.now() + OTP_EXPIRY_MS);

    try {
        await sendEmail({
            to: normalizedEmail,
            subject: "Your new OTP — Team Management",
            html: `<h2>Team Management</h2><p>Your new OTP: <b>${newOtp}</b></p><p>Expires in 10 minutes.</p>`
        });
    } catch (emailError) {
        throw new AppError("Failed to send email. Please try again later.", 500);
    }

    user.otp = newOtp;
    user.otpExpiresAt = newExpiry;
    await user.save();

    sendResponse(res, 200, `OTP resent to ${normalizedEmail}`, { email: normalizedEmail });
});

const login = asyncWrapper(async (req, res) => {
    const { email, password } = req.body || {};

    if (!email || !password) {
        throw new AppError("Email and password are required", 400);
    }

    const normalizedEmail = email.toString().toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    if (!user) {
        throw new AppError("Invalid email or password", 401);
    }

    const isMatch = await user.comparePassword(password.toString());
    if (!isMatch) {
        throw new AppError("Invalid email or password", 401);
    }

    if (!user.isVerified) {
        throw new AppError("Please verify your email before logging in", 403);
    }

    if (!process.env.JWT_SECRET) {
        throw new AppError("JWT secret configuration is missing", 500);
    }

    const token = jwt.sign(
        { userId: user._id, role: user.role, userName: user.name },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_DURATION || "7d" }
    );

    const userPayload = {
        id: user._id,
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarColor: user.avatarColor
    };

    sendResponse(res, 200, "Login successful", { token, user: userPayload });
});

const initiateFP = asyncWrapper(async (req, res) => {
    const { email } = req.body || {};

    if (!email) {
        throw new AppError("Email is required", 400);
    }

    const normalizedEmail = email.toString().toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
        throw new AppError("No account found with this email", 404);
    }

    const newOtp = generateOtp();
    const newExpiry = new Date(Date.now() + OTP_EXPIRY_MS);

    try {
        await sendEmail({
            to: normalizedEmail,
            subject: "Password Reset OTP — Team Management",
            html: `<h2>Password Reset</h2><p>Your OTP: <b>${newOtp}</b></p><p>Expires in 10 minutes.</p>`
        });
    } catch (emailError) {
        throw new AppError("Failed to send password reset email. Please try again later.", 500);
    }

    user.otp = newOtp;
    user.otpExpiresAt = newExpiry;
    await user.save();

    sendResponse(res, 200, `Reset OTP sent to ${normalizedEmail}`, { email: normalizedEmail });
});

const resetPas = asyncWrapper(async (req, res) => {
    const { email, otp, password, newPassword } = req.body || {};
    const targetPassword = newPassword || password;

    if (!email || !otp || !targetPassword) {
        throw new AppError("Email, OTP, and new password are required", 400);
    }

    if (targetPassword.toString().length < 8) {
        throw new AppError("Password must be at least 8 characters long", 400);
    }

    const normalizedEmail = email.toString().toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    const user = await User.findOne({ email: normalizedEmail }).select("+otp +otpExpiresAt");
    if (!user) {
        throw new AppError("User not found", 404);
    }

    if (!user.otp || user.otp !== cleanOtp) {
        throw new AppError("Invalid OTP", 400);
    }

    if (!user.otpExpiresAt || user.otpExpiresAt.getTime() < Date.now()) {
        throw new AppError("OTP has expired. Please request a new one.", 400);
    }

    user.password = targetPassword.toString();
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    sendResponse(res, 200, "Password reset successfully");
});

module.exports = {
    register,
    verifyOtp,
    sendOtpAgain,
    login,
    initiateFP,
    resetPas
};