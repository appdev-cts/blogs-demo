const Joi = require('joi');

const otpSchema = Joi.number().integer()
    .required().min(6)
    .messages({
        'string.pattern.base': 'OTP must be a 6-digit number',
        'any.required': 'OTP is required'
    });

const validateOtpBody = (req, res, next) => {
    const { error } = otpSchema.validate(req.body.otp)
    console.log(typeof(req.body.otp));
    if (error) {
        return res.status(400).json({ status: false, message: error?.details[0]?.message, response: error?.details[0] })
    }
    next()
}

module.exports = validateOtpBody;