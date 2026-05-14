const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendEmail");
const AppError = require("../utils/AppError");

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

class AuthService {
    async register(userData) {
        const { email, password, name, role } = userData;
        const exists = await User.exists({ email });
        if (exists) throw new AppError("An account with this email already exists", 409);

        const colors = ["#6366f1", "#818cf8", "#c084fc", "#f472b6", "#fb7185", "#38bdf8", "#4ade80", "#fbbf24"];
        const avatarColor = colors[Math.floor(Math.random() * colors.length)];

        const otp = generateOtp();
        const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

        await User.create({ email, password, name, role, otp, otpExpiresAt, avatarColor });

        await sendEmail({
            to: email,
            subject: "Your Team Management OTP",
            html: `<h2>Team Management</h2><p>Your OTP: <b>${otp}</b></p><p>This code expires in 10 minutes.</p>`
        });

        return { email };
    }

    async verifyOtp(email, otp) {
        const user = await User.findOne({ email });
        if (!user) throw new AppError("User not found", 404);
        if (user.otp !== otp) throw new AppError("Invalid OTP", 400);
        if (!user.otpExpiresAt || user.otpExpiresAt < Date.now()) {
            throw new AppError("OTP has expired. Please request a new one.", 400);
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiresAt = undefined;
        await user.save();
        return { message: "Account verified successfully" };
    }

    async resendOtp(email) {
        const user = await User.findOne({ email });
        if (!user) throw new AppError("User not found", 404);
        if (user.isVerified) throw new AppError("Account is already verified", 400);

        user.otp = generateOtp();
        user.otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MS);
        await user.save();

        await sendEmail({
            to: email,
            subject: "Your new OTP — Team Management",
            html: `<h2>Team Management</h2><p>Your new OTP: <b>${user.otp}</b></p><p>Expires in 10 minutes.</p>`
        });

        return { email };
    }

    async login(email, password) {
        const user = await User.findOne({ email });
        if (!user) throw new AppError("Invalid email or password", 401);
        if (!user.isVerified) throw new AppError("Please verify your email before logging in", 403);

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new AppError("Invalid email or password", 401);

        const token = jwt.sign(
            { userId: user._id, role: user.role, userName: user.name },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_DURATION || "7d" }
        );

        return {
            token,
            user: { userId: user._id, name: user.name, role: user.role, avatarColor: user.avatarColor }
        };
    }

    async initiateForgotPassword(email) {
        const user = await User.findOne({ email });
        if (!user) throw new AppError("No account found with this email", 404);

        user.otp = generateOtp();
        user.otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MS);
        await user.save();

        await sendEmail({
            to: email,
            subject: "Password Reset OTP — Team Management",
            html: `<h2>Password Reset</h2><p>Your OTP: <b>${user.otp}</b></p><p>Expires in 10 minutes.</p>`
        });

        return { email };
    }

    async resetPassword(email, otp, newPassword) {
        const user = await User.findOne({ email });
        if (!user) throw new AppError("User not found", 404);
        if(!user.isVerified){
            AppError("User not verified",400)
        }
        user.password = newPassword;
        await user.save();
        return { message: "Password reset successfully" };
    }
}

module.exports = new AuthService();
