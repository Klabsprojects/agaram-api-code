const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const Schema = mongoose.Schema;

const roleSchema = new Schema({
  roleName: {
    type: String,
    required: true
  },
  menu: {
    type: String,
    required: true
  },
  allAccess: {
    type: Boolean,
    required: true
  },
  entryAccess: {
    type: Boolean,
    required: true
  },
  viewAccess: {
    type: Boolean,
    required: true
  },
  approvalAccess: {
    type: Boolean,
    required: true
  },
	createdAt: {
		type: Date, 
		default: Date.now
	},
});

module.exports = mongoose.model('role', roleSchema);