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
	employeeId: String,
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

const safApplicationModel = mongoose.model('safApplication', safApplicationSchema);


  
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
	console.log('waiting period calculation');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // Increment current date by 1 to get tomorrow
    const applications = await safApplicationModel.find().exec();
	console.log('waiting period calculation applications', applications);
    applications.forEach(async (application) => {
		if (application.applicationStatus != 'closed') {
			
			console.log('waiting period calculation applications q', application.waitingPeriod);
			const creationDate = new Date(application.createdAt);
			const millisecondsInADay = 1000 * 60 * 60 * 24;
			const daysSinceCreation = Math.floor((today - creationDate) / millisecondsInADay); // Calculate the number of days since creation
			console.log('daysSinceCreation', daysSinceCreation);
			//const daysSinceCreation1 = Math.floor((tomorrow - creationDate) / millisecondsInADay); // Calculate the number of days since creation
			//console.log('daysSinceCreation1', daysSinceCreation1);
			application.waitingPeriod = daysSinceCreation; // Update waiting period
			//console.log('wp', application.waitingPeriod);
			await application.save(); // Save the updated application
		}
    });
}

// Function to calculate the time until the next 12:30 AM in milliseconds
function timeUntilNext1230AM() {
    const now = new Date();
    const next1230AM = new Date(now);
    next1230AM.setDate(next1230AM.getDate() + 1); // Increment current date by 1 to get tomorrow
    next1230AM.setHours(0, 0, 0, 0); // Set the time to 12:30:00 AM
    return next1230AM - now; // Calculate the difference in milliseconds
}

// Function to call updateWaitingPeriod() daily at 12:30 AM
setTimeout(function runUpdate() {
    updateWaitingPeriod(); // Call the function
    const next1230AMInMillis = timeUntilNext1230AM(); // Calculate time until 12:30 AM
    setInterval(updateWaitingPeriod, 1000 * 60 * 60 * 24); // Run updateWaitingPeriod() daily
}, timeUntilNext1230AM());

// Export the model
module.exports = safApplicationModel;