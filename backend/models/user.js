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
        minlength: 3
    },

    email: {
        type: String,
        required: true,
        unique: true,
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
        minlength: 8
    },
    role: {
        type: String,
        enum: ["admin", "member"],
        default: "member"
    },
    otp: { type: String },
    secondaryOtp: { type: String }, 

    profile: {
        contact: {
            type: String,
            match: [/^\+?[1-9]\d{1,14}$/, "Enter a valid E.164 phone number"]
        },
        bio: { type: String, maxlength: 150 },
        avatar: { type: String }, // URL to image
        location: { type: String }
    }
}, { timestamps: true })

userSchema.pre("save", async function() {
    if (!this.isModified("password")) return;
    try {
        const salt = await bcrypt.genSalt(Number(process.env.SALT_ROUNDS || 10))
        this.password = await bcrypt.hash(this.password, salt)
    } catch (err) {
        throw err
    }
})

module.exports = mongoose.model("User", userSchema)