const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const { required } = require('joi');
const Schema = mongoose.Schema;

const drosSchema = new Schema({
    DroFile: {
        type: String,
        required: true
    },
    DateOfUpload: {
        type: Date,
        required: true
    },
    createdAt: {
        type: Date, 
        default: Date.now
    },
});


module.exports = mongoose.model('dros', drosSchema);