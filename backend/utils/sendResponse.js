/**
 * Standardized JSON response helper.
 * Ensures all endpoints return: { success, message, data }
 */
const sendResponse = (res, statusCode, message, data = null) => {
    const payload = { success: true, message };
    if (data !== null) payload.data = data;
    return res.status(statusCode).json(payload);
};

module.exports = sendResponse;
