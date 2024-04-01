const { ObjectID, ObjectId, BSON } = require('mongodb');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const employeeUpdateSchema = new Schema({
	empProfileId: ObjectId,
    updateType: String,
	orderTypeCategoryCode: ObjectId,
	orderNumber: Number,
	orderForCategoryCode: ObjectId,
	dateOfOrder: Date,
	employeeId: {
		type: String,
		required: true,
		unique: true,
		match: /^[A-Za-z0-9\s]+$/, // Regular expression to allow alphanumeric characters and spaces
	  },
	fullName: String,
	fromPostingInCategoryCode: ObjectId,
	fromDepartmentId: ObjectId,
	fromDesignationId: ObjectId,
	toPostingInCategoryCode: ObjectId,
	toDepartmentId: ObjectId,
	toDesignationId: ObjectId,
	postTypeCategoryCode: ObjectId,
	locationChangeCategoryId: ObjectId,
	orderFile: String,
	remarks: String,
	createdAt: {
		type: Date, 
		default: Date.now
	},
});

module.exports = mongoose.model('employeeUpdate', employeeUpdateSchema);