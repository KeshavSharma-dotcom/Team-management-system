module.exports = {
    JWT: {
        EXPIRES_IN: process.env.JWT_DURATION || '1d',
        SECRET: process.env.JWT_SECRET
    },
    ROLES: {
        ADMIN: 'admin',
        MEMBER: 'member',
        OWNER: 'owner',
        SUB_ADMIN: 'sub-admin'
    },
    TEAM_STATUS: {
        PUBLIC: 'public',
        PRIVATE: 'private'
    },
    OTP_EXPIRY_MINUTES: 10,
    PAGINATION: {
        DEFAULT_LIMIT: 20
    }
};
