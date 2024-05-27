const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const { required } = require('joi');
const Schema = mongoose.Schema;

const blockSchema = new Schema({
    blockNumber: {
		type: String,
		required: true
	},
	FlatNumber: {
		type: String,
		required: true
	},
	allocationStatus: {
		type: Boolean,
    	required: true
	},
	//allocationTo: ObjectId,
	allocationTo: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
	createdAt: {
		type: Date, 
		default: Date.now
	},
});


module.exports = mongoose.model('block', blockSchema);