const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    type: { type: String, enum: ['request','upload', 'comment', 'like','delete', 'edit','upload-veiw', 'subscription', 'verify'], required: true },
    otherUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users'},
    message: { type: String, required: true },
    commentText: {type:String}, 
    blogId: { type: mongoose.Schema.Types.ObjectId, ref: 'Blogs', required: false },
    otherUserName: {type: String},
    otherUserProfilePic: {type: String},
    count: { type: Number, default: 1 },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;