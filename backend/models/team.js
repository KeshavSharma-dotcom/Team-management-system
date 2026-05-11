const mongoose = require("mongoose")

const teamSchema = mongoose.Schema({
    teamName : {
        type : String,
        required : [true,"provide team name"],
        trim : true,
        unique : true,
        index : true,
        minlength : [6, "Team name must be at least 6 characters"],
        maxlength : [50, "Team name cannot exceed 50 characters"]
    },
    teamCode : {
        type : String,
        unique : true,
        index : true,
        required:[true, "provide code for security"],
        minlength : [8, "Team code must be at least 8 characters"]
    },
    status : {
        type : String,
        enum : ["public","private"],
        default : "public",
        required : true,
    },
    description: {
        type: String,
        maxlength: 500,
        default: ""
    },
    tags: [{ type: String }],
    bannerUrl: { type: String, default: "" },
    maxMembers: {
        type: Number,
        default: 50
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
        user: { type: mongoose.Types.ObjectId, ref: "User", required: true, index: true },
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
    joinRequests: [{
        _id: false,
        user: { type: mongoose.Types.ObjectId, ref: "User", required: true, index: true },
        status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
        requestedAt: { type: Date, default: Date.now }
    }],
    createdAt: {
        type: Date,
        default: Date.now 
    },
})

module.exports = mongoose.model("Team", teamSchema)