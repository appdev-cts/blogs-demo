const Joi = require('joi');
const userEmailValidation = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Enter a valid email address',
        'any.required': 'Email is required'
    })
})

const validateEmailBody = (req,res,next)=>{
    const {error} = userEmailValidation.validate(req.body)
    if(error){
        return res.status(400).json({status: false, message: error?.details[0]?.message, response:error?.details[0]})
    }
    next()
}

module.exports = validateEmailBody;