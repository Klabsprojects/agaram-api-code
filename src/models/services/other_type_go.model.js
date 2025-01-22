const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const { required } = require('joi');
const Schema = mongoose.Schema;

const other_type_goSchema = new Schema({
    GoNumber: {
        type: String,
        required: true
    },
    GoDate: {
        type: String,
        required: true
    },
    GoDescription: {
        type: String,
        required: true
    },
    GoFile: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date, 
        default: Date.now
    },
});


module.exports = mongoose.model('other_type_gos', other_type_goSchema);