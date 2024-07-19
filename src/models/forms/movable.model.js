const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const Schema = mongoose.Schema;

const login = require('../login/login.model');

const movableSchema = new Schema({
    officerName: String,
	employeeProfileId: ObjectId,
	designation: String,
	designationId: ObjectId,
	department: String,
	departmentId: ObjectId,
	typeOfMovableProperty: String,
	detailsOfMovableProperty: String,
	sourceOfFunding: String,
	totalCostOfProperty: Number,
	boughtFromName: String,
	boughtFromContactNumber: Number,
	boughtFromAddress: String,
	propertyShownInIpr: String,
	selfOrFamily: String,
	remarks: String,
	movableDateOfOrder: Date,
	previousSanctionOrder: String,
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

module.exports = mongoose.model('movable', movableSchema);