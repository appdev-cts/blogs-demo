const Joi = require('joi')
const userRegValidation = Joi.object({
    firstName: Joi.string().required().messages({
        'any.required': 'First name is required'
    }),
    lastName: Joi.string().required().messages({
        'any.required': 'Last name is required'
    }),
    userName: Joi.string().required().messages({
        'any.required': 'User Name is required'    }),
    gender: Joi.string().required().valid('male', 'female').messages({
        'any.required': 'Gender is required',
        'any.only': 'Selcet the gender'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Please enter the valid email address',
        'any.required': ' Email is required'
    }),
    countryCode: Joi.string().required().messages({
        'any.required': 'Countary code is required'
    }),
    phoneNumber: Joi.string().regex(/^[0-9]{10}$/).required().messages({
        'string.pattren.base': 'Enter a valid 10 digit phone number',
        'any.required': 'Phone number is required'
    }),
    password: Joi.string().required().min(8).pattern(new RegExp('^(?=.*\\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$')).messages({
        'string.min': 'password must be 8 chracters long',
        'any.required': 'Password is required',
        'string.pattern.base': 'Password must contain at least one numeric digit, one symbol, one uppercase letter, and one lowercase letter',
    }),
    // profilePic: Joi.object({
    //     data: Joi.binary().required(),
    //     contentType: Joi.string().valid('image/jpeg', 'image/png', 'image/gif').required(),
    //     name: Joi.string().required()
    // }).required().messages({
    //     'any.required': 'Profile picture is required',
    //     'object.base': 'Profile picture must be provided as an object',
    //     'object.missing': 'Profile picture data, contentType, and name are required',
    //     'string.empty': 'Profile picture name is required',
    //     'string.valid': 'Profile picture must be in JPEG, PNG, or GIF format'
    // })
})

const validateUserRegbody = (req,res,next)=>{
    // console.log(req);
    const {error} = userRegValidation.validate(req.body)
    if(error){
        return res.status(400).json({status: false, message: error?.details[0]?.message, response:error?.details[0]})

    }
    next()
}

module.exports = validateUserRegbody;