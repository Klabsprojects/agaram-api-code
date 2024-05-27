const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const { TIME } = require('sequelize');
const { number } = require('joi');
const Schema = mongoose.Schema;

const safApplicationSchema = new Schema({
    officerName: {
		type: String, 
		required: true
	},
	employeeProfileId: {
		type: ObjectId, 
		required: true
	},
	designation: {
		type: String, 
		required: true
	},
	designationId: {
		type: ObjectId, 
		required: true
	},
	department: {
		type: String, 
		required: true
	},
	departmentId: {
		type: ObjectId, 
		required: true
	},
	appliedOn: {
		type: Date, 
		default: Date.now
	},
	appliedTime: {
		type: String, 
		default: getCurrentTime
	},
	seniorityNumber: {
		type: Number,
		unique: true
	},
	waitingPeriod: {
		type: Number,
		default: 0
	},
	applicationStatus: {
		type: String,
		default: "open"
	},
	createdAt: {
		type: Date, 
		default: Date.now
	},
});

// Pre-save hook to generate a unique seniority number
safApplicationSchema.pre('save', async function(next) {
	try {
	  if (!this.seniorityNumber) {
		// Generate a unique seniority number
		const latestEmployee = await this.constructor.findOne({}, {}, { sort: { 'seniorityNumber': -1 } });
		const newSeniorityNumber = latestEmployee ? latestEmployee.seniorityNumber + 1 : 1;
		this.seniorityNumber = newSeniorityNumber;
	  }
	  next();
	} catch (error) {
	  next(error);
	}
  });

  
// Function to get current time in "HH:mm:ss" format
function getCurrentTime() {
	const now = new Date();
	const hours = now.getHours().toString().padStart(2, '0');
	const minutes = now.getMinutes().toString().padStart(2, '0');
	const seconds = now.getSeconds().toString().padStart(2, '0');
	return `${hours}:${minutes}:${seconds}`;
  }

// Function to update waiting period daily
async function updateWaitingPeriod() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // Increment current date by 1 to get tomorrow
    const applications = await this.constructor.find().exec();
    applications.forEach(async (application) => {
        const creationDate = new Date(application.createdAt);
        const millisecondsInADay = 1000 * 60 * 60 * 24;
        const daysSinceCreation = Math.floor((today - creationDate) / millisecondsInADay); // Calculate the number of days since creation
        application.waitingPeriod = daysSinceCreation; // Update waiting period
        await application.save(); // Save the updated application
    });
}

// Function to call updateWaitingPeriod() daily
setInterval(updateWaitingPeriod, 1000 * 60 * 60 * 24); // Run the function every 24 hours

module.exports = mongoose.model('safApplication', safApplicationSchema);