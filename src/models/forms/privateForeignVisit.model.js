const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const Schema = mongoose.Schema;

const privateVisitSchema = new Schema({
    officer_name: String,
	employeeProfileId: ObjectId,
	designation: String,
	designationId: ObjectId,
	department: String,
	departmentId: ObjectId,
	proposedCountry: String,
	fromDate: Date,
	toDate: Date,
	fundSource: String,
	selfOrFamily: String,
	orderType: ObjectId, 
	orderNo: Number, 
	orderFor: ObjectId,
	dateOfOrder: Date,
	remarks: String,
	status: String,
	orderFile: String, //file
	createdAt: {
		type: Date, 
		default: Date.now
	},
});

module.exports = mongoose.model('privateVisit', privateVisitSchema);