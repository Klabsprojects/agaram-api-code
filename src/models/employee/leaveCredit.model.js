const { ObjectID, ObjectId, BSON } = require('mongodb');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const login = require('../login/login.model');

const leaveCreditSchema = new Schema({
    casualLeave: Number,
	restrictedHoliday: Number,
	earnedLeave: Number,
	halfPayLeave: Number,
	empProfileId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'profile' // This references the AllocatedBlock model
	},
	createdAt: {
		type: Date, 
		default: Date.now
	},
});

module.exports = mongoose.model('leaveCredit', leaveCreditSchema);