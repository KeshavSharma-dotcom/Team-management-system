const User = require("../models/user");
const asyncWrapper = require("../middlewares/asyncWrapper");
const crypto = require("crypto");
const sendEmail  = require("../utils/sendEmail"); 

const updateProfile = asyncWrapper(async (req, res) => {
    const { username, bio, contact, location } = req.body;
    const userId = req.user.userId;

    if (username) {
        const existingUsername = await User.findOne({ username, _id: { $ne: userId } });
        if (existingUsername) {
            return res.status(400).json({ msg: "Username already taken" });
        }
    }

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
            $set: {
                username: username,
                "profile.bio": bio,
                "profile.contact": contact,
                "profile.location": location
            }
        },
        { new: true, runValidators: true }
    ).select("-password -otp -secondaryOtp");

    res.status(200).json({ msg: "Profile updated successfully", user: updatedUser });
});

const addSecondaryEmail = asyncWrapper(async (req, res) => {
    const { email } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (user.email === email) return res.status(400).json({ msg: "This is already your primary email" });

    const otp = crypto.randomInt(100000, 999999).toString();
    
    user.secondaryEmail = email;
    user.secondaryOtp = otp;
    user.isSecondaryVerified = false;
    await user.save();

    await sendEmail({
        to: email,
        subject: "Verify your secondary email",
        text: `Your TeamControl verification code is: ${otp}`
    });

    res.status(200).json({ msg: "Verification code sent to secondary email" });
});

const verifySecondaryEmail = asyncWrapper(async (req, res) => {
    const { otp } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);

    if (!user.secondaryOtp || user.secondaryOtp !== otp) {
        return res.status(400).json({ msg: "Invalid or expired code" });
    }

    user.isSecondaryVerified = true;
    user.secondaryOtp = undefined; 
    await user.save();

    res.status(200).json({ msg: "Secondary email verified successfully" });
});

const getMe = asyncWrapper(async (req, res) => {
    const user = await User.findById(req.user.userId).select("-password -otp -secondaryOtp");
    res.status(200).json({ user });
});

module.exports = {
    updateProfile,
    addSecondaryEmail,
    verifySecondaryEmail,
    getMe
};