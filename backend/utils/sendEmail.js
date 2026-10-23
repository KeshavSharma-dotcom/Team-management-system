const nodemailer = require("nodemailer");
const appConfig = require("../config/appConfig");
const AppError = require("../utils/AppError");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async ({ to, subject, html, text }) => {
    if (!to || !subject || (!html && !text)) {
        throw new AppError("Recipient email, subject, and body are required", 400);
    }

    const mailOptions = {
        from: `"Team Management" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
        text: text || (html ? html.replace(/<[^>]+>/g, " ").trim() : "")
    };

    try {
        return await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Email send error:", error.message);
        throw new AppError("Failed to send email. Please try again later.", 500);
    }
};

module.exports = sendEmail;