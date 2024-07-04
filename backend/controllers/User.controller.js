const Users = require('../models/Users.model');
const Subscription = require('../models/Subscription.model');
const Notification = require('../models/Notification.model'); // Adjust the path as necessary

const sendEmail = require('../utils/email_utils/send-email')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config();
const forgotEmail = require('../utils/email_utils/send-forgotEmail')
const Blogs = require('../models/Blogs.model');
const sendSms = require('../utils/phone_utils/send-otp');

const fetchUserDetails = async (req, res) => {
    const id = req?.user;
    let user
    try {
        user = await Users.findOne({ _id: id }).select('-OTP -password -userToken -expiryTimeStamp').populate('blogs')
        if (user && user.blogs) {
            user.blogs.reverse();
        }
        if (!user) {
            return res.status(400).json({ status: false, message: "No details were found for this user", response: {} })
        }
        return res.status(200).json({ status: true, message: 'User details found!!', response: { user } })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, message: "Internal Server Error!!", response: {} })
    }
}

const verifyOtp = async (req, res) => {
    const otp = req?.body?.otp;
    const intOtp = parseInt(otp)
    const id = req?.user
    const io = req.app.get('socketio');

    let user;
    try {
        user = await Users.findOne({ _id: id })
        // console.log(user);
        if (!user) {
            return res.status(400).json({ status: false, message: 'Bad Request, Please try again!!', response: {} })
        }
        console.log(user.OTP);
        if (user.expiryTimeStamp < new Date()) {
            return res.status(400).json({ status: false, message: "OTP expired", response: {} })
        }
        if (user.OTP === intOtp) {
            await Users.updateOne({ OTP: otp }, { $set: { isVerified: 'true' } })
            const verifyNotification = {
                user: id,
                type: 'verify',
                message: "Your account has been verified successfully."
            }
            const notification = await Notification.create(verifyNotification)
            io.to(id).emit('notification', notification);
            return res.status(200).json({ status: true, message: "User verified!!", response: {} })
        }
        return res.status(400).json({ status: false, message: 'Incorrect OTP', response: {} })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: false, message: 'Internal server error', response: error })
    }
}

const verifyEmail = async (req, res) => {
    const id = req?.user;
    const { email } = req.body;
    let user;
    try {
        user = await Users.findById(id);
        if (!user || user.email !== email) {
            return res.status(400).json({ status: false, message: 'User with the mail not found', response: {} });
        }
        if (user.isVerified === 'false') {
            const generatedOtp = await sendEmail(email);

            if (!generatedOtp) {
                return res.status(400).json({ status: false, message: 'Please try again', response: {} })

            }
            await Users.updateOne({ email }, { $set: { OTP: generatedOtp, expiryTimeStamp: new Date(Date.now() + 2 * 60 * 1000) } })
            await sendSms(generatedOtp);
            return res.status(200).json({ status: false, message: 'An OTP has sent to your email address.', response: {} })
        }
        return res.status(400).json({ status: false, message: 'User is already verified', response: {} })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, message: "Internal server error", response: { error } })
    }
}


