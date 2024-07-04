const otpgen = require('otp-generator');

const genOTP  = ()=>{
    const OTP = otpgen.generate(6, {lowerCaseAlphabets: false, upperCaseAlphabets:false, specialChars: false})
    return OTP
}

module.exports = genOTP;