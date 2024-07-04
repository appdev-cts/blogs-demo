const Blogs = require('../models/Blogs.model');
const Users = require('../models/Users.model');
const Notification = require('../models/Notification.model'); // Adjust the path as necessary

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Subscription = require('../models/Subscription.model');



const uploadComment = async (req, res) => {
    const id = req?.user;
    const postId = req.params.postId;
    const { text } = req.body;
    const io = req.app.get('socketio');
    try {
        const blog = await Blogs.findById(postId);
        const user = await Users.findById(id);
        const authorId = blog?.author?.toString();

        if (!blog || !user || !authorId) {
            return res.status(404).json({ status: false, message: "Blog or user not found", response: {} });
        }

        blog.comments.unshift({ text, author: id });
        await blog.save();

        if (id !== authorId) {
            // Create notification for the blog author
            const authorNotification = {
                user: authorId,
                type: 'comment',
                otherUserName: user?.userName,
                otherUserProfilePic: user?.profilePic,
                message: `commented on your post`,
                blogId: blog?._id,
                commentText: text
            };

            const notification = await Notification.create(authorNotification);
            console.log('----------------------- ' + notification);

            // Emit notification to the blog author
            io.to(authorId).emit('notification', notification);
        }

        // Debug log
        console.log("Comments:", await blog.populate('comments.author', 'fullName userName profilePic'));

        // Emit comment update to all users watching this post
        io.to(postId).emit('commentUpdate', blog.comments);

        return res.status(200).json({ status: true, message: "Comment Uploaded!!" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
}


const uploadLikes = async (req, res) => {
    const id = req.user; // Ensure the user ID is correctly extracted
    const blogId = req.params.blogId;
    const io = req.app.get('socketio');

    try {
        const blog = await Blogs.findById(blogId);

        if (!blog) {
            return res.status(400).json({ status: false, message: "Blog not found" });
        }

        const userId = blog?.author?.toString();
        const user = await Users.findById(id); // Fetch user details for notification

        if (blog.likes.includes(id)) {
            // Unlike the post
            blog.likes = blog.likes.filter(userId => userId.toString() !== id.toString());
            await blog.save();

            const updatedPost = await Blogs.aggregate([
                { $match: { _id: new mongoose.Types.ObjectId(blogId) } },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'likes',
                        foreignField: '_id',
                        as: 'likedUsers'
                    }
                },
                {
                    $addFields: {
                        likedUsers: {
                            $map: {
                                input: "$likedUsers",
                                as: "user",
                                in: {
                                    _id: "$$user._id",
                                    fullName: "$$user.fullName",
                                    profilePic: "$$user.profilePic",
                                    userName: "$$user.userName"
                                }
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        likesCount: { $size: "$likes" },
                        likedUsers: 1
                    }
                }
            ]);

            io.to(blogId).emit('likeUpdate', updatedPost[0]?.likedUsers);

            await Notification.deleteOne({ otherUserId: id, type: 'like', blogId });

            const allNotifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });
            io.to(userId).emit('delete-notification', allNotifications);

            return res.status(200).json({
                status: true,
                message: "Post unliked successfully",
                response: updatedPost[0]
            });
        } else {
            // Like the post
            blog.likes.push(id);
            await blog.save();

            const updatedPost = await Blogs.aggregate([
                { $match: { _id: new mongoose.Types.ObjectId(blogId) } },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'likes',
                        foreignField: '_id',
                        as: 'likedUsers'
                    }
                },
                {
                    $addFields: {
                        likedUsers: {
                            $map: {
                                input: "$likedUsers",
                                as: "user",
                                in: {
                                    _id: "$$user._id",
                                    fullName: "$$user.fullName",
                                    profilePic: "$$user.profilePic",
                                    userName: "$$user.userName"
                                }
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        likesCount: { $size: "$likes" },
                        likedUsers: 1
                    }
                }
            ]);

            io.to(blogId).emit('likeUpdate', updatedPost[0]?.likedUsers);

            if (id !== userId) {
                const likeNotification = new Notification({
                    user: userId,
                    type: 'like',
                    otherUserId: id,
                    otherUserName: user?.userName,
                    otherUserFullName: user.fullName,
                    otherUserProfilePic: user?.profilePic,
                    message: 'liked your post',
                    blogId,
                });
                const notification = await likeNotification.save();
                io.to(userId).emit('notification', notification);
            }

            return res.status(200).json({
                status: true,
                message: "Post liked successfully",
                response: updatedPost[0]
            });
        }
    } catch (error) {
        console.error('Error liking/unliking post:', error);
        return res.status(500).json({ status: false, response: error });
    }
};




const deleteBlog = async (req, res) => {
    const { id } = req.params;
    let blog, user;
    const io = req.app.get('socketio');

    try {

        blog = await Blogs.findById(id);
        const userId = blog?.author?.toString();
        user = await Users.findById(userId)
        if (!blog) {
            return res.status(400).json({ status: false, message: "Blog not found.", response: {} });
        }

        // Delete associated images from the filesystem
        for (const imageUrl of blog.imageUrls) {
            const filename = path.basename(imageUrl);
            const imagePath = path.join(__dirname, '../uploads', filename);

            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
                // console.log('Deleted image:', imagePath);
            } else {
                console.log('Image file not found:', imagePath);
            }
        }

        // Delete the blog post
        await Blogs.findByIdAndDelete(id);
        await Users.updateMany(
            { blogs: id },
            { $pull: { blogs: id } }
        );
        const allBlogs = await Blogs.find()
        const blogs = allBlogs.reverse();
        io.emit('deleteBlog', blogs);
        const notification = new Notification({
            user: userId,
            type: 'delete',
            otherUserName: user?.userName,
            otherUserProfilePic: user?.profilePic,
            message: 'Your blog post has been deleted successfully.',
            blogId: blog?._id,
        });
        await notification.save();
        io.to(userId).emit('notification', notification);

        return res.status(200).json({ status: true, message: "Blog deleted successfully.", response: {} });
    } catch (error) {
        console.error('Error deleting blog:', error);
        return res.status(500).json({ status: false, message: "Internal server error.", response: { error } });
    }
}

