const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const Schema = mongoose.Schema;

const ltcSchema = new Schema({
    officer_name: String,
	employeeProfileId: ObjectId,
	designation: String,
	designationId: ObjectId,
	department: String,
	departmentId: ObjectId,
	proposedPlaceOfVisit: String,
	fromDate: Date,
	toDate: Date,
	blockYear: String, //doubt
	selfOrFamily: String, //doubt
	fromPlace: String,
	toPlace: String,
	orderType: ObjectId, 
	orderNo: Number, 
	/*orderNo: {
        type: Number,
        unique: true, // Set the field as unique
    },*/
	orderFor: ObjectId,
	dateOfOrder: Date,
	orderFile: String, //file
	remarks: String,
	createdAt: {
		type: Date, 
		default: Date.now
	},
});

module.exports = mongoose.model('ltc', ltcSchema);