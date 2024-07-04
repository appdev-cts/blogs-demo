const mongoose = require('mongoose');
const blogSchema = mongoose.Schema({
    tittle: {
        type: String
    },
    content:{
        type: String
    },
    tags: [{type: String}],
    imageUrls: [String] ,
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    comments: [{
        text: String,
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users'
        },
        date:{
            type: Date,
            default: Date.now
        }
    }],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    }],
    date:{
        type: Date,
        default: Date.now
    }
})

const Blogs = mongoose.model('Blogs', blogSchema)

module.exports = Blogs;