const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const { required } = require('joi');
const Schema = mongoose.Schema;

const UtilityformsSchema = new Schema({
    UtilityNumber: {
        type: String,
        required: true
    },
    UtilityDate: {
        type: String,
        required: true
    },
    UtilityDescription: {
        type: String,
        required: true
    },
    UtilityFile: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date, 
        default: Date.now
    },
});


module.exports = mongoose.model('utilityforms', UtilityformsSchema);