const Joi = require('joi');
const blogPostValidation = Joi.object({
    tittle: Joi.string().required().messages({
        'any.required': 'Tittle is required'
    }),
    content: Joi.string().required().messages({
        'any.required:' : 'content can not be empty'
    }),
    tags: Joi.array().items(Joi.string()).min(1).required().messages({
        'any.required': 'tags must be provided'
    }),
    imageUrls: Joi.array()
})

const validateBlogPost = (req,res,next)=>{
    const {tags} = req?.body
    console.log(tags);
    const {error} = blogPostValidation.validate(req.body)
    if(error){
        console.log(error?.details[0]?.message);
        return res.status(400).json({status: false, message: error?.details[0]?.message, response:error})

    }
    next()
}

module.exports = validateBlogPost