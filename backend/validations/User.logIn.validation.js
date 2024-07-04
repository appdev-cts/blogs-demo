const Joi = require('joi');
const userloginValidation = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Enter a valid email address',
        'any.required': 'Email is required'
    }),
    password: Joi.string().required().messages({
        'any.required': 'Password is required'
    })
})

const validateLoginBody = (req,res,next)=>{
    const {error} = userloginValidation.validate(req.body)
    if(error){
        return res.status(400).json({status: false, message: error?.details[0]?.message, response:error?.details[0]})
    }
    next()
}

module.exports = validateLoginBody;