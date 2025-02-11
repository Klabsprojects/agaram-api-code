const { ObjectID, ObjectId, BSON } = require('mongodb');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const login = require('../login/login.model');
const droProfile = require('../employee/droProfile.model');

const droUpdateSchema = new Schema({
    updateType: String,
	orderTypeCategoryCode: ObjectId,
	orderNumber: Number,
	orderForCategoryCode: ObjectId,
	dateOfOrder: Date,
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
	// empProfileId: ObjectId,
	// employeeId: String,
	// fullName: String,
	// fromPostingInCategoryCode: ObjectId,
	// fromDepartmentId: ObjectId,
	// fromDesignationId: ObjectId,
	// toPostingInCategoryCode: ObjectId,
	// toDepartmentId: ObjectId,
	// toDesignationId: ObjectId,
	// promotionGrade: ObjectId,
	// promotedGrade: ObjectId,
	// additionalCharge: String,
	// postTypeCategoryCode: ObjectId,
	// locationChangeCategoryId: ObjectId,
	additionalCharge: String,
	transferOrPostingEmployeesList: [{
		droProfileId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'droProfile' // This references the AllocatedBlock model
		},
		//empProfileId: ObjectId,
		employeeId: String,
		fullName: String,
		fromPostingInCategoryCode: ObjectId,
		fromDepartmentId: ObjectId,
		fromDesignationId: ObjectId,
		toPostingInCategoryCode: ObjectId,
		toDepartmentId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'departments' // This references the AllocatedBlock model
		},
		toDesignationId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'designations' // This references the AllocatedBlock model
		},
		postTypeCategoryCode: ObjectId,
		locationChangeCategoryId: ObjectId,
		promotionGrade: ObjectId,
		promotedGrade: ObjectId,
	}],
	orderFile: String,
	remarks: String,
	createdAt: {
		type: Date, 
		default: Date.now
	},
});

module.exports = mongoose.model('droUpdate', droUpdateSchema);