const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const degreeSchema = new Schema({
    degree_name: String,
	createdAt: {
		type: Date, 
		default: Date.now
	},
});

module.exports = mongoose.model('degree', degreeSchema);