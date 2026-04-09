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
        default : "private",
        required : true
    },
    createdBy :{
        type : mongoose.Types.ObjectId,
        ref : "User",
        required : [true, "Please provide creater ID"]
    },
    members : [{
        _id : false,
        user: {type : mongoose.Types.ObjectId, ref:"User", required:true},
        role:{type : String, enum:["owner","sub-admin","member"],default:"member"}
    }]
}, {timestamps : true})

module.exports = mongoose.model("team", teamSchema)