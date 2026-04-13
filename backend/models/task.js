const mongoose = require("mongoose")

const taskSchema = new mongoose.Schema({
    team: { type: mongoose.Types.ObjectId, ref: "Team", required: true },
    title: { type: String, required: true },
    description: String,
    isCompleted: { type: Boolean, default: false },
    createdAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date 
    },
    comments: [{
        user: { type: mongoose.Types.ObjectId, ref: "User" },
        text: String,
        commentedAt: {
            type: Date,
            default: Date.now
        }
    }]
})

module.exports = mongoose.model("Task", taskSchema)