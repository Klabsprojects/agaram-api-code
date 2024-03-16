const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const designationSchema = new Schema({
  category_code: String,
  designation_name: String,
  designation_code: String,
	createdAt: {
		type: Date, 
		default: Date.now
	},
});

module.exports = mongoose.model('designations', designationSchema);