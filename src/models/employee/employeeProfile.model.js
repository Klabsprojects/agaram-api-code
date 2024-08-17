const { ObjectID, ObjectId, BSON } = require('mongodb');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const degree = require('../employee/degree.model');

const employeeProfileSchema = new Schema({
    fullName: String,
	gender: ObjectId,
	dateOfBirth: Date,
	dateOfJoining: Date,
	dateOfRetirement: Date,
	state: ObjectId,
	batch: Number,
	recruitmentType: ObjectId,
	serviceStatus: ObjectId,
	qualification1: String,
	qualification2: String,
	community: ObjectId,
	caste: String,
	religion: ObjectId,
	degreeData : [{
		courseLevel: String,
		specialisation: String,
		degree: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'degree' // This references the degree model
		},
		instituteName: String,
		locationState: String,
		locationCountry: String,
		durationOfCourse: Number,
		fund: String,
		fees: Number,
		courseCompletedYear: Number,
		courseCompletedDate: Date,
		addedBy: String
		 }],
	promotionGrade: ObjectId,
	payscale: String,
	officeEmail: {
		type: String,
		unique: true
	},
	personalEmail: [String],
	mobileNo1: Number,
	mobileNo2: Number,
	mobileNo3: Number,
	addressLine: String,
	city: String,
	pincode: Number,
	employeeId: String,
	ifhrmsId: String,
	photo: Buffer,
	foreignVisit: String,
	foreignVisitCount: Number,
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
	loginId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'login' // This references the AllocatedBlock model
	},
	createdAt: {
		type: Date, 
		default: Date.now
	},
});

module.exports = mongoose.model('employeeProfile', employeeProfileSchema);