const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const Schema = mongoose.Schema;

const login = require('../login/login.model');
const profile = require('../employee/employeeProfile.model');

const intimationSchema = new Schema({
    officerName: String,
	//employeeProfileId: ObjectId,
	employeeProfileId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'profile' // This references the AllocatedBlock model
	},
	designation: String,
	designationId: ObjectId,
	department: String,
	departmentId: ObjectId,
	detailsOfIntimation: String,
	fundSource: String,
	typeOfIntimation: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'categories'
		},
	previousSanctionOrder: String,
	selfOrFamily: String,
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

module.exports = mongoose.model('intimation', intimationSchema);