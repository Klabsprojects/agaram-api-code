const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const Schema = mongoose.Schema;

const employeeProfile = require('../employee/employeeProfile.model');
const login = require('../login/login.model');
const degree = require('../employee/degree.model');

const educationSchema = new Schema({
    officerName: String,
	//employeeProfileId: ObjectId,
	employeeProfileId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'employeeProfile' // This references the AllocatedBlock model
	},
	designation: String,
	designationId: ObjectId,
	department: String,
	departmentId: ObjectId,
	degreeData : [{
		courseLevel: String,
		specialisation: String,
		degree: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'degree' // This references the degree model
		},
		instituteName: String,
		locationState: ObjectId,
		locationCountry: ObjectId,
		durationOfCourse: Number,
		fund: String,
		fees: Number,
		courseCompletedYear: Number,
		courseCompletedDate: Date,
		addedBy: String
	}],
	remarks: String,
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

module.exports = mongoose.model('education', educationSchema);