const jwt = require('jsonwebtoken');

require('dotenv').config()
const Users  = require('../models/Users.model');

const auth =  async(req,res,next)=>{
    const token = req?.headers?.authorization?.split(' ')[1];
    // console.log(token);
    try {
        if(!token){
            return res.status(400).json({status: false, message: 'Token is required', response:{}});
        }
       
        // find the user in db
        const user = await Users.findOne({userToken: token});
        if(!user){
            return res.status(400).json({status: false, message:'Unauthorized access', response:{}});
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const id = decoded?.id
        // console.log(id);
        req.user = id;
        next();
    } catch (error) {
        if(error.name === 'TokenExpiredError'){
            return res.status(400).json({status: false, message: 'Token has expired', response:{}})
        }else if(error.name === 'JsonWebTokenError'){
            return res.status(400).json({status: false, message: 'Invalid Token', response:{}})
        }else{
            console.error("Token verification error: ", error);
            return res.status(400).json({status: false, message: 'Token verification Error', response:{error}});
        }
    }
}

module.exports = auth;