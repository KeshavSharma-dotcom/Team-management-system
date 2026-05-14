const express = require("express")
const logger = require("./utils/logger")
require("dotenv").config()

const appConfig = require("./config/appConfig")
const connectDB = require("./config/db")
const app = express()

const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const compression = require("compression")
const morgan = require("morgan")
const errorHandler = require("./middlewares/errorHandler")
const notFound = require("./middlewares/notFound")

const AuthRoute = require("./routes/authRoutes")
const teamRoutes = require("./routes/teamRoutes")
const taskRoutes = require("./routes/taskRoutes")
const userRoutes = require("./routes/userRoutes")
const resumeRoutes = require("./routes/resumeRoutes")

const port = appConfig.server.port

connectDB()

// Security & Performance
app.use(helmet())
app.use(compression())
app.use(morgan("dev"))

// CORS — restrict to frontend origin in production
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || appConfig.cors.allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error("CORS policy: origin not allowed"))
        }
    },
    credentials: true
}))

app.use(express.json({ limit: appConfig.server.jsonLimit }))

// General rate limiter — 100 requests per 15 min per IP
const generalLimiter = rateLimit({
    windowMs: appConfig.rateLimit.generalWindowMs,
    max: appConfig.rateLimit.generalMax,
    message: { success: false, message: "Too many requests, please try again after 15 minutes" },
    standardHeaders: true,
    legacyHeaders: false
})

// Stricter limiter for auth routes — 10 per 15 min
const authLimiter = rateLimit({
    windowMs: appConfig.rateLimit.authWindowMs,
    max: appConfig.rateLimit.authMax,
    message: { success: false, message: "Too many auth attempts, please try again after 15 minutes" },
    standardHeaders: true,
    legacyHeaders: false
})

app.use("/api", generalLimiter)
app.use("/api/v1/auth", authLimiter)

// Routes
app.use("/api/v1/auth", AuthRoute)
app.use("/api/v1/teams", teamRoutes)
app.use("/api/v1/tasks", taskRoutes)
app.use("/api/v1/user", userRoutes)
app.use("/api/v1/resume", resumeRoutes)

// Health check
app.get("/api/health", (req, res) => {
    res.status(200).json({ success: true, message: "Server is healthy", uptime: process.uptime() })
})

app.use(notFound)
app.use(errorHandler)

app.listen(port, () => {
    logger.info(`Server live on http://localhost:${port}`)
})
