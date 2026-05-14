const nodemailer = require("nodemailer")
const appConfig = require("../config/appConfig")
const logger = require("./logger")

const transport = nodemailer.createTransport({
        service: appConfig.email.service,
        auth:{
            user: appConfig.email.user,
            pass: appConfig.email.password
        }
    })

const sendEmail = async ({to, subject, html, text})=>{
    
    const mailOptions = {
        from : `"Team Management Support" <${appConfig.email.user}>`,
        to,
        subject,
        html,
        text
    }
    try{
        return await transport.sendMail(mailOptions)
    }catch(err){
        logger.error(`Email delivery failed: ${err.code || err.name || "unknown"}`)
        throw new Error("Failed to send the Email, try again or use a different email")
    }
    
}

module.exports = sendEmail
