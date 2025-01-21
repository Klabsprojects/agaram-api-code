const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const { required } = require('joi');
const Schema = mongoose.Schema;

const circularSchema = new Schema({
    CircularNumber: {
        type: String,
        required: true
    },
    CircularDate: {
        type: String,
        required: true
    },
    CircularDescription: {
        type: String,
        required: true
    },
    CircularFile: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date, 
        default: Date.now
    },
});


module.exports = mongoose.model('circulars', circularSchema);