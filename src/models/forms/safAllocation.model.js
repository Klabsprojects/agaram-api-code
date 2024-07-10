const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const { TIME } = require('sequelize');
const { number } = require('joi');
const Schema = mongoose.Schema;
const block = require('../../models/forms/block.model');
const application = require('../../models/forms/safApplication.model');

const profile = require('../employee/employeeProfile.model');

const safAllocationSchema = new Schema({
    officerName: {
		type: String, 
		required: true
	},
	/*employeeProfileId: {
		type: ObjectId, 
		required: true
	},*/
	employeeProfileId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'profile' // This references the AllocatedBlock model
	},
	designation: {
		type: String, 
		required: true
	},
	designationId: {
		type: ObjectId, 
		required: true
	},
	department: {
		type: String, 
		required: true
	},
	departmentId: {
		type: ObjectId, 
		required: true
	},
	//blockId: ObjectId,
	blockId: {
			type: mongoose.Schema.Types.ObjectId,
        	ref: 'block' // This references the AllocatedBlock model
		},
	applicationId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'application' // This references the AllocatedBlock model
		},
	dateOfAccomodation: Date,
	dateOfVacating: Date,
	employeeId: String,
	remarks: String,
	orderType: ObjectId, 
	orderNo: Number, 
	orderFor: ObjectId,
	dateOfOrder: Date,
	orderFile: String, //file
	createdAt: {
		type: Date, 
		default: Date.now
	},
	/*allocatedBlock: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AllocatedBlock' // This references the AllocatedBlock model
    }*/
});

module.exports = mongoose.model('safAllocation', safAllocationSchema);