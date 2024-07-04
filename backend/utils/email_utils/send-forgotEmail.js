const nodemailer = require('nodemailer');
const jwt = require("jsonwebtoken")
const User  =require("../../models/Users.model")

require('dotenv').config();
const forgotEmail = async(email)=>{
    const token =  jwt.sign({email}, process.env.JWT_PASSWORD_RESET_SECRET, {expiresIn: '1d'})
    await User.updateOne({ email }, { $set: { passwordRestToken: token } });
    var transport = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: "cadd4f44623755",
            pass: "002cdde5cfd9c2"
        }
      });
    let info = await transport.sendMail({
        from: 'varunsaini11.@gmail.com',
        to: email,
        subject: 'OTP Testing',
        text: `Verify your otp`,
        html: `<section>
                  <div>
                    <h2>
                        Please click the link give below to chage your password.
                    </h2>
                    <a href='http://localhost:3000/password-reset/${token}'>Click here></a>
                    <p></p>
                  </div>  
               </section>`
    })
    return token;
}

module.exports = forgotEmail