const postBlog = async (req, res) => {
    const id = req?.user;
    let uploadedBlog;
    const { tittle, content, tags, imageUrls } = req.body;
    const io = req.app.get('socketio');

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    }
    try {
        uploadedBlog = await Blogs.find({ author: id });
        let user = await Users.findById(id)
        // Decode and save images
        const savedImageUrls = [];
        let updatedContent = content;

        for (const imageUrl of imageUrls) {
            const matches = imageUrl.match(/^data:image\/(\w+);base64,/);
            if (matches) {
                const extension = matches[1]; // Get the image extension (e.g., 'png', 'jpeg')
                const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, '');
                const imageFileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}.${extension}`;
                const imagePath = path.join(__dirname, '..', 'uploads', imageFileName); // Specify the path where you want to save the image
                fs.writeFileSync(imagePath, base64Data, 'base64');
                const backendImageUrl = `${req.protocol}://${req.get('host')}/uploads/${imageFileName}`; // Store the path to the saved image
                savedImageUrls.push(backendImageUrl);
                updatedContent = updatedContent.replace(new RegExp(escapeRegExp(imageUrl), 'g'), backendImageUrl); // Replace all occurrences of the base64 image URL with the backend URL in the content
            }
        }

        // Create a new blog document
        const blog = new Blogs({
            tittle,
            content: updatedContent,
            tags,
            imageUrls: savedImageUrls, // Store the paths to the saved images in the database
            author: id
        });
        const savedBlog = await blog.save();
        let userId = savedBlog?.author.toString();
        await Users.findByIdAndUpdate(id, {
            $push: { blogs: savedBlog._id }
        });
        const notification = new Notification({
            user: id,
            type: 'upload',
            message: `Blog Uploded Successfully`,
            blogId: savedBlog?._id
        });

        const sendNotification = await notification.save();

        const allBlogs = await Blogs.find()
        const blogs = allBlogs.reverse();
        console.log('ALLLLLLLLLLBLOGSSS-----------------' + user?.profilePic)

        io.emit('blogUpdate', blogs);

        io.to(userId).emit('notification', sendNotification);
        const otherUsers = await Subscription.find({ channel: userId }).select('subscriber');
        console.log('other users: - ' + otherUsers);    
        const followers = otherUsers.map(sub => sub.subscriber.toString());
        console.log(followers)
        console.log('-----------------' + sendNotification);
        // Create notifications for all other users
        const viewerNotifications = followers.map(followerId => ({
            user: followerId,
            type: 'upload-veiw',
            otherUserName: user?.userName,
            otherUserProfilePic: user?.profilePic,
            message: `uploaded a new blog`,
            blogId: savedBlog?._id
        }));
        const sendNotifications = await Notification.insertMany(viewerNotifications);

        // // Emit notifications via Socket.IO
        // io.sockets.sockets.forEach((socket) => {
        //     if (socket.userId !== userId) { // Exclude the socket corresponding to the user who uploaded the blog
        //         sendNotifications.forEach(notification => {
        //             socket.emit('notification', notification);
        //         });
        //     }
        // });

        [...followers].forEach(followerId => {
            io.to(followerId).emit('notification', sendNotifications.find(notification => notification.user.toString() === followerId));
        });

        return res.status(200).json({ status: true, message: 'Blog Uploaded!!' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, message: 'Internal Server Error', response: {} });
    }
};

