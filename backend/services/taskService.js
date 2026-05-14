const Task = require("../models/task");
const Team = require("../models/team");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const AppError = require("../utils/AppError");

class TaskService {

    async createTask(userId, teamId, taskData) {
        const team = await Team.findById(teamId);
        if (!team) throw new AppError("Team not found", 404);

        const member = team.members.find(m => m.user.toString() === userId);
        if (!member || (member.role !== "owner" && member.role !== "sub-admin")) {
            throw new AppError("Only owners and sub-admins can create tasks", 403);
        }

        return await Task.create({ team: teamId, createdBy: userId, ...taskData });
    }

    async toggleStatus(userId, taskId) {
        const task = await Task.findById(taskId);
        if (!task) throw new AppError("Task not found", 404);

        const team = await Team.findById(task.team);
        if (!team) throw new AppError("Team not found", 404);

        const isMember = team.members.some(m => m.user.toString() === userId);
        if (!isMember) throw new AppError("You are not a member of this team", 403);

        task.isCompleted = !task.isCompleted;
        task.status = task.isCompleted ? 'Done' : 'To Do';
        if (task.isCompleted) task.completedAt = new Date();
        else task.completedAt = undefined;
        await task.save();
        return task;
    }

    async updateTask(userId, taskId, updates) {
        const task = await Task.findById(taskId);
        if (!task) throw new AppError("Task not found", 404);

        const team = await Team.findById(task.team);
        if (!team) throw new AppError("Team not found", 404);

        const isMember = team.members.some(m => m.user.toString() === userId);
        if (!isMember) throw new AppError("You are not a member of this team", 403);

        const allowedUpdates = ['status', 'assignee', 'dueDate', 'title', 'description'];
        allowedUpdates.forEach(field => {
            if (updates[field] !== undefined) {
                task[field] = updates[field];
            }
        });

        if (task.status === 'Done') {
            task.isCompleted = true;
            task.completedAt = new Date();
        } else if (updates.status) {
            task.isCompleted = false;
            task.completedAt = undefined;
        }

        await task.save();
        await task.populate('assignee', 'name avatarColor');
        return task;
    }

    async addComment(userId, taskId, text) {
        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            { $push: { comments: { user: userId, text } } },
            { new: true }
        );
        if (!updatedTask) throw new AppError("Task not found", 404);
        return updatedTask;
    }

    async getTeamTasks(userId, teamId, page = 1, limit = 20) {
        const team = await Team.findById(teamId).select("members");
        if (!team) throw new AppError("Team not found", 404);

        const isMember = team.members.some(m => m.user.toString() === userId);
        if (!isMember) throw new AppError("Access denied: not a team member", 403);

        const skip = (page - 1) * limit;
        return await Task.find({ team: teamId })
            .populate('assignee', 'name avatarColor')
            .sort("-createdAt")
            .skip(skip)
            .limit(limit);
    }

    async suggestTasks(goal) {
        if (!goal) throw new AppError("Please provide a goal", 400);

        const genAI = new GoogleGenerativeAI(process.env.API_KEY);
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash @latest",
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.7
            }
        });

        const prompt = `You are a professional project manager.
Analyze the following goal: "${goal}"
Generate exactly 3 actionable tasks.
Return ONLY a valid JSON array with "title" and "description" keys.
Format: [{"title": "...", "description": "..."}]`;

        const result = await model.generateContent(prompt);
        const cleaned = result.response.text().replace(/```json|```/g, "").trim();
        try {
            return JSON.parse(cleaned);
        } catch {
            throw new AppError("AI returned an unreadable format. Please try rephrasing your goal.", 502);
        }
    }
}

module.exports = new TaskService();