const login = async (req, res) => {
    const { email, password } = req.body;
    let user;
    try {
        user = await Users.findOne({ email });
        if (!user) {
            return res.status(400).json({ status: false, message: "User not found", response: {} });
        }
        const isPasswordCorrect = bcrypt.compareSync(password, user.password)
        if (!isPasswordCorrect) {
            return res.status(400).json({ status: false, message: "Password is incorrect", response: {} })
        }
        const newToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' })
        await Users.updateOne({ email }, { userToken: newToken })
        const loginUserData = await Users.findOne({ email }).select('-password -OTP -expiryTimeStamp')
        return res.status(200).json({ status: true, message: "User logged-in successfully", response: loginUserData })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, message: 'Internal server error', response: {} })
    }
}
const userProfile = async (req, res) => {
    const id = req?.user;
    console.log(`-------------------<<<<<<<<<<<<<<<<<<<<<<<<<<<<----------------------------------- ${id}`);
    const { userName } = req.params;
    console.log(userName);

    try {
        // Retrieve the user profile excluding sensitive fields
        const user = await Users.findOne({ userName }).select('-password -userToken -OTP -expiryTimeStamp');
        if (!user) {
            return res.status(404).json({ status: false, message: "User not found" });
        }
        const authId = user._id;

        // Retrieve blog posts by the user
        const blogPosts = await Blogs.find({ author: authId });
        console.log(blogPosts);

        // Retrieve followers of the user being viewed and the authenticated user in parallel
        const [userFollowers, viewerFollowers] = await Promise.all([
            Subscription.find({ channel: authId }).select('subscriber'),
            Subscription.find({ channel: id }).select('subscriber')
        ]);
        console.log("User Followes: - " + userFollowers);
        // Convert followers to sets for efficient comparison
        const userFollowerSet = new Set(userFollowers.map(sub => sub.subscriber.toString()));
        const viewerFollowerSet = new Set(viewerFollowers.map(sub => sub.subscriber.toString()));
        console.log("------------->user" + [...userFollowerSet]);
        console.log("------------->viewer" + [...viewerFollowerSet]);
        // Find mutual followers
        const mutualConnections = [...userFollowerSet].filter(followerId => viewerFollowerSet.has(followerId));
        console.log("Mutual------> " + mutualConnections)
        // Retrieve details of mutual followers if any
        let mutualFollowers = [];
        if (mutualConnections.length > 0) {
            mutualFollowers = await Users.find({ _id: { $in: mutualConnections } }).select('userName profilePic fullName -_id');
        }

        return res.status(200).json({
            status: true,
            message: "Success!!",
            response: { user, blogPosts, mutualFollowers }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, message: "Unsuccess!!", response: error });
    }
};




const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body
    const id = req?.user
    let user;
    try {
        user = await Users.findOne({ _id: id })
        const isOldPasswordCorrect = bcrypt.compareSync(oldPassword, user.password);
        if (!isOldPasswordCorrect) {
            return res.status(400).json({ status: false, message: "The old password is incoorect", response: {} })
        }
        if (oldPassword === newPassword) {
            return res.status(400).json({ status: false, message: "old and new password can not be same", response: {} })
        }
        const hashPassword = bcrypt.hashSync(newPassword, 10)
        await Users.updateOne({ _id: id }, { password: hashPassword })
        return res.status(200).json({ status: true, message: 'Password changed successfully', response: {} });
    } catch (error) {
        return res.status(500).json({ status: false, message: "Internal server error", response: error })
    }
}

const signUp = async (req, res) => {
    // console.log(req.body);
    const { firstName, lastName, userName, email, password, gender, phoneNumber, countryCode } = req.body;
    const profilePic = req.file; // Access uploaded file details
    console.log(profilePic);
    // Check if a file was uploaded
    let profilePicUrl = '';
    if (profilePic) {
        profilePicUrl = req.protocol + '://' + req.get('host') + '/uploads/profile/' + profilePic.filename;
    }

    try {
        // const existingUser = await Users.findOne({ email });
        const [existingUser, existingUserWithSameNumber] = await Promise.all([
            Users.findOne({ email }),
            Users.find({ phoneNumber })
        ]);
        console.log("--> " + existingUserWithSameNumber.length);

        if (existingUser) {
            console.log("User already exists");
            return res.status(400).json({ status: false, message: "User already exists", response: {} });
        }
        if (existingUserWithSameNumber.length > 0) {
            return res.status(400).json({ status: false, message: "User can not have same number more than 3 times.", response: {} });

        }
        const existUserName = await Users.findOne({ userName })
        if (existUserName) {
            console.log("User Name is already taken");
            return res.status(400).json({ status: false, message: "User name is already taken" })
        }
        const hash = bcrypt.hashSync(password, 10);



        let formattedUserName = userName;
        if (!userName.startsWith('@')) {
            formattedUserName = `@${userName}`;
        }
        const user = new Users({
            firstName,
            lastName,
            userName: formattedUserName,
            fullName: firstName + " " + lastName,
            gender,
            email,
            phoneNumber,
            password: hash,
            countryCode,
            profilePic: profilePicUrl // Save profile picture URL
        });

        const savedUser = await user.save();
        if (!savedUser) {
            return res.status(400).json({ status: false, message: 'User registration failed, please try again', response: {} });
        }

        const token = jwt.sign({ userId: savedUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        savedUser.userToken = token;
        await savedUser.save();
        const responseData = { ...savedUser.toObject() };
        delete responseData.password;
        return res.status(200).json({ status: true, message: "User registered successfully", response: { responseData } });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, message: "An error occurred", response: {} });
    }
};

