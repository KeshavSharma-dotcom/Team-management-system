const User = require("../models/user")
const asyncWrapper = require("../middlewares/asyncWrapper")
const Team = require("../models/team")

const allTeams = asyncWrapper(async (req,res)=>{
    const teams = await Team.find({ hide: false })
    res.status(200).json({ teams })
})

const createTeam = asyncWrapper(async (req,res)=>{
    const { teamName, teamCode, status } = req.body
    
    const team = await Team.create({
        teamName,
        teamCode,
        status,
        createdBy: req.user.userId,
        members: [{ user: req.user.userId, role: "owner" }]
    })

    res.status(201).json({ msg: "Team created successfully", team })
})

const joinTeam = asyncWrapper(async (req ,res)=>{
    const { teamCode } = req.body
    if(!teamCode){
        return res.status(400).json({msg:"bad req"})
    }
    
    const team = await Team.findOne({ teamCode })
    if(!team) return res.status(404).json({msg: "Team not found"})

    const isMember = team.members.find(m => m.user.toString() === req.user.userId)
    if(isMember) return res.status(400).json({msg: "Already a member"})

    if(team.status === "private"){
        return res.status(200).json({msg:"Request sent!"})
    }

    team.members.push({ user: req.user.userId, role: "member" })
    await team.save()
    
    res.status(200).json({ msg: "Joined successfully" })
})

const joinViaCode = asyncWrapper(async (req,res)=>{
    const { teamCode, passcode } = req.body
    if(!teamCode || !passcode){
        return res.status(400).json({msg:"bad req"})
    }

    const team = await Team.findOne({ teamCode })
    if(!team) return res.status(404).json({msg: "Team not found"})

    if(passcode !== team.passcode){
        return res.status(401).json({msg:"Invalid passcode"})
    }

    const isMember = team.members.find(m => m.user.toString() === req.user.userId)
    if(isMember) return res.status(400).json({msg: "Already a member"})

    team.members.push({ user: req.user.userId, role: "member" })
    await team.save()
    res.status(200).json({ msg: "Joined successfully via passcode" })
})

const setHide = asyncWrapper(async (req,res)=>{
    const { teamCode } = req.body
    const team = await Team.findOne({ teamCode })
    if(!team){
        return res.status(400).json({msg:"Team not found"})
    }
    
    if(team.createdBy.toString() !== req.user.userId){
        return res.status(403).json({msg: "Only creators can hide teams"})
    }

    team.hide = true 
    await team.save()
    res.status(200).json({msg:"Hidden successfully"})
})

const setPasscode = asyncWrapper(async (req,res)=>{
    const { teamCode, passcode } = req.body
    const team = await Team.findOne({ teamCode })
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

module.exports = {
    allTeams,
    createTeam,
    joinTeam,
    joinViaCode,
    setHide,
    setPasscode
}

const makeRole = asyncWrapper(async (req, res) => {
    const { teamCode, targetUserId, newRole } = req.body
    const team = await Team.findOne({ teamCode })

    if (!team) return res.status(404).json({ msg: "Team not found" })

    if (team.createdBy.toString() !== req.user.userId) {
        return res.status(403).json({ msg: "Only the owner can adjust roles" })
    }

    const member = team.members.find(m => m.user.toString() === targetUserId)
    if (!member) return res.status(404).json({ msg: "User is not a member of this team" })

    member.role = newRole 
    await team.save()

    res.status(200).json({ msg: `User promoted to ${newRole}` })
})

const addTeamMessage = asyncWrapper(async (req, res) => {
    const { teamId, text } = req.body
    const userId = req.user.userId
    
    if (!text) return res.status(400).json({ msg: "Message text is required" })

    const team = await Team.findById(teamId)
    if (!team) return res.status(404).json({ msg: "Team not found" })

    const isMember = team.members.some(m => m.user.toString() === userId)
    if (!isMember) {
        return res.status(403).json({ msg: "You must be a member to discuss here" })
    }

    const newMessage = {
        user: userId,
        userName: req.user.userName, 
        text: text
    }

    team.discussions.push(newMessage)
    await team.save()

    res.status(201).json({ msg: "Message posted", discussion: team.discussions })
})

const getTeamDiscussions = asyncWrapper(async (req, res) => {
    const { teamId } = req.params
    
    const team = await Team.findById(teamId).select("discussions members")
    
    const isMember = team.members.some(m => m.user.toString() === req.user.userId)
    if (!isMember) return res.status(403).json({ msg: "Access denied" })

    res.status(200).json({ discussions: team.discussions })
})

module.exports = {
    allTeams,
    createTeam,
    joinTeam,
    joinViaCode,
    setHide,
    setPasscode,
    makeRole,
    addTeamMessage,
    getTeamDiscussions
}