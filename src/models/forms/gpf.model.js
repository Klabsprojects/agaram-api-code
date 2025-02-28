const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const Schema = mongoose.Schema;

const login = require('../login/login.model');
const profile = require('../employee/employeeProfile.model');

const gpfSchema = new Schema({
    officerName: String,
	employeeProfileId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'profile' // This references the profile model
	},
	designation: String,
	designationId: ObjectId,
	department: String,
	departmentId: ObjectId,
	//gpfType: String,
	gpfType: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'categories'
	},
	availedDate: Date,
	availedAmount: Number,
	purpose: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'categories'
	},
	remarks: String,
	orderType: ObjectId, 
	orderNo: Number, 
	orderFor: ObjectId,
	dateOfOrder: Date,
	orderFile: String, //file
	submittedBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'login' // This references the AllocatedBlock model
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

module.exports = mongoose.model('gpf', gpfSchema);