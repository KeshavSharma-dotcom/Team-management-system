const express = require("express")
const router = express.Router()
const { authenticateUser } = require("../middlewares/authMiddleware")
const {
    createTask,
    toggleTaskStatus,
    addComment,
    suggestTasks 
} = require("../controllers/taskController")

router.post("/create", authenticateUser, createTask)
router.patch("/:taskId/toggle", authenticateUser, toggleTaskStatus)
router.post("/comment", authenticateUser, addComment)
router.post("/ai-suggest", authenticateUser, suggestTasks)

module.exports = router