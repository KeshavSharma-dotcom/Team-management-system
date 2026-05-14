const parseList = (value, fallback = []) => {
    if (!value) return fallback
    return value
        .split(",")
        .map(item => item.trim())
        .filter(Boolean)
}

const parseNumber = (value, fallback) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

module.exports = {
    env: process.env.NODE_ENV || "development",
    server: {
        port: parseNumber(process.env.PORT, 5000),
        jsonLimit: process.env.JSON_LIMIT || "10mb"
    },
    cors: {
        allowedOrigins: parseList(process.env.ALLOWED_ORIGIN, ["http://localhost:5173", "http://localhost:3000"])
    },
    database: {
        mongoUrl: process.env.MONGO_URL
    },
    email: {
        service: process.env.EMAIL_SERVICE || "gmail",
        user: process.env.EMAIL_NAME,
        password: process.env.EMAIL_PASSWORD
    },
    rateLimit: {
        generalWindowMs: parseNumber(process.env.GENERAL_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
        generalMax: parseNumber(process.env.GENERAL_RATE_LIMIT_MAX, 100),
        authWindowMs: parseNumber(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
        authMax: parseNumber(process.env.AUTH_RATE_LIMIT_MAX, 10)
    },
    integrations: {
        resumeAnalysisUrl: process.env.RESUME_ANALYSIS_SERVICE_URL || process.env.AI_SERVICE_URL || "http://localhost:8000",
        resumeAnalysisTimeoutMs: parseNumber(process.env.RESUME_ANALYSIS_TIMEOUT_MS, 60000)
    }
}