const resetPassword = async (req, res) => {
    const { newPassword, confirmPassword } = req.body;
    const { token } = req.params;
    console.log("This is      my fiiiiiilfe" + req?.file);
    try {
        const decryptUser = jwt.verify(token, process.env.JWT_PASSWORD_RESET_SECRET);
        if (!decryptUser || !decryptUser.email) {
            return res.status(400).json({ status: false, message: "Invalid or expired token" });
        }

        const userEmail = decryptUser.email;
        const user = await Users.findOne({ email: userEmail });
        if (!user) {
            return res.status(400).json({ status: false, message: "User not found" });
        }
        const jsonToken = JSON.stringify(token)
        const userToken = JSON.stringify(user.passwordRestToken);
        console.log(jsonToken);
        console.log(userToken);
        if (jsonToken !== userToken) {
            return res.status(400).json({ status: false, message: "Invalid token" });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ status: false, message: "Password did not match with confirm password" });
        }

        const decryptPass = bcrypt.compareSync(newPassword, user.password);
        if (decryptPass) {
            return res.status(400).json({ status: false, message: "New password cannot be the same as the old password" });
        }

        const hash = bcrypt.hashSync(newPassword, 10);
        await Users.updateOne({ email: userEmail }, { $set: { password: hash, passwordRestToken: "" } });

        return res.status(200).json({ status: true, message: "Password changed successfully" });
    } catch (error) {
        console.error("Error resetting password:", error);
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
};


const forgotPassword = async (req, res) => {
    const { email } = req.body;
    let user;
    try {
        user = await Users.findOne({ email })
        if (!user) {
            return res.status(400).json({ status: false, mesasge: "No user found with this email", response: {} });
        }
        const data = await forgotEmail(email);
        console.log(data);
        await Users.updateOne({ email }, { $set: { passwordRestToken: data } })
        return res.status(200).json({ status: true, mesasge: "Email sent Successfully", response: { data } })
    } catch (error) {
        console.log(error);
    }
}

const subscribeToChannel = async (req, res) => {
    const id = req?.user;
    const { channelUserName } = req?.params;
    console.log(channelUserName);
    let subscriber, userChannel;

    try {
        subscriber = await Users.findById(id);
        userChannel = await Users.findOne({ userName: channelUserName });
        console.log("!!!" + userChannel?._id)
        if (!subscriber && !userChannel) {
            console.log(subscriber, userChannel)
            return res.status(400).json({ status: true, message: "Subscription process Unsuccessfull" });

        }
        const existingSubscription = await Subscription.findOne({ subscriber: id, channel: userChannel._id });

        if (existingSubscription) {
            return res.status(400).json({ status: false, message: "User is already subscribed to this channel" });
        }
        const subscription = new Subscription({
            subscriber: id,
            channel: userChannel?._id
        })

        await subscription.save();
        const channelNotification = {
            user: userChannel?._id,
            type: 'subscription',
            otherUserId: id,
            otherUserName: subscriber?.userName,
            otherUserProfilePic: subscriber?.profilePic,
            message: `subscribed to your channel`,
        }
        const notification = await Notification.create(channelNotification);
        const allNotifications = await Notification.find({ user: id }).sort({ createdAt: -1 });
        const io = req.app.get('socketio');
        console.log("------>>id =----" + typeof (id) + "------->>>>------->>>>" + userChannel?._id);
        const channelId = (userChannel?._id).toString();
        console.log("ChannelId " + typeof (channelId))
        io.to(channelId).emit('notification', notification)




        const subscribers = await Subscription.find({ channel: userChannel._id }).populate('subscriber');
        const followers = subscribers.map(sub => ({
            userName: sub.subscriber.userName,
            profilePic: sub.subscriber.profilePic
        }));
        const followersCount = followers.length;

        // Update following count for the subscriber
        const subscriptions = await Subscription.find({ subscriber: id }).populate('channel');
        const following = subscriptions.map(sub => ({
            userName: sub.channel.userName,
            profilePic: sub.channel.profilePic
        }));
        const followingCount = following.length;

        // Emit follower and following count updates to both the channel and the subscriber
        const channelUserId = (userChannel._id).toString()
        const subId = id.toString()
        console.log(`----==========================={}}{}{} ${channelUserId} ${typeof (subId)}`)
        io.to(channelUserId).emit('followerCountUpdate', { count: followersCount, followers });
        // io.to(subId).emit('followingCountUpdate', { count: followingCount, following });
        // console.log(variable);



        return res.status(200).json({ status: true, message: "Success", response: { isSubscribed: true } });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, message: "Internal Server Error", response: error });
    }
}

