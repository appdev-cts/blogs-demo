const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
    subscriber:{
        type: mongoose.Schema.Types.ObjectId, ref: 'Users'
    },
    channel: {
      type: mongoose.Schema.Types.ObjectId, ref: 'Users'  
    },
    status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },

}, {timestamps: true})

const Subscription  = mongoose.model('Subscription', subscriptionSchema);
module.exports = Subscription;