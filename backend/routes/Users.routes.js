const express = require('express');
const userRouter = express.Router();

// middlewares
const auth = require('../middleware/auth');
const checkUser = require('../middleware/check-user')
const upload  = require('../middleware/upload');


//validations
const validateUserRegbody  = require('../validations/User.Registration.Validation');
const validateLoginBody  =require('../validations/User.logIn.validation');
const validateOtpBody = require('../validations/Otp.validation')
const validateEmailBody = require('../validations/User.verify.email.validations')
const validateForgotPasswordBody = require('../validations/Forgot.password.validation')
const validateChangePasswordBody = require('../validations/Change.password.validation')
const validateBlogPost  =require('../validations/Blog.post.Validation');
const validateCommentBody = require('../validations/Blog.comment.validation')

//  blog and user controllers
const {readNotification, getUserNotifications,uploadComment,uploadLikes,deleteBlog, postBlog, updateBlog, getAllBlogs, fetchBlogPost, fetchBlogs, fetchAllComments, fetchUserBlogs, searchBy}  = require('../controllers/Blog.controller')
const {fetchUserDetails, verifyOtp, verifyEmail, login, changePassword, signUp, resetPassword, forgotPassword, userProfile,subscribeToChannel,checkSubscription,unSubscribe,countSubscription, sendSubRequest, subscribe, rejectSubRequest} = require('../controllers/User.controller')
const test = require('../controllers/test')


// all the post routing
userRouter.post('/comment/:postId',auth,validateCommentBody, uploadComment )
userRouter.post('/sign-up', upload, validateUserRegbody, signUp);
userRouter.post('/upload-blog', auth, validateBlogPost, postBlog);
userRouter.post('/login-user',validateLoginBody, login);
userRouter.post('/verify-email',validateEmailBody,auth, verifyEmail);
userRouter.post('/verify-otp',validateOtpBody,auth, verifyOtp);
userRouter.post('/change-password',auth,validateChangePasswordBody, changePassword);
userRouter.post('/forgot-password',validateEmailBody, forgotPassword)
userRouter.post('/reset-password/:token',validateForgotPasswordBody, resetPassword)
userRouter.post('/upload-like/:blogId', auth, uploadLikes)
userRouter.post('/read-notification/:id',auth, readNotification);
userRouter.post('/subscribe/:channelUserName',auth, subscribeToChannel);
userRouter.post('/send-request/:channelUserName', auth, sendSubRequest)
// userRouter.post('/like/:postId', auth, likeBlog)
// userRouter.post('/upload-image', upload.single('image'), uploadImage);
// userRouter.post('/delete-image', deleteImage)


// all the get routing
userRouter.get('/allComments/:postId', fetchAllComments)
userRouter.get('/user-profile', auth, fetchUserDetails);
userRouter.get('/blog/:_id',checkUser,fetchBlogPost)
userRouter.get('/dashboard',auth, fetchUserBlogs);
userRouter.get('/', checkUser,getAllBlogs);
userRouter.get('/search',checkUser, searchBy);
userRouter.get('/user-blogs/:_id', fetchBlogs)
userRouter.get('/user-profile/:userName',checkUser, userProfile);
userRouter.get('/getNotifications', auth,getUserNotifications);
userRouter.get('/check-sunscription/:channelUserName', auth, checkSubscription);
userRouter.get('/count-subscription/:channelUserName', auth, countSubscription);
//delete routing
userRouter.delete('/delete-blog/:id', deleteBlog)
userRouter.delete('/un-subscribe/:channelUserName', auth, unSubscribe);
userRouter.delete('/reject-request', auth, rejectSubRequest);
// update routing
userRouter.put('/update-blog/:id',validateBlogPost, updateBlog);
userRouter.put('/subscribe', auth, subscribe);

// testing route
userRouter.get('/test', test)


module.exports = userRouter;

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Old code 
// const postBlog = require('../controllers/Blog.post.controller');
// const fetchUserBlogs = require('../controllers/Fetch.user.blog.controller');
// const getAllBlogs = require('../controllers/Fetch.allBlogs.controller');
// const updateBlog = require('../controllers/Blog.update.controller');
// const searchBy = require('../controllers/Search.blog.controller');
// const login = require('../controllers/User.login.controller');
// const verifyEmail = require('../controllers/User.email-verify.controller');
// const verifyOtp =  require('../controllers/User.email-otp-verification.controller');
// const changePassword  =require('../controllers/User.password.change.controller');
// const fetchUserDetails = require('../controllers/Fetch.user.details');
// const fetchBlogPost = require('../controllers/Fetch.blog.post')
// const fetchBlogs  =require('../controllers/Fetch.blogs.user.controller')
// const forgotPassword = require('../controllers/User.send.forgot.email.controller')
// const resetPassword = require('../controllers/User.reset.password.controller')
// const uploadComment  =require('../controllers/Blog.commetn.controller');
// const fetchAllComments = require('../controllers/Fetch.comments.controller')
// const deleteBlog = require('../controllers/Blog.delete.controller');
// const { upload, uploadImage, deleteImage } = require('../controllers/Blog.image.controller');