const updateBlog = async (req, res) => {
    const { id } = req.params;
    const { tittle, content, tags, imageUrls } = req.body;
    // console.log(imageUrls);
    const io = req.app.get('socketio');

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    }
    try {
        let blogPost = await Blogs.findById(id);
        let userId = blogPost?.author.toString();
        let user = await Users.findById(userId);
        if (!blogPost) {
            return res.status(400).json({ status: false, message: 'Blog not found or already deleted', response: {} });
        }
        // console.log(imageUrls);
        // Compare existing imageUrls with the updated ones
        const imagesToDelete = blogPost.imageUrls.filter(url => !imageUrls.includes(url));
        const newImages = imageUrls.filter(url => !blogPost.imageUrls.includes(url));
        let savedImageUrls = blogPost.imageUrls.filter(url => imageUrls.includes(url)); // Retain only the existing image URLs that are still present in the update

        let updatedContent = content;

        // Delete images that are no longer present
        for (const url of imagesToDelete) {
            const filename = path.basename(url);
            const imagePath = path.join(__dirname, '..', 'uploads', filename);

            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
                // console.log('Deleted image:', imagePath);
            } else {
                console.log('Image file not found:', imagePath);
            }
        }

        // Add new images
        for (const url of newImages) {
            const matches = url.match(/^data:image\/(\w+);base64,/);
            if (matches) {
                const extension = matches[1];
                const base64Data = url.replace(/^data:image\/\w+;base64,/, '');
                const imageFileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}.${extension}`;
                const imagePath = path.join(__dirname, '..', 'uploads', imageFileName);
                fs.writeFileSync(imagePath, base64Data, 'base64');
                const backendImageUrl = `${req.protocol}://${req.get('host')}/uploads/${imageFileName}`;
                savedImageUrls.push(backendImageUrl);
                updatedContent = updatedContent.replace(new RegExp(escapeRegExp(url), 'g'), backendImageUrl); // Replace all occurrences of the base64 image URL with the backend URL in the content
            }
        }

        // Update the blog post with new data
        blogPost = await Blogs.findByIdAndUpdate(id, { tittle, content: updatedContent, tags, imageUrls: savedImageUrls }, { new: true });
        const notification = new Notification({
            user: userId,
            type: 'edit',
            message: 'Your blog post has been updated successfully.',
            blogId: blogPost?._id,
        });
        await notification.save();
        io.to(userId).emit('notification', notification);
        return res.status(200).json({ status: true, message: 'Blog updated successfully', response: { blogPost } });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, message: 'Internal Server Error', response: {} });
    }
}

const getAllBlogs = async (req, res) => {
    const userId = req?.user;
    // console.log(userId);

    try {
        // Find all blogs
        const uploadedBlogs = await Blogs.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'authorDetails'
                }
            },
            { $unwind: '$authorDetails' }, // Unwind the array created by $lookup
            {
                $project: {
                    author: 0,
                    'authorDetails.OTP': 0,
                    'authorDetails.expiryTimeStamp': 0,
                    'authorDetails.password': 0,
                    'authorDetails.userToken': 0,
                    // 'authorDetails._id': 0,
                    'authorDetails.phoneNumber': 0,
                    'authorDetails.gender': 0
                }
            } // Exclude sensitive fields like password
        ]);

        // Check if user is authenticated and modify author name if necessary
        if (userId) {
            uploadedBlogs.forEach(blog => {
                // console.log(blog);
                if (blog.authorDetails._id.toString() === userId.toString()) {
                    blog.authorDetails.fullName = 'You';
                }
                delete blog.authorDetails._id;
                return blog;

            });
        }

        const allTags = uploadedBlogs.reduce((tags, blog) => {
            return [...tags, ...blog.tags];
        }, []);
        const uniqueTags = [...new Set(allTags)];

        let uploadedReverseBlogs = uploadedBlogs.reverse();
        return res.status(200).json({ status: true, message: 'All blogs with author details', response: { uploadedReverseBlogs, tags: uniqueTags } });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, message: 'Internal Server Error', response: {} });
    }
}
const fetchBlogPost = async (req, res) => {
    let blog, isAllowedToEdit = false;
    const userId = req?.user
    let id;
    if (userId) {
        id = userId.toString();
    }
    // console.log("here is the userId: " + userId);
    const { _id } = req?.params
    try {
        blog = await Blogs.findOne({ _id }).populate([
            {
                path: 'author',
                select: '-password -userToken -OTP -expiryTimeStamp'
            },
            {
                path: 'likes',
                select: 'fullName profilePic userName'
            }
        ]);
        if (!blog) {
            return res.status(400).json({ status: false, message: "No blog data foud", response: {} })
        }
        if (id === blog?.author?._id.toString()) {
            isAllowedToEdit = true;
        }


        return res.status(200).json({ status: true, message: 'Success', response: { blog, isAllowedToEdit } })
    } catch (error) {
        console.log(error);
    }
}

