const mongoose = require('mongoose');
const employeeProfileModel = require('../employee/employeeProfile.model');
const { ObjectId } = require('mongodb');
const Schema = mongoose.Schema;

const officialForeignVisitSchema = new Schema({
    officer_name: String,
	employeeProfileId: ObjectId,
	designation: String,
	designationId: ObjectId,
	proposedCountry: String,
	fromDate: Date,
	toDate: Date,
	otherDelegates: String,
	presentStatus: String,
	rejectReason: String, //
	faxMessageLetterNo: String, //
	dateOfOrder: Date,
	politicalClearance: String, //file
	fcraClearance: String, //file
	fundsSanctionedBy: Number,
	fundsSanctioned: Number,
	orderType: ObjectId, 
	orderNo: ObjectId, 
	orderFor: ObjectId,
	dateOfOrder: Date,
	createdAt: {
		type: Date, 
		default: Date.now
	},
});

module.exports = mongoose.model('officialForeignVisit', officialForeignVisitSchema);