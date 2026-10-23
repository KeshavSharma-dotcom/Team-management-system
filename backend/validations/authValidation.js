const Joi = require('joi');

const registerSchema = Joi.object({
    name: Joi.string().trim().min(2).max(50).required(),
    email: Joi.string().email().trim().lowercase().required(),
    password: Joi.string().min(8).max(128).required(),
    role: Joi.string().valid('admin', 'member').default('member')
});

const loginSchema = Joi.object({
    email: Joi.string().email().trim().lowercase().required(),
    password: Joi.string().required()
});

const verifyOtpSchema = Joi.object({
    email: Joi.string().email().trim().lowercase().required(),
    otp: Joi.string().trim().length(6).regex(/^\d+$/).required().messages({
        "string.pattern.base": "OTP must consist of 6 digits"
    })
});

const resendOtpSchema = Joi.object({
    email: Joi.string().email().trim().lowercase().required()
});

const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().trim().lowercase().required()
});

const resetPasswordSchema = Joi.object({
    email: Joi.string().email().trim().lowercase().required(),
    otp: Joi.string().trim().length(6).regex(/^\d+$/).required().messages({
        "string.pattern.base": "OTP must consist of 6 digits"
    }),
    password: Joi.string().min(8).max(128).optional(),
    newPassword: Joi.string().min(8).max(128).optional()
}).or('password', 'newPassword');

module.exports = {
    registerSchema,
    loginSchema,
    verifyOtpSchema,
    resendOtpSchema,
    forgotPasswordSchema,
    resetPasswordSchema
};