const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = mongoose.Schema({
    email : {
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
    name : {
        type : String,
        required : true,
        trim : true
    },
    role : {
        type : String,
        enum : ["admin","member"],
        default : "member"
    }

}, {timestamps : true})

userSchema.pre("save", async function(){
    if (!this.isModified("password")) return;
    try{
        const salt = await bcrypt.genSalt(Number(process.env.SALT_ROUNDS || 10))
        this.password = await bcrypt.hash(this.password, salt)
    }catch(err){
        alert(err.message)
    }
})

module.exports = mongoose.model("user", userSchema)