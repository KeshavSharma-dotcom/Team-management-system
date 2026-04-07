const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const adminSchema = mongoose.Schema({
    adminEmail : {
        type : String,
        required : true,
        unique : true,
        match : [/^[^\s@]+@[^\s@]+\.[^\s@]+$/,"Enter a valid email"]
    },
    password : {
        type : String,
        required : true,
        minlength : 8
    },
    adminName : {
        type : String,
        required : true
    },
    role : {
        type : String,
        default : "Admin"
    }

}, {timestamps : true})

adminSchema.pre("save", async function(){
    if (!this.isModified("password")) return;
    try{
        const salt = await bcrypt.genSalt(Number(process.env.SALT_ROUNDS || 10))
        this.password = await bcrypt.hash(this.password, salt)
    }catch(err){
        alert(err.message)
    }
})

module.exports = mongoose.model("admin", adminSchema)