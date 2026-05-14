const jwt = require("jsonwebtoken")

const authenticateUser = async (req, res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: "Authentication invalid: no token provided" })
    }

    const token = authHeader.split(' ')[1]

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        req.user = { userId: payload.userId, role: payload.role, userName: payload.userName }
        next()
    } catch (error) {
        return res.status(401).json({ success: false, message: "Authentication invalid: token expired or invalid" })
    }
}

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: "Unauthorized to access this route" })
        }
        next()
    }
}

module.exports = { authenticateUser, authorizeRoles }