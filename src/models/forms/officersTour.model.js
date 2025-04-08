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
		ref: 'categories',
		default: null
	},
	state: String,
	districtId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'categories',
		default: null
	},
	district: String,
	place: String,
	typeOfTour: String,
	fromDate: Date,
	toDate: Date,
	purpose: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'categories',
		default: null
	},
	organisationHostName: String,
	OtherOfficers: [{
		employeeProfileId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'profile' ,
			default: null
		},
		departmentId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'departments',
			default: null
		},
		designationId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'designations',
			default: null
		},
	}],
	presentStatus: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'categories',
		default: null
	},
	orderFile: String,
	orderType: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'categories',
		default: null
	},
	orderNo: Number,
	orderFor: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'categories',
		default: null
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