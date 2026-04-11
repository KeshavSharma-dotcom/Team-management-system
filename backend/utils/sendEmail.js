const nodemailer = require("nodemailer")

const transport = nodemailer.createTransport({
        service:"gmail",
        auth:{
            user:process.env.EMAIL_NAME,
            pass:process.env.EMAIL_PASSWORD
        }
    })

const sendEmail = async ({to,subject,html})=>{
    
    const mailOptions = {
        from : `"Team Management Support" <${process.env.EMAIL_NAME}>`,
        to,
        subject,
        html
    }
    try{
        return transport.sendMail(mailOptions)
    }catch(err){
        console.error(`Email Error : ${err}`)
        throw new Error("Failed to send the Email, try again or use a different email")
    }
    
}

module.exports = sendEmail