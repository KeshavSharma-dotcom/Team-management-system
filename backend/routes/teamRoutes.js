const express = require("express")
const router = express.Router()
const { authenticateUser } = require("../middlewares/authMiddleware")
const {
    allTeams, createTeam, myTeams, joinTeam,
    getTeamDiscussions, addTeamMessage, summarizeDiscussion,
    updateTeamSettings, makeRole,
    requestToJoin, getJoinRequests, respondToRequest
} = require("../controllers/teamController")

router.get("/all", authenticateUser, allTeams)
router.post("/create", authenticateUser, createTeam)
router.post("/join", authenticateUser, joinTeam)
router.get("/my-teams", authenticateUser, myTeams)
router.patch("/role", authenticateUser, makeRole)
router.post("/chat", authenticateUser, addTeamMessage)
router.get("/:teamId/chat", authenticateUser, getTeamDiscussions)
router.get("/:teamId/summarize", authenticateUser, summarizeDiscussion)
router.patch("/:teamId/settings", authenticateUser, updateTeamSettings)
router.post("/:teamId/request-join", authenticateUser, requestToJoin)
router.get("/:teamId/join-requests", authenticateUser, getJoinRequests)
router.patch("/:teamId/respond-request", authenticateUser, respondToRequest)

module.exports = router