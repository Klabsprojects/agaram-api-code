const { ObjectID, ObjectId, BSON } = require('mongodb');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// const degree = require('../employee/degree.model');
// const department = require('../categories/department.model');
const departments = require('../categories/department.model');

const droProfileSchema = new Schema({
	departmentId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'departments'
	  },
	fullName: String, 
	gender: ObjectId,
	dateOfBirth: Date,
	dateOfJoining: Date,
	dateOfRetirement: Date,
	state: ObjectId,
	batch: Number,
	recruitmentType: ObjectId,
	serviceStatus: ObjectId,
	community: ObjectId,
	caste: String,
	religion: ObjectId,
	degreeData : [{
		courseLevel: String,
		specialisation: String,
		degree: {
			type: Schema.Types.Mixed, // Allows any type
			validate: {
				validator: function(value) {
					// Check if the value is an empty string or a valid ObjectId
					return value === '' || mongoose.Types.ObjectId.isValid(value);
				},
				message: 'Invalid degree ID or empty string.'
			},
			default: ''
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
	},
	personalEmail: [String],
	mobileNo1: Number,
	mobileNo2: Number,
	mobileNo3: Number,
	addressLine: String,
	city: String,
	pincode: String,
	employeeId: String,
	ifhrmsId: String,
	imagePath: String,
	foreignVisit: String,
	foreignVisitCount: Number,
	seniority: Number,
	languages: String,
	lastDateOfPromotion: Date,
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
	orderType: ObjectId, 
	orderNo: Number, 
	orderFor: ObjectId,
	dateOfOrder: Date,
	orderFile: String,
	remarks: String,
	createdAt: {
		type: Date, 
		default: Date.now
	},
});

module.exports = mongoose.model('droProfile', droProfileSchema);