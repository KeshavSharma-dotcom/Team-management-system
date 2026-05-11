const teamService = require("../services/teamService");
const asyncWrapper = require("../middlewares/asyncWrapper");
const sendResponse = require("../utils/sendResponse");

const allTeams = asyncWrapper(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const teams = await teamService.getAllPublicTeams(page, limit);
    sendResponse(res, 200, "Teams retrieved", { count: teams.length, page, limit, teams });
});

const createTeam = asyncWrapper(async (req, res) => {
    const team = await teamService.createTeam(req.user.userId, req.body);
    sendResponse(res, 201, "Team created successfully", { team });
});

const myTeams = asyncWrapper(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const teams = await teamService.getUserTeams(req.user.userId, page, limit);
    sendResponse(res, 200, "Your teams retrieved", { count: teams.length, page, limit, teams });
});

const joinTeam = asyncWrapper(async (req, res) => {
    const { teamCode, passcode } = req.body;
    const result = await teamService.joinTeam(req.user.userId, teamCode, passcode);
    if (result.status === "requires_passcode") {
        return res.status(200).json({ success: true, status: "requires_passcode", message: "This team is private. Enter the passcode." });
    }
    sendResponse(res, 200, "Joined team successfully");
});

const getTeamDiscussions = asyncWrapper(async (req, res) => {
    const team = await teamService.getTeamDetails(req.params.teamId, req.user.userId);
    sendResponse(res, 200, "Team details retrieved", team);
});

const addTeamMessage = asyncWrapper(async (req, res) => {
    const discussions = await teamService.addMessage(req.body.teamId, req.user.userId, req.user.userName, req.body.text);
    sendResponse(res, 201, "Message posted");
});

const summarizeDiscussion = asyncWrapper(async (req, res) => {
    const summary = await teamService.summarizeDiscussion(req.params.teamId);
    sendResponse(res, 200, "Summary generated", { summary });
});

const updateTeamSettings = asyncWrapper(async (req, res) => {
    const team = await teamService.updateSettings(req.params.teamId, req.user.userId, req.body);
    sendResponse(res, 200, "Settings updated successfully", { team });
});

const makeRole = asyncWrapper(async (req, res) => {
    const { teamId, targetUserId, newRole } = req.body;
    const result = await teamService.updateMemberRole(teamId, req.user.userId, targetUserId, newRole);
    sendResponse(res, 200, `Role updated to ${newRole}`, result);
});

const requestToJoin = asyncWrapper(async (req, res) => {
    const result = await teamService.requestToJoin(req.user.userId, req.params.teamId);
    sendResponse(res, 200, result.message);
});

const getJoinRequests = asyncWrapper(async (req, res) => {
    const requests = await teamService.getJoinRequests(req.params.teamId, req.user.userId);
    sendResponse(res, 200, "Join requests retrieved", { requests });
});

const respondToRequest = asyncWrapper(async (req, res) => {
    const { targetUserId, action } = req.body;
    const result = await teamService.respondToRequest(req.params.teamId, req.user.userId, targetUserId, action);
    sendResponse(res, 200, result.message);
});

module.exports = {
    allTeams, createTeam, myTeams, joinTeam,
    getTeamDiscussions, addTeamMessage, summarizeDiscussion,
    updateTeamSettings, makeRole,
    requestToJoin, getJoinRequests, respondToRequest
};