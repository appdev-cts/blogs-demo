const Joi = require('joi');
const userchangePasswordValidation = Joi.object({
    oldPassword: Joi.string().required().min(8).messages({
        'string.min': 'password must be 8 chracters long',
        'any.required': 'Password is required',
    }),
    newPassword: Joi.string().required().min(8).pattern(new RegExp('^(?=.*\\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$')).messages({
        'string.min': 'password must be 8 chracters long',
        'any.required': 'Password is required',
        'string.pattern.base': 'Password must contain at least one numeric digit, one symbol, one uppercase letter, and one lowercase letter',
    }),
    confirmPassword: Joi.string().required().min(8).pattern(new RegExp('^(?=.*\\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$')).valid(Joi.ref('newPassword')).messages({
        'any.only': 'New and conform Password do not match',
        'string.min': 'password must be 8 chracters long',
        'any.required': 'Password is required',
        'string.pattern.base': 'Password must contain at least one numeric digit, one symbol, one uppercase letter, and one lowercase letter',
    })
})

const validateChangePasswordBody = (req,res,next)=>{
    const {error} = userchangePasswordValidation.validate(req.body)
    if(error){
        return res.status(400).json({status: false, message: error?.details[0]?.message, response:error?.details[0]})
    }
    next()
}

module.exports = validateChangePasswordBody;