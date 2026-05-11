const userService = require("../services/userService");
const asyncWrapper = require("../middlewares/asyncWrapper");

const updateProfile = asyncWrapper(async (req, res) => {
    const user = await userService.updateProfile(req.user.userId, req.body);
    res.status(200).json({ msg: "Profile updated successfully", user });
});

const getMe = asyncWrapper(async (req, res) => {
    const user = await userService.getMe(req.user.userId);
    res.status(200).json({ user });
});

const storeSecurityKeys = asyncWrapper(async (req, res) => {
    const user = await userService.storeSecurityKeys(req.user.userId, req.body);
    res.status(200).json({ msg: "Security keys established", hasKeys: true });
});

// Other controllers kept for compatibility
const User = require("../models/user");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

const addSecondaryEmail = asyncWrapper(async (req, res) => {
    const { email } = req.body;
    const user = await User.findById(req.user.userId);
    if (user.email === email) return res.status(400).json({ msg: "This is already your primary email" });
    const otp = crypto.randomInt(100000, 999999).toString();
    user.secondaryEmail = email;
    user.secondaryOtp = otp;
    user.isSecondaryVerified = false;
    await user.save();
    await sendEmail({ to: email, subject: "Verify your secondary email", text: `Code: ${otp}` });
    res.status(200).json({ msg: "Verification code sent" });
});

const verifySecondaryEmail = asyncWrapper(async (req, res) => {
    const user = await User.findById(req.user.userId);
    if (!user.secondaryOtp || user.secondaryOtp !== req.body.otp) return res.status(400).json({ msg: "Invalid code" });
    user.isSecondaryVerified = true;
    user.secondaryOtp = undefined; 
    await user.save();
    res.status(200).json({ msg: "Secondary email verified" });
});

module.exports = {
    updateProfile,
    addSecondaryEmail,
    verifySecondaryEmail,
    getMe,
    storeSecurityKeys
};