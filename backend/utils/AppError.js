/**
 * Custom operational error class that carries an HTTP status code.
 * Use this instead of plain `throw new Error()` in services so that
 * the global errorHandler can set the correct HTTP status automatically.
 */
class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
