const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const employeeProfileSchema = new Schema({
    fullName: String,
	gender: String,
	dateOfBirth: Date,
	dateOfJoining: Date,
	dateOfRetirement: Date,
	state: String,
	batch: Number,
	recruitmentType: String,
	serviceStatus: String,
	qualification1: String,
	qualification2: String,
	community: String,
	caste: String,
	email: { 
		type: String, 
		unique: true 
	},
	mobileNo1: Number,
	mobileNo2: Number,
	mobileNo3: Number,
	employeeId: String,
	ifhrmsId: String,
	createdAt: {
		type: Date, 
		default: Date.now
	},
});

module.exports = mongoose.model('employeeProfile', employeeProfileSchema);