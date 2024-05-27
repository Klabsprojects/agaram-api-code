const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const { TIME } = require('sequelize');
const { number } = require('joi');
const Schema = mongoose.Schema;

const safAllocationSchema = new Schema({
    officerName: {
		type: String, 
		required: true
	},
	employeeProfileId: {
		type: ObjectId, 
		required: true
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
	blockId: ObjectId,
	dateOfAccomodation: Date,
	dateOfVacating: Date,
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

module.exports = mongoose.model('safAllocation', safAllocationSchema);