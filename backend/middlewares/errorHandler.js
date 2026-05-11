const errorHandler = (err, req, res, next) => {
    // Determine status code — prefer err.statusCode (AppError), fallback to 500
    const statusCode = err.statusCode || 500;
    let message = err.message || 'Something went wrong, please try again later';

    // Mongoose validation errors → 400
    if (err.name === 'ValidationError') {
        message = Object.values(err.errors).map((e) => e.message).join(', ');
        return res.status(400).json({ success: false, message });
    }

    // MongoDB duplicate key → 400
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        message = `${field.charAt(0).toUpperCase() + field.slice(1)} is already in use`;
        return res.status(400).json({ success: false, message });
    }

    // JWT errors → 401
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token has expired, please log in again' });
    }

    return res.status(statusCode).json({ success: false, message });
};

module.exports = errorHandler;