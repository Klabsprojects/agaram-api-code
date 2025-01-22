const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const { required } = require('joi');
const Schema = mongoose.Schema;

const special_entiriesSchema = new Schema({
    SpecialEntiriesNumber: {
        type: String,
        required: true
    },
    SpecialEntiriesDate: {
        type: String,
        required: true
    },
    SpecialEntiriesDescription: {
        type: String,
        required: true
    },
    SpecialEntiriesFile: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date, 
        default: Date.now
    },
});


module.exports = mongoose.model('special_entiries', special_entiriesSchema);