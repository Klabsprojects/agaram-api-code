const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const Schema = mongoose.Schema;

const profile = require('../employee/employeeProfile.model');
const login = require('../login/login.model');

const officialForeignVisitSchema = new Schema({
    officerName: String,
	employeeProfileId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'profile' // This references the AllocatedBlock model
	},
	designation: String,
	designationId: ObjectId,
	department: String,
	departmentId: ObjectId,
	proposedCountry: String,
	fromDate: Date,
	toDate: Date,
	otherDelegates: String,
	presentStatus: String,
	rejectReason: String, 
	faxMessageLetterNo: String, 
	dateOfOrderofFaxMessage: Date,
	politicalClearance: String, //file
	fcraClearance: String, //file
	fundsSanctionedBy: String,
	fundsSanctioned: Number,
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

module.exports = mongoose.model('officialForeignVisit', officialForeignVisitSchema);