const subscribe = async (req, res) => {
    const channelId = req?.user;
    const { notificationId, subscriberName } = req?.query;
    const io = req.app.get('socketio');
    console.log(subscriberName)
    try {
        const [sender, receiver, notification] = await Promise.all([
            Users.findOne({ userName: subscriberName }),
            Users.findById(channelId),
            Notification.findById(notificationId),
    
        ]);
        const subscription = await Subscription.findOne({ channel: channelId, subscriber: sender?._id })
        console.log(subscription?.status);
        console.log(receiver);
        if (!sender || !receiver || !notification || subscription.status === "accepted") {
            return res.status(400).json({ status: false, message: "Invalid sub request" })
        }
    
        subscription.status = "accepted";
        const updatedSubRes = await subscription.save();
        const deleted = await Notification.findByIdAndDelete(notificationId)
    
        const channelNotification = {
            user: receiver._id,
            type: 'subscription',
            otherUserId: sender._id,
            otherUserName: sender.userName,
            otherUserProfilePic: sender.profilePic,
            message: `subscribed to your channel`
        }
        const subscriberNotification = {
            user: sender._id,
            type: 'subscription',
            otherUserId: receiver._id,
            otherUserName: receiver.userName,
            otherUserProfilePic: receiver.profilePic,
            message: `has accepted your request.`
        }
    
        const newSenderNotification = await Notification.create(subscriberNotification);
        await Notification.create(channelNotification);
        const allNotifications = await Notification.find({ user: receiver._id }).sort({ createdAt: -1 });
        io.to(receiver._id.toString()).emit('subNotification', allNotifications);
        io.to(sender._id.toString()).emit('notification', newSenderNotification);
        io.to(sender._id.toString()).emit('change_sub-status', updatedSubRes.status);
    
    
        const subscribers = await Subscription.find({ channel: receiver._id }).populate('subscriber');
        const followers = subscribers.map(sub => ({
            userName: sub.subscriber.userName,
            profilePic: sub.subscriber.profilePic
        }));
        const followersCount = followers.length;
        // const channelUserId = (receiver._id).toString()
        // io.to(sender._id.toString()).emit('followerCountUpdate', {count: followersCount, followers})
        io.to(receiver._id.toString()).emit('followerCountUpdate', { count: followersCount, followers });
        return res.status(200).json({ status: true, message: "Subscribed Successfully", subscriptionStatus: updatedSubRes.status });
    } catch (error) {
        console.log(error)
    }
}
    
