const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Message = mongoose.Schema({
    senderId: {
        type: String
    },

    // senderName: {
    //     type: String
    // },

    // receiverName: {
    //     type: String
    // },

    receiverId: {
        type: String
    },

    privateId: {
        type: String
    },

    body: {
        type: String
    },

    createdAt: {
        type: Date,
        default: Date.now()
    },
});

module.exports = mongoose.model('Message', Message);