const taskService = require("../services/taskService");
const asyncWrapper = require("../middlewares/asyncWrapper");
const sendResponse = require("../utils/sendResponse");

const createTask = asyncWrapper(async (req, res) => {
    const { teamId, title, description, dueDate } = req.body;
    const task = await taskService.createTask(req.user.userId, teamId, { title, description, dueDate });
    sendResponse(res, 201, "Task created successfully", task);
});

const toggleTaskStatus = asyncWrapper(async (req, res) => {
    const task = await taskService.toggleStatus(req.user.userId, req.params.taskId);
    sendResponse(res, 200, "Task status updated", task);
});

const addComment = asyncWrapper(async (req, res) => {
    const { taskId, text } = req.body;
    await taskService.addComment(req.user.userId, taskId, text);
    sendResponse(res, 200, "Comment added");
});

const getTeamTasks = asyncWrapper(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const tasks = await taskService.getTeamTasks(req.user.userId, req.params.teamId, page, limit);
    sendResponse(res, 200, "Tasks retrieved", { count: tasks.length, page, limit, tasks });
});

const suggestTasks = asyncWrapper(async (req, res) => {
    const suggestions = await taskService.suggestTasks(req.body.goal);
    sendResponse(res, 200, "AI suggestions generated", { suggestions });
});

const updateTask = asyncWrapper(async (req, res) => {
    const task = await taskService.updateTask(req.user.userId, req.params.taskId, req.body);
    sendResponse(res, 200, "Task updated", task);
});

module.exports = { createTask, toggleTaskStatus, addComment, getTeamTasks, suggestTasks, updateTask };