const Task = require("../models/task")
const Team = require("../models/team")

const createTask = asyncWrapper(async (req, res) => {
    const { teamId, title, description } = req.body
    
    const team = await Team.findById(teamId)
    const userInTeam = team.members.find(m => m.user.toString() === req.user.userId)

    if (!userInTeam || (userInTeam.role !== "owner" && userInTeam.role !== "sub-admin")) {
        return res.status(403).json({ msg: "Permission denied to create tasks" })
    }

    const task = await Task.create({ team: teamId, title, description })
    res.status(201).json(task)
})

const toggleTaskStatus = asyncWrapper(async (req, res) => {
    const { taskId } = req.params
    const task = await Task.findById(taskId)
    
    const team = await Team.findById(task.team)
    const isMember = team.members.some(m => m.user.toString() === req.user.userId)

    if (!isMember) return res.status(403).json({ msg: "Not a team member" })

    task.isCompleted = !task.isCompleted
    await task.save()
    res.status(200).json({ msg: "Task status updated", task })
})

const addComment = asyncWrapper(async (req, res) => {
    const { taskId, text } = req.body
    const task = await Task.findById(taskId)
    
    await task.comments.push({ user: req.user.userId, text })
    await task.save()
    res.status(200).json({ msg: "Comment added" })
})