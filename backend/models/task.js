const mongoose = require("mongoose")

const taskSchema = new mongoose.Schema({
    team: { type: mongoose.Types.ObjectId, ref: "Team", required: true },
    
    title: { type: String, required: true },

    description: String,

    isCompleted: { type: Boolean, default: false },

    comments: [{
        user: { type: mongoose.Types.ObjectId, ref: "User" },
        text: String,
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true })

module.exports = mongoose.model("Task", taskSchema)