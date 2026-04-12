const jwt = require("jsonwebtoken")

const authenticateUser = async (req, res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ msg: "Authentication invalid (No Token)" })
    }

    const token = authHeader.split(' ')[1]

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        req.user = { userId: payload.userId, role: payload.role }
        next()
    } catch (error) {
        return res.status(401).json({ msg: "Authentication invalid (Token Expired or Fake)" })
    }
}

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ msg: "Unauthorized to access this route" })
        }
        next()
    }
}

module.exports = { authenticateUser, authorizeRoles }