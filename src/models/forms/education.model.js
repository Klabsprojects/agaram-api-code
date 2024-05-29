const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const Schema = mongoose.Schema;

const educationSchema = new Schema({
    officerName: String,
	employeeProfileId: ObjectId,
	designation: String,
	designationId: ObjectId,
	department: String,
	departmentId: ObjectId,
	degreeData : [{
		courseLevel: String,
		specialisation: String,
		instituteName: String,
		locationState: ObjectId,
		locationCountry: ObjectId,
		durationOfCourse: Number,
		fund: String,
		fees: Number,
		courseCompletedYear: Number,
		courseCompletedDate: Date,
	}],
	remarks: String,
	orderType: ObjectId, 
	orderNo: Number, 
	orderFor: ObjectId,
	dateOfOrder: Date,
	orderFile: String, //file
	createdAt: {
		type: Date, 
		default: Date.now
	},
});

module.exports = mongoose.model('education', educationSchema);