const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const Schema = mongoose.Schema;

const medicalReimbursementSchema = new Schema({
    officerName: String,
	employeeProfileId: ObjectId,
	designation: String,
	designationId: ObjectId,
	department: String,
	departmentId: ObjectId,
	detailsOfMedicalReimbursement: String,
	totalCostOfMedicalReimbursement: Number,
	dmeConcurranceStatus: String,
	selfOrFamily: String,
	dateOfApplication: Date,
	nameOfTheHospital: String,
	treatmentTakenFor: String,
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

module.exports = mongoose.model('medicalReimbursement', medicalReimbursementSchema);