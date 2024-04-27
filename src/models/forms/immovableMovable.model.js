const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const Schema = mongoose.Schema;

const immovableMovableSchema = new Schema({
    officer_name: String,
	employeeProfileId: ObjectId,
	designation: String,
	designationId: ObjectId,
	department: String,
	departmentId: ObjectId,
	details: String,
	sourceOfFunding: String,
	totalCostOfProperty: Number,
	previousSanctionOrder: String,
	selfOrFamily: String,
	propertyShownInIpr: String,
	orderType: ObjectId, 
	orderNo: Number, 
	orderFor: ObjectId,
	dateOfOrder: Date,
	remarks: String,
	propertyType: String,
	typeOfMovableProperty: String,
	createdAt: {
		type: Date, 
		default: Date.now
	},
});

module.exports = mongoose.model('immovableMovable', immovableMovableSchema);