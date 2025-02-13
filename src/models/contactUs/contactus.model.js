const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const { required } = require('joi');
const Schema = mongoose.Schema;

const contactusSchema = new Schema({
    FullName: {
        type: String,
        required: true
    },
    EmailAddress: {
        type: String,
        required: true
    },
    Subject: {
        type: String,
        required: true
    },
    Message: {
        type: String,
        required: true
    },
    IsRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date, 
        default: Date.now
    },
});


module.exports = mongoose.model('contactus', contactusSchema);