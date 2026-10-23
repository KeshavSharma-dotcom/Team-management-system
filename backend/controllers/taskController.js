const Task = require("../models/task");
const Team = require("../models/team");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const asyncWrapper = require("../middlewares/asyncWrapper");
const sendResponse = require("../utils/sendResponse");
const AppError = require("../utils/AppError");

const createTask = asyncWrapper(async (req, res) => {
    const { teamId, title, description, dueDate, assignee } = req.body || {};

    if (!teamId || !title) {
        throw new AppError("Team ID and task title are required", 400);
    }

    const currentUserId = req.user?.id || req.user?.userId;
    if (!currentUserId) {
        throw new AppError("Unauthorized action", 401);
    }

    const team = await Team.findById(teamId);
    if (!team) {
        throw new AppError("Team not found", 404);
    }

    const member = team.members.find(
        (m) => m.user.toString() === currentUserId.toString()
    );
    if (!member || (member.role !== "owner" && member.role !== "sub-admin")) {
        throw new AppError("Only owners and sub-admins can create tasks", 403);
    }

    const task = await Task.create({
        team: teamId,
        createdBy: currentUserId,
        title: title.toString().trim(),
        description: description ? description.toString().trim() : "",
        dueDate,
        assignee
    });

    sendResponse(res, 201, "Task created successfully", task);
});

const toggleTaskStatus = asyncWrapper(async (req, res) => {
    const { taskId } = req.params;

    if (!taskId) {
        throw new AppError("Task ID parameter is required", 400);
    }

    const currentUserId = req.user?.id || req.user?.userId;
    if (!currentUserId) {
        throw new AppError("Unauthorized action", 401);
    }

    const task = await Task.findById(taskId);
    if (!task) {
        throw new AppError("Task not found", 404);
    }

    const team = await Team.findById(task.team);
    if (!team) {
        throw new AppError("Team not found", 404);
    }

    const isMember = team.members.some(
        (m) => m.user.toString() === currentUserId.toString()
    );
    if (!isMember) {
        throw new AppError("You are not a member of this team", 403);
    }

    task.isCompleted = !task.isCompleted;
    task.status = task.isCompleted ? "Done" : "To Do";
    task.completedAt = task.isCompleted ? new Date() : undefined;

    await task.save();

    sendResponse(res, 200, "Task status updated", task);
});

const addComment = asyncWrapper(async (req, res) => {
    const { taskId, text } = req.body || {};

    if (!taskId || !text) {
        throw new AppError("Task ID and comment text are required", 400);
    }

    const currentUserId = req.user?.id || req.user?.userId;
    if (!currentUserId) {
        throw new AppError("Unauthorized action", 401);
    }

    const updatedTask = await Task.findByIdAndUpdate(
        taskId,
        {
            $push: {
                comments: {
                    user: currentUserId,
                    text: text.toString().trim()
                }
            }
        },
        { new: true }
    );

    if (!updatedTask) {
        throw new AppError("Task not found", 404);
    }

    sendResponse(res, 200, "Comment added successfully", updatedTask);
});

const getTeamTasks = asyncWrapper(async (req, res) => {
    const { teamId } = req.params;

    if (!teamId) {
        throw new AppError("Team ID parameter is required", 400);
    }

    const currentUserId = req.user?.id || req.user?.userId;
    if (!currentUserId) {
        throw new AppError("Unauthorized action", 401);
    }

    const team = await Team.findById(teamId).select("members");
    if (!team) {
        throw new AppError("Team not found", 404);
    }

    const isMember = team.members.some(
        (m) => m.user.toString() === currentUserId.toString()
    );
    if (!isMember) {
        throw new AppError("Access denied: not a team member", 403);
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 20);
    const skip = (page - 1) * limit;

    const tasks = await Task.find({ team: teamId })
        .populate("assignee", "name avatarColor")
        .sort("-createdAt")
        .skip(skip)
        .limit(limit);

    sendResponse(res, 200, "Tasks retrieved", {
        count: tasks.length,
        page,
        limit,
        tasks
    });
});

const suggestTasks = asyncWrapper(async (req, res) => {
    const { goal } = req.body || {};

    if (!goal || !goal.toString().trim()) {
        throw new AppError("Goal statement is required for AI task generation", 400);
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
        throw new AppError("Gemini API key is not configured in server environment variables", 500);
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const prompt = `You are a professional project manager.
Analyze the following goal: "${goal.toString().trim()}"
Generate exactly 3 actionable tasks.
Return ONLY raw JSON with no Markdown formatting, backticks, or extra commentary.
Format: [{"title": "Task title", "description": "Short details"}]`;

    // Try primary model first, fallback to alternate model string if primary fails
    const modelsToTry = ["gemini-1.5-flash", "gemini-2.5-flash"];
    let rawText = null;
    let lastError = null;

    for (const modelName of modelsToTry) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            rawText = result.response.text();
            if (rawText) break;
        } catch (err) {
            console.error(`Gemini model [${modelName}] failed:`, err.message || err);
            lastError = err;
        }
    }

    if (!rawText) {
        const errorDetail = lastError?.message || "Upstream Gemini service unreachable";
        throw new AppError(`AI Gateway Failure: ${errorDetail}`, 502);
    }

    let suggestions;
    try {
        const cleaned = rawText
            .replace(/^```json/g, "")
            .replace(/^```/g, "")
            .replace(/```$/g, "")
            .trim();
        suggestions = JSON.parse(cleaned);
    } catch (parseErr) {
        throw new AppError("Failed to parse AI output into valid task objects. Please try again.", 502);
    }

    sendResponse(res, 200, "AI suggestions generated", { suggestions });
});
const updateTask = asyncWrapper(async (req, res) => {
    const { taskId } = req.params;

    if (!taskId) {
        throw new AppError("Task ID parameter is required", 400);
    }

    if (!req.body || Object.keys(req.body).length === 0) {
        throw new AppError("Update payload cannot be empty", 400);
    }

    const currentUserId = req.user?.id || req.user?.userId;
    if (!currentUserId) {
        throw new AppError("Unauthorized action", 401);
    }

    const task = await Task.findById(taskId);
    if (!task) {
        throw new AppError("Task not found", 404);
    }

    const team = await Team.findById(task.team);
    if (!team) {
        throw new AppError("Team not found", 404);
    }

    const isMember = team.members.some(
        (m) => m.user.toString() === currentUserId.toString()
    );
    if (!isMember) {
        throw new AppError("You are not a member of this team", 403);
    }

    const allowedUpdates = ["status", "assignee", "dueDate", "title", "description"];
    allowedUpdates.forEach((field) => {
        if (req.body[field] !== undefined) {
            task[field] = req.body[field];
        }
    });

    if (task.status === "Done") {
        task.isCompleted = true;
        task.completedAt = new Date();
    } else if (req.body.status) {
        task.isCompleted = false;
        task.completedAt = undefined;
    }

    await task.save();
    await task.populate("assignee", "name avatarColor");

    sendResponse(res, 200, "Task updated successfully", task);
});

module.exports = {
    createTask,
    toggleTaskStatus,
    addComment,
    getTeamTasks,
    suggestTasks,
    updateTask
};