const fetchBlogs = async (req, res) => {
    const id = req.params;
    let user, blogs;
    try {
        user = await Users.findOne({ _id: id })
        if (!user) {
            return res.status(400).json({ status: false, message: 'User not found', response: {} })
        }
        blogs = await Blogs.find({ author: id });
        if (!blogs) {
            return res.status(400).json({ status: false, message: 'No blogs found', response: {} })
        }
        const userBlogs = blogs.reverse();
        return res.status(400).json({ status: true, message: 'Success', response: { userBlogs } });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, message: 'Internal server error', response: { error } })
    }
}
const fetchAllComments = async (req, res) => {
    const postId = req.params.postId;
    let blog;
    try {

        blog = await Blogs.findById(postId).populate('comments.author', 'fullName userName profilePic');
        if (!blog) {
            return res.status(400).json({ status: false, message: "Blog Not Found", response: {} })
        }
        // console.log(blog);
        return res.status(200).json({ status: true, message: "Success", response: blog })
    } catch (error) {
        return res.status(500).json({ status: false, message: "Internav server error", response: error })
    }
}

const fetchUserBlogs = async (req, res) => {
    const id = req?.user
    // console.log(id);
    let existingUser, blogPosts;
    try {
        existingUser = await Users.findOne({ _id: id }).select('-password -userToken -OTP -expiryTimeStamp')
        if (!existingUser) {
            return res.status(400).json({ status: false, message: 'User not found', response: {} })
        }
        // const data = {...existingUser.toObject()};
        // delete data.password
        // delete data.userToken
        // blogPosts = await Blogs.find({author: id});
        // console.log(blogPosts);
        // return res.status(200).json({status: true, message: "Success", response:{data, blogPosts}})

        blogPosts = await Blogs.find({ author: id })
            .populate('author', '-password -userToken -OTP -expiryTimeStamp');
        // console.log(blogPosts);
        if (!blogPosts) {
            return res.status(400).json({ status: false, message: "No blogs found", response: {} })
        }
        const userBlogPosts = blogPosts.reverse();
        return res.status(200).json({ status: true, message: "Success", response: { userData: existingUser, userBlogPosts } });
    } catch (error) {
        console.log(error);
    }
}

