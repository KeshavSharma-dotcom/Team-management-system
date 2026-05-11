const User = require("../models/user");
const AppError = require("../utils/AppError");

class UserService {
    async updateProfile(userId, updateData) {
        const { username, bio, contact, location, skills, socialLinks, bannerUrl } = updateData;

        if (username) {
            const existingUsername = await User.findOne({ username, _id: { $ne: userId } });
            if (existingUsername) throw new AppError("Username already taken", 409);
        }

        const updateObj = {
            username,
            "profile.bio": bio,
            "profile.contact": contact,
            "profile.location": location,
            "profile.skills": skills,
            "profile.bannerUrl": bannerUrl
        };

        if (socialLinks) {
            if (socialLinks.github) updateObj["profile.socialLinks.github"] = socialLinks.github;
            if (socialLinks.linkedin) updateObj["profile.socialLinks.linkedin"] = socialLinks.linkedin;
            if (socialLinks.website) updateObj["profile.socialLinks.website"] = socialLinks.website;
        }

        return await User.findByIdAndUpdate(
            userId,
            { $set: updateObj },
            { new: true, runValidators: true }
        ).select("-password -otp -secondaryOtp");
    }

    async getMe(userId) {
        return await User.findById(userId).select("-password -otp -secondaryOtp");
    }

    async storeSecurityKeys(userId, keyData) {
        const { publicKey, encryptedPrivateKey, iv, salt } = keyData;
        return await User.findByIdAndUpdate(userId, {
            publicKey,
            encryptedPrivateKey,
            "keyMetadata.iv": iv,
            "keyMetadata.salt": salt
        }, { new: true });
    }
}

module.exports = new UserService();
