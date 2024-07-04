const genOTP = require('../otp_utils/genOtp');
const nodemailer = require('nodemailer');

const sendEmail = async (email) => {
    let otp = genOTP();

    var transport = nodemailer.createTransport({
        // host: "sandbox.smtp.mailtrap.io",
        // port: 2525,
        // auth: {
        //     user: "cadd4f44623755",
        //     pass: "002cdde5cfd9c2"
        // }
        service: "gmail",
        auth:{
            user:"varunsaini417@gmail.com",
            pass: "wndm okqy tgwv sahh"
        }
    });

    let info = await transport.sendMail({
        from: 'varunsaini11.@gmail.com',
        to: email,
        subject: 'Verify your email',
        text: `Verify your otp`,
        html: `<section>
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <p>Your One-Time Password (OTP) for verification is: <span style="font-weight: 600">${otp}</span></p>
                    <p>Please enter this OTP to complete the verification process.</p>
                    <p>If you did not request this OTP, please ignore this email.</p>
                    <p>Thank you!</p>
                    <h1 style="font-size: 24px; color: #007bff; margin-top: 0;">Blog App</h1>
                  </div>
               </section>`
    })
    return otp;
}

module.exports = sendEmail; 