const checkSubscription = async (req, res) => {
    const id = req.user;
    const { channelUserName } = req.params;

    try {
        // Find the subscriber and the user channel
        const subscriber = await Users.findById(id);
        const userChannel = await Users.findOne({ userName: channelUserName });
    
        // Check if either subscriber or userChannel does not exist
        if (!subscriber || !userChannel) {
            return res.status(400).json({ status: false, message: "Subscription process Unsuccessful" });
        }
    
        // Check if there is an existing accepted subscription
        const existingSubscription = await Subscription.findOne({ subscriber: id, channel: userChannel._id, status: 'accepted' });
    
        if (existingSubscription) {
            // Return status if user is already subscribed
            return res.status(200).json({ status: true, message: "User is already subscribed to this channel", subscriptionStatus: 'accepted' });
        }
    
        // Check if there are pending subscriptions
        const pendingSubscription = await Subscription.findOne({ subscriber: id, channel: userChannel._id, status: 'pending' });
    
        if (pendingSubscription) {
            // Return status if there is a pending subscription
            return res.status(200).json({ status: true, message: "Subscription is pending approval", subscriptionStatus: 'pending' });
        }
    
        // If no accepted or pending subscriptions found, user is not subscribed
        return res.status(200).json({ status: true, message: "Not subscribed", subscriptionStatus: '' });
    } catch (error) {
        // Handle internal server error
        console.error("Error in checkSubscription:", error);
        return res.status(500).json({ status: false, message: "Internal Server Error", error });
    }
};


const unSubscribe = async (req, res) => {
    const id = req?.user;
    const { channelUserName } = req?.params;
    const io = req.app.get('socketio');

    // console.log(channelUserName);
    let subscriber, userChannel;
    try {

        subscriber = await Users.findById(id);
        userChannel = await Users.findOne({ userName: channelUserName });

        if (!subscriber && !userChannel) {
            // console.log(subscriber, userChannel)
            return res.status(400).json({ status: true, message: "Subscription process Unsuccessfull" });
        }


        const subscribed = await Subscription.findOneAndDelete({ subscriber: id, channel: userChannel._id });


        if (!subscribed) {
            return res.status(200).json({ status: true, message: "Subscribe first" });
        }

        let userChannelId = (userChannel?._id).toString()
    
        const deleteNot = await Notification.deleteOne({ user: userChannelId, otherUserId: id, type: 'subscription' });


        if (!deleteNot) {
            return res.status(400).json({ status: false, message: "Notification not found" });
        }


        const allNotifications = await Notification.find({ user: userChannelId }).sort({ createdAt: -1 });

        io.to(userChannelId).emit('subscription', allNotifications);
        const subscribers = await Subscription.find({ channel: userChannel._id }).populate('subscriber');
        const followers = subscribers.map(sub => ({
            userName: sub.subscriber.userName,
            profilePic: sub.subscriber.profilePic
        }));


        const followersCount = followers.length;

        // Update following count for the subscriber
        const subscriptions = await Subscription.find({ subscriber: id }).populate('channel');
        const following = subscriptions.map(sub => ({
            userName: sub.channel.userName,
            profilePic: sub.channel.profilePic
        }));

        // Emit follower and following count updates to both the channel and the subscriber
        const channelUserId = (userChannel._id).toString()

        io.to(channelUserId).emit('followerCountUpdate', { count: followersCount, followers });
        io.to(subscriber._id.toString()).emit('followerCountUpdate', { count: followersCount, followers });
        io.to(subscriber._id.toString()).emit('change_sub-status', "")


        return res.status(200).json({ status: true, message: "Unsubscribe successfull", response: { isSubscribed: false } });
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ status: false, message: "Internal Server Error", response: error });
    }
}

const countSubscription = async (req, res) => {
    const id = req?.user;
    const { channelUserName } = req?.params;

    try {
        if (!channelUserName) {
            return res.status(400).json({ status: false, message: "Username not found" });
        }

        const channel = await Users.findOne({ userName: channelUserName });
        if (!channel) {
            return res.status(404).json({ status: false, message: "Channel not found" });
        }

        const channelId = channel._id.toString();
        console.log(channelId);

        const subscriber = await Users.aggregate([
            {
                $match: {
                    userName: channelUserName
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    let: { channelId: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $and: [{ $eq: ["$channel", "$$channelId"] }, { $eq: ["$status", "accepted"] }] } } }
                    ],
                    as: "subscribers"
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    let: { subscriberId: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $and: [{ $eq: ["$subscriber", "$$subscriberId"] }, { $eq: ["$status", "accepted"] }] } } }
                    ],
                    as: "subscribedTo"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "subscribers.subscriber",
                    foreignField: "_id",
                    as: "subscribersDetails"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "subscribedTo.channel",
                    foreignField: "_id",
                    as: "subscribedToDetails"
                }
            },
            {
                $addFields: {
                    subscribersCount: { $size: "$subscribers" },
                    channelsSubscribedToCount: { $size: "$subscribedTo" }
                }
            },
            {
                $project: {
                    subscribersCount: 1,
                    channelsSubscribedToCount: 1,
                    subscribersDetails: {
                        fullName: 1,
                        profilePic: 1,
                        userName: 1
                    },
                    subscribedToDetails: {
                        fullName: 1,
                        profilePic: 1,
                        userName: 1
                    }
                }
            }
        ]);

        if (!subscriber.length) {
            return res.status(404).json({ status: false, message: "Channel not found" });
        }
        return res.status(200).json({ status: true, message: "Success", response: subscriber[0] });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
}

