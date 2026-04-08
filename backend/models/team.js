const mongoose = require("mongoose")

const teamSchema = mongoose.Schema({
    teamName : {
        type : String,
        required : true,
        trim : true
    },
    status : {
        type : String,
        enum : ["public","private"],
        default : "private",
        required : true
    }
}, {timestamps : true})

module.exports = mongoose.model("team", teamSchema)