const Team = require("../models/team");
const Message = require("../models/message");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const AppError = require("../utils/AppError");

class TeamService {

    async getAllPublicTeams(page = 1, limit = 12) {
        const skip = (page - 1) * limit;
        return await Team.find({ hide: false, status: "public" })
            .populate("createdBy", "name")
            .sort("-createdAt")
            .skip(skip)
            .limit(limit);
    }

    async getUserTeams(userId, page = 1, limit = 12) {
        const skip = (page - 1) * limit;
        return await Team.find({ "members.user": userId })
            .populate("members.user", "name email avatarColor")
            .sort("-updatedAt")
            .skip(skip)
            .limit(limit);
    }

    async createTeam(userId, teamData) {
        return await Team.create({
            ...teamData,
            createdBy: userId,
            members: [{ user: userId, role: "owner" }]
        });
    }

    async joinTeam(userId, teamCode, passcode = null) {
        const team = await Team.findOne({ teamCode });
        if (!team) throw new AppError("Team not found", 404);

        const isMember = team.members.find(m => m.user.toString() === userId);
        if (isMember) throw new AppError("You are already a member of this team", 409);

        if (team.status === "private") {
            if (!passcode) return { status: "requires_passcode" };
            if (passcode !== team.passcode) throw new AppError("Invalid passcode", 401);
        }

        await Team.updateOne(
            { _id: team._id },
            { $push: { members: { user: userId, role: "member" } } }
        );
        return { status: "success" };
    }

    async getTeamDetails(teamId, userId) {
        const team = await Team.findById(teamId)
            .populate("members.user", "name email avatarColor");

        if (!team) throw new AppError("Team not found", 404);

        // Self-repair: if members array is empty, restore creator
        if (team.members.length === 0) {
            team.members.push({ user: team.createdBy, role: "owner" });
            await team.save();
            await team.populate("members.user", "name email avatarColor");
        }

        const isMember = team.members.some(m => m.user._id.toString() === userId);
        if (!isMember) throw new AppError("Access denied: you are not a member of this team", 403);

        const teamObj = team.toObject();
        teamObj.discussions = await Message.find({ team: teamId })
            .populate("user", "name avatarColor")
            .sort("sentAt");

        return teamObj;
    }

    async updateSettings(teamId, userId, settings) {
        const team = await Team.findById(teamId);
        if (!team) throw new AppError("Team not found", 404);
        if (team.createdBy.toString() !== userId) throw new AppError("Only the owner can update settings", 403);

        const { teamName, description, status, hide, passcode } = settings;
        if (teamName) team.teamName = teamName;
        if (typeof description !== 'undefined') team.description = description;
        if (status) team.status = status;
        if (typeof hide !== 'undefined') team.hide = hide;
        // Only update passcode when a non-empty value is provided.
        // An empty string means "leave unchanged" — prevents Mongoose minlength error.
        if (passcode && passcode.trim().length > 0) {
            if (passcode.trim().length < 8) throw new AppError("Passcode must be at least 8 characters", 400);
            team.passcode = passcode.trim();
        }

        await team.save();
        return team;
    }

    async updateMemberRole(teamId, requesterId, targetUserId, newRole) {
        const team = await Team.findById(teamId);
        if (!team) throw new AppError("Team not found", 404);
        if (team.createdBy.toString() !== requesterId) throw new AppError("Only the owner can change roles", 403);

        const member = team.members.find(m => m.user.toString() === targetUserId);
        if (!member) throw new AppError("User is not a member of this team", 404);

        member.role = newRole;
        await team.save();
        return { role: newRole };
    }

    async addMessage(teamId, userId, userName, text) {
        const team = await Team.findById(teamId);
        if (!team) throw new AppError("Team not found", 404);

        const isMember = team.members.some(m => m.user.toString() === userId);
        if (!isMember) throw new AppError("You must be a member to send messages", 403);

        await Message.create({ team: teamId, user: userId, userName, text });
    }

    async summarizeDiscussion(teamId) {
        const team = await Team.findById(teamId);
        if (!team) throw new AppError("Team not found", 404);

        const messages = await Message.find({ team: teamId }).sort("-sentAt").limit(20);
        if (messages.length === 0) throw new AppError("No messages to summarize yet — start the conversation first!", 400);

        const messagesText = messages.reverse().map(m => m.text).join("\n");
        const genAI = new GoogleGenerativeAI(process.env.API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Summarize the following team discussion into 3 short bullet points:\n${messagesText}`;

        const result = await model.generateContent(prompt);
        return result.response.text();
    }

    async requestToJoin(userId, teamId) {
        const team = await Team.findById(teamId);
        if (!team) throw new AppError("Team not found", 404);

        const isMember = team.members.some(m => m.user.toString() === userId);
        if (isMember) throw new AppError("You are already a member", 409);

        const hasPending = team.joinRequests.some(r => r.user.toString() === userId && r.status === "pending");
        if (hasPending) throw new AppError("You already have a pending request", 409);

        await Team.updateOne(
            { _id: team._id },
            { $push: { joinRequests: { user: userId, status: "pending" } } }
        );
        return { message: "Join request sent successfully" };
    }

    async getJoinRequests(teamId, requesterId) {
        const team = await Team.findById(teamId).populate("joinRequests.user", "name email avatarColor");
        if (!team) throw new AppError("Team not found", 404);

        const isAdmin = team.members.some(
            m => String(m.user) === requesterId && ["owner", "sub-admin"].includes(m.role)
        );
        if (!isAdmin) throw new AppError("Access denied", 403);

        return team.joinRequests.filter(r => r.status === "pending");
    }

    async respondToRequest(teamId, requesterId, targetUserId, action) {
        const team = await Team.findById(teamId);
        if (!team) throw new AppError("Team not found", 404);

        const isAdmin = team.members.some(
            m => m.user.toString() === requesterId && ["owner", "sub-admin"].includes(m.role)
        );
        if (!isAdmin) throw new AppError("Access denied", 403);

        const request = team.joinRequests.find(r => r.user.toString() === targetUserId && r.status === "pending");
        if (!request) throw new AppError("Request not found", 404);

        if (action === "approve") {
            await Team.updateOne(
                { _id: teamId, "joinRequests.user": targetUserId },
                { 
                    $set: { "joinRequests.$.status": "approved" },
                    $push: { members: { user: targetUserId, role: "member" } }
                }
            );
        } else {
            await Team.updateOne(
                { _id: teamId, "joinRequests.user": targetUserId },
                { 
                    $set: { "joinRequests.$.status": "rejected" }
                }
            );
        }

        return { message: action === "approve" ? "Member approved successfully" : "Request rejected" };
    }
}

module.exports = new TeamService();
