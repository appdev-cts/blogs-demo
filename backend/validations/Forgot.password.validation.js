const Joi = require('joi');
const userForgotPasswordValidation = Joi.object({
    newPassword: Joi.string().required().min(8).pattern(new RegExp('^(?=.*\\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$')).messages({
        'string.min': 'password must be 8 chracters long',
        'any.required': 'Password is required',
        'string.pattern.base': 'Password must contain at least one numeric digit, one symbol, one uppercase letter, and one lowercase letter',
    }),
    confirmPassword: Joi.string().required().min(8).pattern(new RegExp('^(?=.*\\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$')).messages({
        'string.min': 'password must be 8 chracters long',
        'any.required': 'Password is required',
        'string.pattern.base': 'Password must contain at least one numeric digit, one symbol, one uppercase letter, and one lowercase letter',
    })
})

const validateForgotPasswordBody = (req,res,next)=>{
    const {error} = userForgotPasswordValidation.validate(req.body)
    if(error){
        return res.status(400).json({status: false, message: error?.details[0]?.message, response:error?.details[0]})
    }
    next()
}

module.exports = validateForgotPasswordBody;