const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const { required } = require('joi');
const Schema = mongoose.Schema;

const announcementSchema = new Schema({
    announcementDate: {
        type: Date,
        required: true
    },
    announcementText: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date, 
        default: Date.now
    },
});


module.exports = mongoose.model('announcements', announcementSchema);