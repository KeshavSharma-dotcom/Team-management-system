const mongoose = require("mongoose")

const teamSchema = mongoose.Schema({
    teamName : {
        type : String,
        required : [true,"provide team name"],
        trim : true,
        unique : true
    },
    teamCode : {
        type : String,
        minlength : 6,
        unique : true,
        required:[true, "provide code for security"]
    },
    status : {
        type : String,
        enum : ["public","private"],
        default : "public",
        required : true,
    },
    passcode:{
        type:String,
        minlength:8
    },
    isLocked : {
        type : Boolean,
        default:false
    },
    createdBy :{
        type : mongoose.Types.ObjectId,
        ref : "User",
        required : [true, "Please provide creater ID"]
    },
    members: [{
        _id: false,
        user: { type: mongoose.Types.ObjectId, ref: "User", required: true },
        role: { type: String, enum: ["owner", "sub-admin", "member"], default: "member" },
        joinedAt: {
            type: Date,
            default: Date.now 
        }
    }],
    hide:{
        type:Boolean,
        default:false
    },
    discussions: [{
        user: { type: mongoose.Types.ObjectId, ref: "User", required: true },
        userName: String,
        text: { type: String, required: true },
        sentAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now 
    },
})

module.exports = mongoose.model("Team", teamSchema)