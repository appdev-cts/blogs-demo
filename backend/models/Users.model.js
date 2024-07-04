const mongoose = require("mongoose");


const userSchema = mongoose.Schema({
    firstName:{
        type: String
    },
    lastName: {
        type:String
    },
    userName: {
        type:String
    },
    fullName: {
        type:String,

    },
    gender:{
        type: String, 
        enum: ['male', 'female']
    },
    email:{
        type: String
    },phoneNumber:{
        type: String
    },
    password:{
        type: String
    }, 
    isVerified:{
        type: String,
        default: false
    },
    userToken: {
        type: String
    },
    passwordRestToken:{
        typeof: String
    },
    OTP:{
        type: Number
    },
    expiryTimeStamp:{
        type: Date
    },
    profilePic: { type: String, default: null },
    countryCode:{
        type: String
    },
    blogs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blogs'
    }]
})

const Users = mongoose.model('Users', userSchema);
module.exports = Users