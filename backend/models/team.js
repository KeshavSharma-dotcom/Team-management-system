const mongoose = require("mongoose")

const teams = mongoose.Schema({
    teamName : {
        type : String,

    },
    teamCode : {
        type : String,

    },
    createdBy :{

    },
    createdTime : {

    }
    
})