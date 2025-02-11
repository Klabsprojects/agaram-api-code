const { ObjectID, ObjectId, BSON } = require('mongodb');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const login = require('../login/login.model');

const previousPostingSchema = new Schema({
    updateType: String,
	droProfileId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'droProfile' // This references the AllocatedBlock model
	},
	previousPostingList: [{
		toPostingInCategoryCode: ObjectId,
		toDepartmentId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'departments' // This references the AllocatedBlock model
		},
		toDesignationId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'designations' // This references the AllocatedBlock model
		},
		fromDate: Date,
		toDate: Date,
		district: String,
	}],
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

module.exports = mongoose.model('previousPosting', previousPostingSchema);