const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        unique: true,
        sparse: true, 
        trim: true,
        lowercase: true,
        minlength: [3, "Username must be at least 3 characters long"],
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email"]
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    secondaryEmail: {
        type: String,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email"],
        sparse: true,
        unique: true
    },
    isSecondaryVerified: {
        type: Boolean,
        default: false
    },
    password: {
        type: String,
        required: true,
        minlength: [8, "Password must be at least 8 characters long"]
    },
    publicKey: {
        type: String, 
    },
    encryptedPrivateKey: {
        type: String, 
    },
    keyMetadata: {
        iv: String, 
        salt: String 
    },
    role: {
        type: String,
        enum: ["admin", "member"],
        default: "member"
    },
    otp: { type: String },
    otpExpiresAt: { type: Date },
    secondaryOtp: { type: String },

    profile: {
        bio: { type: String, default: "" },
        contact: { type: String, default: "" },
        location: { type: String, default: "" },
        skills: [{ type: String }],
        bannerUrl: { type: String, default: "" },
        socialLinks: {
            github: { type: String, default: "" },
            linkedin: { type: String, default: "" },
            website: { type: String, default: "" }
        }
    },
    avatarColor: { type: String, default: "#6366f1" }
}, { timestamps: true })

userSchema.pre("save", async function() {
    if (!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

module.exports = mongoose.model("User", userSchema)