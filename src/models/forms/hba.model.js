const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const Schema = mongoose.Schema;

const login = require('../login/login.model');
const profile = require('../employee/employeeProfile.model');
const state = require('../state/state.model');
const district = require('../employee/employeeProfile.model');

const hbaSchema = new Schema({
    officerName: String,
	employeeProfileId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'profile' // This references the profile model
	},
	designation: String,
	designationId: ObjectId,
	department: String,
	departmentId: ObjectId,
	stateId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'state' // This references the profile model
	},
	state: String,
	districtId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'district' // This references the profile model
	},
	district: String,
	hbaAvailedFor: String,
	typeOfProperty: String,
	dateOfApplication: Date,
	totalCostOfProperty: Number,
	isExisingResidenceAvailable: String,
	twoBRelacation: String,
	totalHbaAvailed: Number,
	totalNumberOfInstallments: Number,
	totalNumberOfRecoveryMonths: Number,
	installments : [{
			installmentNumber: String,
			amount: Number,
			conductRulePermission: String,
			conductRulePermissionAttachment: String,
			installmentDate: Date
			 }],
	remarks: String,
	orderType: ObjectId, 
	orderNo: Number, 
	orderFor: ObjectId,
	dateOfOrder: Date,
	orderFile: String, //file
	submittedBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'login' // This references the AllocatedBlock model
	},
	approvedBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'login' // This references the AllocatedBlock model
	},
	approvalStatus: {
		type: Boolean,
		default: false
	},
	approvedDate: {
		type: Date
	},
	createdAt: {
		type: Date, 
		default: Date.now
	},
});

module.exports = mongoose.model('hba', hbaSchema);