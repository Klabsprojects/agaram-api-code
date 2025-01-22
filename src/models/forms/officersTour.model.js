const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const Schema = mongoose.Schema;
const profile = require('../employee/employeeProfile.model');
const state = require('../state/state.model');
const district = require('../state/district.model');
const departments = require('../categories/department.model');
const designations = require('../categories/designation.model');
const categories = require('../categories/categories.model');

const officersTourSchema = new Schema({
	proposedState: String,
	stateId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'state'
	},
	state: String,
	districtId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'district'
	},
	district: String,
	place: String,
	typeOfTour: String,
	fromDate: Date,
	toDate: Date,
	purpose: String,
	organisationHostName: String,
	OtherOfficers: [{
		employeeProfileId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'profile' 
		},
		departmentId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'departments'
		},
		designationId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'designations'
		},
	}],
	presentStatus: String,
	orderFile: String,
	orderType: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'categories'
	},
	orderNo: Number,
	orderFor: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'categories'
	},
	dateOfOrder: Date,
	rejectReasons: String,
	remarks: String,
	createdAt: {
		type: Date,
		default: Date.now
	},
});

module.exports = mongoose.model('officerstours', officersTourSchema);