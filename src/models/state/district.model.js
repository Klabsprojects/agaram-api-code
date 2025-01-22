const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const state = require('../state/state.model');

const districtSchema = new Schema({
    districtName: String,
	stateId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'profile' // This references the profile model
	},
	createdAt: {
		type: Date, 
		default: Date.now
	},
});

module.exports = mongoose.model('district', districtSchema);