const Task = require("../models/task")
const Team = require("../models/team")
const { GoogleGenerativeAI } = require("@google/generative-ai")
const genAI = new GoogleGenerativeAI(process.env.API_KEY)
const asyncWrapper = require("../middlewares/asyncWrapper")

const createTask = asyncWrapper(async (req, res) => {
    const { teamId, title, description } = req.body
    
    const team = await Team.findById(teamId)
    if (!team) return res.status(404).json({ msg: "Team not found" })

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
    if (!task) return res.status(404).json({ msg: "Task not found" })
    
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
    if (!task) return res.status(404).json({ msg: "Task not found" })
    
    task.comments.push({ user: req.user.userId, text })
    await task.save()
    res.status(200).json({ msg: "Comment added" })
})

const suggestTasks = asyncWrapper(async (req, res) => {
    const { goal } = req.body
    if (!goal) return res.status(400).json({ msg: "Please provide a goal" })

    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash", 
        generationConfig: { 
            responseMimeType: "application/json",
            temperature: 0.7 
        }
    })

    const prompt = `You are a professional project manager. 
    Analyze the following goal: "${goal}"
    Generate exactly 3 actionable tasks.
    Return the response as a valid JSON array of objects with "title" and "description" keys.
    Format: [{"title": "...", "description": "..."}]`

    try {
        const result = await model.generateContent(prompt)
        const responseText = result.response.text()
        
        const cleanedJson = responseText.replace(/```json|```/g, "").trim()
        const suggestedTasks = JSON.parse(cleanedJson)

        res.status(200).json({ suggestions: suggestedTasks })
    } catch (error) {
        console.error("Gemini API Error:", error)
        res.status(500).json({ msg: "AI failed to generate tasks. Please try again." })
    }
})

module.exports = {
    createTask,
    toggleTaskStatus,
    addComment,
    suggestTasks 
}