const sendSubRequest = async (req, res) => {
    const id = req.user;
    const { channelUserName } = req.params;
    let sender, receiver;

    try {
        sender = await Users.findById(id);
        receiver = await Users.findOne({ userName: channelUserName });
        const io = req.app.get('socketio');

        if (!sender || !receiver) {
            return res.status(400).json({ status: false, message: "Subscribe request failed" });
        }

        const existingSubRequest = await Subscription.findOne({
            subscriber: sender._id,
            channel: receiver._id,
            status: { $in: ["pending", "accepted"] }  // Use $in to check for multiple statuses
        });

        if (existingSubRequest) {
            return res.status(200).json({ status: true, message: "User has already sent the request" });
        }

        const subRequest = new Subscription({
            subscriber: id,
            channel: receiver._id,
            status: "pending"  // Ensure status is set to pending when creating a new request
        });

        const subReq = await subRequest.save();

        const channelNotification = {
            user: receiver._id,
            type: 'request',
            otherUserId: id,
            otherUserName: sender.userName,
            otherUserProfilePic: sender.profilePic,
            message: `has sent you the request`
        };

        const notification = await Notification.create(channelNotification);
        const receiverId = receiver._id.toString();
        io.to(receiverId).emit('notification', notification);

        return res.status(200).json({ status: true, message: "Request sent successfully", subscriptionStatus: subReq.status });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, message: "An error occurred while sending the request" });
    }
};

const rejectSubRequest = async (req, res) => {
    const receiverId = req?.user; // channel ID.
    const { notificationId, subscriberName } = req?.query; // senderName is subscriber/who wants to follow/subscriber
    const io = req.app.get('socketio');
    console.log(subscriberName)
    try {
        const [sender, receiver, notification] = await Promise.all([
            Users.findOne({ userName: subscriberName }), // details of subscriber or follower.
            Users.findById(receiverId), // receiver / channel details.
            Notification.findById(notificationId), // notification details
        ]);
        console.log("sender "+sender, "rec: "+receiver, notification)
        // Check if the sender, receiver, or notification does not exist
        if (!sender || !receiver || !notification) {
            return res.status(400).json({ status: false, message: "Invalid sub request 1" });
        }

        // Find the subscription object for the given channel and subscriber
        const subscription = await Subscription.findOne({ channel: receiverId, subscriber: sender._id, status: 'pending' });

        if (!subscription) {
            return res.status(400).json({ status: false, message: "Invalid sub request 2" });
        }

        // Delete the subscription object for the senderId and receiverId
        const deleteSub = await Subscription.findOneAndDelete({ channel: receiver._id, subscriber: sender._id, status: "pending" });
        console.log(deleteSub);

        // Delete the notification as well
        await Notification.findByIdAndDelete(notificationId);

        // Send the updated notification to receiver using socket
        const allNotifications = await Notification.find({ user: receiver._id }).sort({ createdAt: -1 });
        io.to(receiver._id.toString()).emit('subNotification', allNotifications);
        io.to(sender._id.toString()).emit('change_sub-status', "");
        return res.status(200).json({ status: true, message: 'Request rejected successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, message: "Internal server error", response: error });
    }
};

module.exports = { rejectSubRequest, subscribe, sendSubRequest, countSubscription, unSubscribe, checkSubscription, subscribeToChannel, fetchUserDetails, verifyOtp, verifyEmail, login, changePassword, signUp, resetPassword, forgotPassword, userProfile }