const User = require("../models/user")
const jwt = require("jsonwebtoken")
const asyncWrapper = require("../middlewares/asyncWrapper")

const register = asyncWrapper(async (req ,res)=>{
    const {email, password, name, role} = req.body
    if(!email || !password || !name || !role){
        return res.status(400).json({message: "Field Required!"})
    }
    const check = await User.exists({email})
    if(check){
        return res.status(409).json({message : "User Already Exists!"})
    }
    const user = await User.create({
        email : email,
        password : password,
        name : name,
        role : role
    })
    res.status(201).json({message : "User Registration Successfull"})
})

