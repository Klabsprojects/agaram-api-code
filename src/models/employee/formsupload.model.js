const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const { required } = require('joi');
const Schema = mongoose.Schema;

const profile = require('../employee/employeeProfile.model');
const login = require('../login/login.model');

const formsuploadSchema = new Schema({
    formFile: {
        type: String,
        required: true
    },
    remarks: {
        type: String,
        required: false
    },
    formType: {
        type: String,
        required: true
    },
        employeeProfileId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'profile' // This references the AllocatedBlock model
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'login' // This references the AllocatedBlock model
        },
        approvalStatus: {
            type: Boolean,
            default: false
        },
        approvedDate: {
            type: Date
        },
        createdAt: {
            type: Date, 
            default: Date.now
        },
});


module.exports = mongoose.model('formsupload', formsuploadSchema);