const searchBy = async (req, res) => {
    const { search, selectedTag, selectedSort, createdDate, userName } = req.query;
    const userId = req?.user;

    const allTags = selectedTag ? selectedTag.split(',') : [];
    let searchResult = [];
    // console.log(userId);
    // console.log('userName ------------------------------'+ userName);
    try {
        let pipeline = [];
        const escapeRegExp = (search) => {
            return search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'); // Escape special characters
        };
        const escapedSearch = search ? escapeRegExp(search) : null;

        // Lookup and unwind stages to join users data to blog as authorDetails
        pipeline.push({
            $lookup: {
                from: 'users',
                localField: 'author',
                foreignField: '_id',
                as: 'authorDetails'
            }
        }, {
            $unwind: '$authorDetails'
        });

        // Construct the $match stage
        let matchConditions = [];

        if (userName && userName !== '@undefined') {
            matchConditions.push({ 'authorDetails.userName': userName });
        }

        if (escapedSearch) {
            matchConditions.push({
                $or: [
                    { 'authorDetails.userName': { $regex: new RegExp(escapedSearch, 'i') } },
                    { 'authorDetails.fullName': { $regex: new RegExp(escapedSearch, 'i') } },
                    { 'authorDetails.email': { $regex: new RegExp(escapedSearch, 'i') } },
                    { tittle: { $regex: new RegExp(escapedSearch, 'i') } },
                    { tags: { $regex: new RegExp(escapedSearch, 'i') } },
                    { 'authorDetails.userName': search },
                    { 'authorDetails.fullName': { $eq: search } },
                    { 'authorDetails.email': { $eq: search } },
                    { tittle: { $eq: search } },
                    { tags: { $eq: search } }
                ]
            });
        }

        if (allTags.length > 0) {
            const orConditions = allTags.map(tag => ({ tags: { $in: [tag] } }));
            matchConditions.push({ $or: orConditions });
        }

        if (createdDate) {
            matchConditions.push({
                date: {
                    $gte: new Date(createdDate),
                    $lt: new Date(new Date(createdDate).setDate(new Date(createdDate).getDate() + 1))
                }
            });
        }

        if (selectedSort) {
            switch (selectedSort) {
                case "today":
                    const today = new Date();
                    today.setUTCHours(0, 0, 0, 0);
                    const startOfTomorrow = new Date(today);
                    startOfTomorrow.setUTCDate(today.getUTCDate() + 1);
                    matchConditions.push({
                        date: {
                            $gte: today,
                            $lt: startOfTomorrow
                        }
                    });
                    break;
                case "yesterday":
                    const startOfToday = new Date();
                    startOfToday.setUTCHours(0, 0, 0, 0);
                    const endOfYesterday = new Date(startOfToday);
                    endOfYesterday.setUTCDate(startOfToday.getUTCDate() - 1);
                    matchConditions.push({
                        date: {
                            $gte: endOfYesterday,
                            $lt: startOfToday
                        }
                    });
                    break;
                case "lastWeek": {
                    const today = new Date();
                    const startOfThisWeek = new Date(today);
                    startOfThisWeek.setUTCHours(0, 0, 0, 0); // Set to the start of the day in UTC
                    const endOfThisWeek = new Date(today);
                    endOfThisWeek.setUTCHours(23, 59, 59, 999); // Set to the end of the day in UTC
                    const startOfLastWeek = new Date(startOfThisWeek);
                    const endOfLastWeek = new Date(endOfThisWeek);

                    // Adjust startOfLastWeek to Monday of last week
                    startOfLastWeek.setDate(startOfThisWeek.getDate() - startOfThisWeek.getUTCDay() - 6);
                    // Adjust endOfLastWeek to Sunday of last week
                    endOfLastWeek.setDate(endOfThisWeek.getDate() - endOfThisWeek.getUTCDay());

                    matchConditions.push({
                        date: {
                            $gte: startOfLastWeek,
                            $lte: endOfLastWeek
                        }
                    });
                }
                    break;
                case "lastMonth": {
                    const today = new Date();
                    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

                    matchConditions.push({
                        date: {
                            $gte: startOfLastMonth,
                            $lte: endOfLastMonth
                        }
                    });
                }
                    break;
                default:
                    break;
            }
        }

        if (matchConditions.length > 0) {
            pipeline.push({
                $match: {
                    $and: matchConditions
                }
            });
        } else {
            pipeline.push({ $match: {} });
        }

        // Project stage to exclude sensitive fields
        pipeline.push({
            $project: {
                author: 0,
                'authorDetails.password': 0,
                'authorDetails.phoneNumber': 0,
                'authorDetails.userToken': 0,
                'authorDetails.firstname': 0,
                'authorDetails.lastName': 0,
                'authorDetails.gender': 0 // Exclude sensitive fields like password
            }
        });

        // Add $addFields to conditionally replace author's name with "you"
        if (userId) {
            pipeline.push({
                $addFields: {
                    'authorDetails.fullName': {
                        $cond: {
                            if: { $eq: [{ $toString: '$authorDetails._id' }, userId.toString()] },
                            then: 'You',
                            else: '$authorDetails.fullName'
                        }
                    }
                }
            });
        }

        // console.log(JSON.stringify(pipeline, null, 2)); // Debugging pipeline
        const result = await Blogs.aggregate(pipeline);
        // const result = await Blogs.aggregate([{
        //     $match:{
        //         search:'abc'
        //         gender:"male"
        //     }
        // }]);

        if (result.length === 0) {
            return res.status(200).json({ status: false, message: "No blog found", response: { searchResult } });
        }

        searchResult = result.reverse();
        return res.status(200).json({ status: true, message: "Success", response: { searchResult } });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
};
const getUserNotifications = async (req, res) => {
    const id = req?.user;
    const io = req.app.get('socketio');
    try {
        // Calculate the date one week ago
        const tenSecondsAgo = new Date();
        tenSecondsAgo.setSeconds(tenSecondsAgo.getSeconds() - 10);
        await Notification.deleteMany({ user: id, isRead: true, createdAt: { $lt: tenSecondsAgo } });

        // Fetch unread notifications for the user
        // const unreadNotifications = await Notification.find({ user: id, isRead: false }).sort({ createdAt: -1 });
        const allNotifications = await Notification.find({ user: id }).sort({ createdAt: -1 });
        return res.status(200).json({ status: true, message: "Success", response: allNotifications })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, message: 'Internal Server Error', response: {} });
    }
};


