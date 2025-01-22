const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const { required } = require('joi');
const Schema = mongoose.Schema;

const faqSchema = new Schema({
    Question: {
        type: String,
        required: true
    },
    Answer: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date, 
        default: Date.now
    },
});


module.exports = mongoose.model('faqs', faqSchema);