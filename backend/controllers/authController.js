const User = require("../models/user")
const jwt = require("jsonwebtoken")
const asyncWrapper = require("../middlewares/asyncWrapper")
const sendEmail = require("../utils/sendEmail")
const bcrypt = require("bcryptjs")
const register = asyncWrapper(async (req ,res)=>{
    const {email, password, name, role} = req.body
    if(!email || !password || !name || !role){
        return res.status(400).json({message: "Field Required!"})
    }
    const check = await User.exists({email})
    if(check){
        return res.status(409).json({message : "User Already Exists!"})
    }

    const otp = Math.floor(100000 + Math.random() * 900000)
    const user = await User.create({
        email : email,
        password : password,
        name : name,
        role : role,
        otp : otp
    })
    await sendEmail({
        to : email,
        subject : `Account registration otp`,
        html : `<h1>Team management</h1>
        <p>Account creation opt : <b>${otp}</b></p>`
    })
    res.status(201).json({msg : `OTP sent to ${email}`})
})

const verifyOtp = asyncWrapper(async (req,res)=>{
    const {email,otp} = req.body
    if(!email || !otp){
        return res.status(400).json({msg : "Bad request"})
    }
    const user = await User.findOne({email})
    if(!user){
        return res.status(404).json({msg : "User not found!"})
    }
    if(user.otp !== otp){
        return res.status(400).json({msg:"Invalid otp"})
    }
    user.isVerified = true

    await user.save()
    res.status(200).json({msg:"Registration Successfull"})
})

const sendOtpAgain = asyncWrapper(async (req,res)=>{
    const {email} = req.body
    if(!email){
        return res.status(400).json({msg:"Bad req"})
    }
    const user = await User.findOne({email})
    if(!user){
        return res.status(404).json({msg : "User not found!"})
    }
    await sendEmail({
        to : email,
        subject : `Account registration otp`,
        html : `<h1>Team management</h1>
        <p>Account creation opt : <b>${otp}</b></p>`
    })
    res.status(201).json({msg : `OTP sent again to ${email}`})
})

const login = asyncWrapper(async (req,res)=>{
    const {email,password,role} = req.body 
    if(!email || !password){
        return res.status(400).json({msg : "Provide both fields"})
    }
    const user = await User.findOne({email})
    if(!user){
        return res.status(404).json({msg : "User not found!"})
    }
    const passcode = await bcrypt.compare(password, user.password)
    if(!passcode){
        return res.status(409).json({msg: "Wrong Password"})
    }
    const token = jwt.sign(
        {userId :user._id , role : user.role},
        process.env.JWT_SECRET,
        {expiresIn: '1d'}
    )
    res.status(200).json({msg : "login successfull",token,user:{name : user.name,role:user.role}})
})
