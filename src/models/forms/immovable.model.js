const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const Schema = mongoose.Schema;

const immovableSchema = new Schema({
    officerName: String,
	employeeProfileId: ObjectId,
	designation: String,
	designationId: ObjectId,
	department: String,
	departmentId: ObjectId,
	typeOfImmovableProperty: String,
	detailsOfImovableProperty: String,
	sourceOfFunding: String,
	totalCostOfProperty: Number,
	boughtFromName: String,
	boughtFromContactNumber: Number,
	boughtFromAddress: String,
	propertyShownInIpr: Boolean,
	selfOrFamily: String,
	remarks: String,
	immovableDateOfOrder: Date,
	previousSanctionOrder: String,
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

module.exports = mongoose.model('immovable', immovableSchema);