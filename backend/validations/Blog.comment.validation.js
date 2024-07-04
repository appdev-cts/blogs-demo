const Joi = require('joi');


const userCommentValidation = Joi.object({
    text: Joi.string().required().messages({
        'any.required': 'Email is required'
    }),
})

const validateCommentBody = (req,res,next)=>{
    const {error} = userCommentValidation.validate(req.body)
    if(error){
        return res.status(400).json({status: false, message: error?.details[0]?.message, response:error?.details[0]})
    }
    next()
}


module.exports = validateCommentBody