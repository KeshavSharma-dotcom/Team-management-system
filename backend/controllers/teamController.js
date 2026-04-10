const User = require("../models/user")
const asyncWrapper = require("../middlewares/asyncWrapper")
const Team = require("../models/team")

const allTeams = asyncWrapper(async (req,res)=>{
    const allTeams =  req.params
    const fileterd = allTeams.filter((t)=>t.hide===false)
    res.status(200).json({teams : fileterd})
})

const createTeam = asyncWrapper(async (req,res)=>{
    const {teamCode} = req.body

})
const joinTeam = asyncWrapper(async (req ,res)=>{
    const {teamCode} = req.body
    if(!teamCode){
        return res.status(400).json({msg:"bad req"})
    }
    const team = await Team.findOne({teamCode})
    if(team.status === "private"){
        return res.status(200).json({msg:"Request sent!"})
    }
    team.members.push({user : req.user.userId, role:"member"})
    await team.save()
    res.status(200).json({msg : `${req.user.userName} joined as ${team.member.role}`})
})

const joinViaCode = asyncWrapper(async (req,res)=>{
    const {teamCode, passcode} = req.body
    if(!(teamCode || passcode)){
        return res.status(400).json({msg:"bad req"})
    }
    const team = await Team.findOne({teamCode})
    if(passcode !== team.passcode){
        return res.status(409).json({msg:"Invalid passcode"})
    }
    team.members.push({user : req.user.userId, role:"member"})
    await team.save()
    res.status(200).json({msg : `${req.user.userName} joined as ${team.members.role}`})
})

const setHide = asyncWrapper(async (req,res)=>{
    const {teamCode} = req.body
    const team = await Team.findOne({teamCode})
    if(!team){
        return res.status(400).json({msg:"Team not found"})
    }
    team.hide = true 
    await team.save()
    res.status(200).json({msg:"Hidden successfully"})
})

const setPasscode =asyncWrapper(async (req,res)=>{
    const {teamCode,passcode} = req.body
    const team = await Team.findOne({teamCode})
    if(!team){
        return res.status(400).json({msg: "Team not found"})
    }
    if(team.isLocked){
        return res.status(403).json({msg:"team is already locked."})
    }
    team.passcode = passcode
    team.isLocked = true
    await team.save()
    res.status(201).json({msg:"passcode created"})
})