const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const { required } = require('joi');
const Schema = mongoose.Schema;

const actsrulesSchema = new Schema({
    actsrulesNumber: {
        type: String,
        required: true
    },
    actsrulesDate: {
        type: String,
        required: true
    },
    actsrulesDescription: {
        type: String,
        required: true
    },
    actsrulesFile: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date, 
        default: Date.now
    },
});


module.exports = mongoose.model('actsrules', actsrulesSchema);