const readNotification = async (req, res) => {
    const notificationId = req?.params?.id;
    const id = req?.user;
    console.log(id)
    const io = req.app.get('socketio');
    try {
        // Find the notification by ID and update isRead to true
        const updatedNotification = await Notification.findByIdAndUpdate(
            notificationId,
            { isRead: true }
        );
        console.log(id === updatedNotification?.user.toString(), '-------------------' + updatedNotification);

        if (!updatedNotification) {
            return res.status(404).json({ status: false, message: 'Notification not found' });
        }
        const allNotifications = await Notification.find({ user: id }).sort({ createdAt: -1 });
        // console.log('----------------------------------------------------------IsRead' + allNotifications)
        io.to(id).emit('read-notification', allNotifications);
        return res.status(200).json({ status: true, message: 'Notification marked as read', response: allNotifications });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: 'Internal Server Error', error });
    }
}


module.exports = { readNotification, getUserNotifications, uploadComment, uploadLikes, deleteBlog, postBlog, updateBlog, getAllBlogs, fetchBlogPost, fetchBlogs, fetchAllComments, fetchUserBlogs, searchBy }



// old code: - 
// const multer = require('multer');
// const fs = require('fs');
// const path = require('path');
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         console.log(req,file);
//         const uploadPath = path.join(__dirname, '../uploads');
//         fs.mkdirSync(uploadPath, { recursive: true });
//         cb(null, uploadPath);
//     },
//     filename: (req, file, cb) => {
//         // Remove spaces from the file name
//         const filename = file.originalname.replace(/\s+/g, '_');
//         cb(null, Date.now() + '-' + filename); // Specify the file name
//     }
// });

// const upload = multer({ storage });

// const uploadImage = (req, res) => {
//     try {
//         const file = req.file;
//         if (!file) {
//             return res.status(400).json({status: true,  message: 'No file uploaded', response: {} });
//         }
//         const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
//         res.status(200).json({status: true, message: 'File uploded', response: imageUrl });
//     } catch (error) {
//         console.error('Error uploading image:', error);
//         res.status(500).json({status: false, message: 'Server error', response: error });
//     }
// };

// const deleteImage = (req,res)=>{
//     const { url } = req.body;

//     // Extract the filename from the URL
//     const filename = path.basename(url);

//     // Construct the full path to the image relative to the project root
//     const imagePath = path.join(__dirname, '../uploads', filename);

//     // Log the image path for debugging
//     console.log('Deleting image:', imagePath);

//     // Check if the file exists before attempting to delete it
//     if (fs.existsSync(imagePath)) {
//         fs.unlink(imagePath, (err) => {
//             if (err) {
//                 console.error('Error deleting image:', err);
//                 return res.status(500).json({ message: 'Error deleting image' });
//             }
//             res.status(200).json({ message: 'Image deleted successfully' });
//         });
//     } else {
//         console.error('File not found:', imagePath);
//         res.status(404).json({ message: 'File not found' });
//     }
// }
// module.exports = {
//     upload,
//     uploadImage,
//     deleteImage
// };


// const likeBlog =async (req,res)=>{
//     const postId = req?.params?.postId;
//     let post;
//     try {
//         post = await Blogs.findById(postId);
//         if(!post){
//             return res.status(400).json({status: false, message:'Blog not found', response:{}})
//         }
//         post.likes +=1;
//         await post.save();
//         return res.status(200).json({response:post.likes});
//     } catch (error) {
//         return res.status(500).json({status: false, message:"Internal server error", response: error})
//     }
// }