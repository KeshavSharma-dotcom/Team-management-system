const mongoose = require("mongoose");

const messageSchema = mongoose.Schema({
    team: {
        type: mongoose.Types.ObjectId,
        ref: "Team",
        required: true,
        index: true
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    sentAt: {
        type: Date,
        default: Date.now,
        index: true
    }
});

module.exports = mongoose.model("Message", messageSchema);
