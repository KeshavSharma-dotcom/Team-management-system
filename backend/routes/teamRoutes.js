const express = require("express")
const router = express.Router()
const { authenticateUser } = require("../middlewares/authMiddleware")
const {
    allTeams,
    createTeam,
    joinTeam,
    joinViaCode,
    setHide,
    setPasscode,
    makeRole,
    addTeamMessage,
    getTeamDiscussions,
    summarizeDiscussion,
    updateTeamSettings
} = require("../controllers/teamController")

router.get("/all", authenticateUser, allTeams)
router.post("/create", authenticateUser, createTeam)
router.post("/join", authenticateUser, joinTeam)
router.post("/join-code", authenticateUser, joinViaCode)
router.patch("/hide", authenticateUser, setHide)
router.patch("/lock", authenticateUser, setPasscode)
router.patch("/role", authenticateUser, makeRole)
router.get("/:teamId/chat", authenticateUser, getTeamDiscussions)
router.post("/chat", authenticateUser, addTeamMessage)
router.get("/:teamId/summarize", authenticateUser, summarizeDiscussion)
router.patch("/:teamId/settings", authenticateUser, updateTeamSettings)

module.exports = router