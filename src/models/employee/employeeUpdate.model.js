const { ObjectID, ObjectId, BSON } = require('mongodb');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const employeeUpdateSchema = new Schema({
    updateType: String,
	orderTypeCategoryCode: String,
	orderNumber: Number,
	orderForCategoryCode: String,
	dateOfOrder: Date,
	employeeId: {
		type: String,
		required: true,
		unique: true,
		match: /^[A-Za-z0-9\s]+$/, // Regular expression to allow alphanumeric characters and spaces
	  },
	fullName: String,
	fromPostingInCategoryCode: String,
	fromDepartmentId: ObjectId,
	fromDesignationId: ObjectId,
	toPostingInCategoryCode: String,
	toDepartmentId: ObjectId,
	toDesignationId: ObjectId,
	postTypeCategoryCode: String,
	locationChangeCategoryId: ObjectId,
	orderFile: String,
	remarks: String,
	createdAt: {
		type: Date, 
		default: Date.now
	},
});

module.exports = mongoose.model('employeeUpdate', employeeUpdateSchema);