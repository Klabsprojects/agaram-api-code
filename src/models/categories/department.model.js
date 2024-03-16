const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const departmentSchema = new Schema({
    category_code: String,
    department_name: String,
    department_code: String,
	  createdAt: {
		  type: Date, 
		  default: Date.now
	  },
});

module.exports = mongoose.model('departments', departmentSchema);