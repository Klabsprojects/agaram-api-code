const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const { required } = require('joi');
const Schema = mongoose.Schema;

const faqSchema = new Schema({
    OfficerName: {
        type: String,
        required: true
    },
    PresentPost: {
        type: String,
        required: true
    },
	MobileNo: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date, 
        default: Date.now
    },
});


module.exports = mongoose.model('dros', faqSchema);