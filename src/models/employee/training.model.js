const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const Schema = mongoose.Schema;

const trainingSchema = new Schema({
	employeeId: String,
	fullName: String,
	employeeProfileId: ObjectId,
	typeOfTraining: String,
	nameOfInstitute: String,
	fromDate: Date,
	endDate: Date,
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

module.exports = mongoose.model('training', trainingSchema);