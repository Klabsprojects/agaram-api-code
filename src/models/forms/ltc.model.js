const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const Schema = mongoose.Schema;

const profile = require('../employee/employeeProfile.model');
const login = require('../login/login.model');

const ltcSchema = new Schema({
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
	proposedPlaceOfVisit: String,
	fromDate: Date,
	toDate: Date,
	blockYear: String, //doubt
	selfOrFamily: String, //doubt
	fromPlace: String,
	toPlace: String,
	orderType: ObjectId, 
	orderNo: Number, 
	/*orderNo: {
        type: Number,
        unique: true, // Set the field as unique
    },*/
	orderFor: ObjectId,
	dateOfOrder: Date,
	orderFile: String, //file
	remarks: String,
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

module.exports = mongoose.model('ltc', ltcSchema);