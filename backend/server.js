const express = require("express");
const logger = require("./utils/logger");
require("dotenv").config();

const appConfig = require("./config/appConfig");
const connectDB = require("./config/db");
const app = express();

const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const morgan = require("morgan");
const errorHandler = require("./middlewares/errorHandler");
const notFound = require("./middlewares/notFound");

const AuthRoute = require("./routes/authRoutes");
const teamRoutes = require("./routes/teamRoutes");
const taskRoutes = require("./routes/taskRoutes");
const userRoutes = require("./routes/userRoutes");

const port = appConfig?.server?.port || process.env.PORT || 5000;

process.on("uncaughtException", (err) => {
    logger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
    process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
    logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});

connectDB();

app.use(helmet());
app.use(compression());

if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
} else {
    app.use(morgan("combined"));
}

const allowedOrigins = appConfig?.cors?.allowedOrigins || [];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
            callback(null, true);
        } else {
            callback(new Error("CORS policy: origin not allowed"));
        }
    },
    credentials: true
}));

app.use(express.json({ limit: appConfig?.server?.jsonLimit || "10mb" }));
app.use(express.urlencoded({ extended: true, limit: appConfig?.server?.jsonLimit || "10mb" }));

const generalLimiter = rateLimit({
    windowMs: appConfig?.rateLimit?.generalWindowMs || 15 * 60 * 1000,
    max: appConfig?.rateLimit?.generalMax || 100,
    message: { success: false, message: "Too many requests, please try again after 15 minutes" },
    standardHeaders: true,
    legacyHeaders: false
});

const authLimiter = rateLimit({
    windowMs: appConfig?.rateLimit?.authWindowMs || 15 * 60 * 1000,
    max: appConfig?.rateLimit?.authMax || 10,
    message: { success: false, message: "Too many auth attempts, please try again after 15 minutes" },
    standardHeaders: true,
    legacyHeaders: false
});

app.get("/api/health", (req, res) => {
    res.status(200).json({ success: true, message: "Server is healthy", uptime: process.uptime() });
});

app.use("/api/v1/auth", authLimiter, AuthRoute);
app.use("/api/v1/teams", generalLimiter, teamRoutes);
app.use("/api/v1/tasks", generalLimiter, taskRoutes);
app.use("/api/v1/user", generalLimiter, userRoutes);

app.use(notFound);
app.use(errorHandler);

const server = app.listen(port, () => {
    logger.info(`Server live on http://localhost:${port}`);
});

const gracefulShutdown = (signal) => {
    logger.info(`${signal} signal received: closing HTTP server`);
    server.close(() => {
        logger.info("HTTP server closed");
        process.exit(0);
    });
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));