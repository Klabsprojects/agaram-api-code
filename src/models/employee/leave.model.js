const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const Schema = mongoose.Schema;

const leaveSchema = new Schema({
	employeeId: String,
	fullName: String,
	employeeProfileId: ObjectId,
	typeOfLeave: String,
	fromDate: Date,
	endDate: Date,
	foreignVisitOrDeftCountry: String,
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
});

module.exports = mongoose.model('leave', leaveSchema);