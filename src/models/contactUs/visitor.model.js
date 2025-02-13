const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const { required } = require('joi');
const { INTEGER } = require('sequelize');
const Schema = mongoose.Schema;

const visitorSchema = new Schema({
    visitUpdateDate: {
        type: Date,
        default: Date.now
    },
    count: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date, 
        default: Date.now
    },
});


module.exports = mongoose.model('visitor', visitorSchema);