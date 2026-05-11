const mongoose = require("mongoose")

const taskSchema = new mongoose.Schema({
    team: { type: mongoose.Types.ObjectId, ref: "Team", required: true, index: true },
    title: { type: String, required: true },
    description: String,
    status: { 
        type: String, 
        enum: ['To Do', 'In Progress', 'Review', 'Done'], 
        default: 'To Do',
        index: true
    },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isCompleted: { type: Boolean, default: false, index: true },
    startDate: {
        type: Date,
        default: Date.now 
    },
    dueDate: {
        type: Date 
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
    }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    encryptionVersion: { type: String, default: "1.0" }
},
{ 
    timestamps: true,
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true }
})

taskSchema.virtual('durationInDays').get(function() {
    if (!this.dueDate || !this.startDate) return null;
    const diffInMs = Math.abs(this.dueDate - this.startDate);
    return Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model("Task", taskSchema)