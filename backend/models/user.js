const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
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
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        lowercase: true,
        index: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email"]
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    secondaryEmail: {
        type: String,
        trim: true,
        lowercase: true,
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
        required: [true, "Password is required"],
        minlength: [8, "Password must be at least 8 characters long"],
        select: false
    },
    publicKey: {
        type: String
    },
    encryptedPrivateKey: {
        type: String
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
    otp: { type: String, select: false },
    otpExpiresAt: { type: Date, select: false },
    secondaryOtp: { type: String, select: false },

    profile: {
        bio: { type: String, default: "" },
        contact: { type: String, default: "" },
        location: { type: String, default: "" },
        skills: [{ type: String, trim: true }],
        bannerUrl: { type: String, default: "" },
        socialLinks: {
            github: { type: String, default: "" },
            linkedin: { type: String, default: "" },
            website: { type: String, default: "" }
        }
    },
    avatarColor: { type: String, default: "#6366f1" }
}, { timestamps: true });

userSchema.pre("validate", function () {
    if (this.secondaryEmail === "") {
        this.secondaryEmail = undefined;
    }
    if (this.username === "") {
        this.username = undefined;
    }
});

// ✅ FIX 2: Pure async save hook (no next parameter)
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Instance method to compare passwords during login
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);