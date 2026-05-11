const express = require("express")
const router = express.Router()
const { authenticateUser } = require("../middlewares/authMiddleware")
const {
    createTask,
    toggleTaskStatus,
    addComment,
    suggestTasks,
    getTeamTasks,
    updateTask
} = require("../controllers/taskController")

router.get("/team/:teamId", authenticateUser, getTeamTasks)
router.post("/create", authenticateUser, createTask)
router.patch("/:taskId/toggle", authenticateUser, toggleTaskStatus)
router.post("/comment", authenticateUser, addComment)
router.post("/ai-suggest", authenticateUser, suggestTasks)
router.patch("/:taskId", authenticateUser, updateTask)

module.exports = router