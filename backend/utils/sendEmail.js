const nodemailer = require("nodemailer")

const sendEmail = async ({to,subject,html})=>{
    const transport = nodemailer.createTransport({
        service:"gmail",
        auth:{
            user:process.env.EMAIL_NAME,
            pass:process.env.EMAIL_PASSWORD
        }
    })
    const mailOptions = {
        from : `"Team Management Support" <${process.env.EMAIL_NAME}>`,
        to,
        subject,
        html
    }
    return transport.sendMail(mailOptions)
}

module.exports = sendEmail