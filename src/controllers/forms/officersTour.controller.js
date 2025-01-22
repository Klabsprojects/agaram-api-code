const officersTour = require('../../models/forms/officersTour.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware");
const whatsapp = require('../whatsapp/whatsapp.controller');
const mongoose = require('mongoose');
const employeeprofiles = require('../../models/employee/employeeProfile.model');
const state = require('../../models/state/state.model');
const district = require('../../models/state/district.model');
const departments = require('../../models/categories/department.model');
const designations = require('../../models/categories/designation.model');
const categories = require('../../models/categories/categories.model');

// Helper function to convert date string to Date object
const parseDate = (dateString) => {
    if (!dateString) return null;
    const [day, month, year] = dateString.split('-');
    return new Date(year, month - 1, day);
};

// Helper function to convert ID to ObjectId
const toObjectId = (id) => {
    try {
        return id ? mongoose.Types.ObjectId(id.toString()) : null;
    } catch (error) {
        console.log('Invalid ObjectId:', id);
        return null;
    }
};

// Create new officer tour with data transformation
exports.addOfficersTour = async (req, res) => {
    try {
        console.log('try create officersTour', req.body);
        let tourData = { ...req.body };

        if (req.file) {
            tourData.orderFile = req.file.path;
            console.log('Uploaded file path:', req.file.path);
        } else {
            throw new Error('File upload failed: No file uploaded');
        }

        // Convert IDs to ObjectIds
        tourData.stateId = toObjectId(tourData.stateId);
        tourData.districtId = toObjectId(tourData.districtId);
        tourData.orderType = toObjectId(tourData.orderType);
        tourData.orderFor = toObjectId(tourData.orderFor);

        // Convert date strings to Date objects
        tourData.fromDate = parseDate(tourData.fromDate);
        tourData.toDate = parseDate(tourData.toDate);
        tourData.dateOfOrder = parseDate(tourData.dateOfOrder);

        // Transform OtherOfficers array
        if (tourData.OtherOfficers && Array.isArray(tourData.OtherOfficers)) {
            tourData.OtherOfficers = tourData.OtherOfficers.map(officer => ({
                designationId: toObjectId(officer.designationId),
                departmentId: toObjectId(officer.departmentId),
                employeeProfileId: toObjectId(officer.employeeProfileId)
            }));
        }

        // Validate transformed data
        if (!tourData.fromDate || !tourData.toDate) {
            return errorRes(res, null, "Invalid date format. Please use DD-MM-YYYY format");
        }

        const data = await officersTour.create(tourData);
        successRes(res, data, 'officersTour created Successfully');
    } catch (error) {
        console.log('catch create officersTour', error);
        errorRes(res, error, "Error on creating officersTour");
    }
};

// Get all officer tours with optional filtering
exports.getOfficersTour = async (req, res) => {
    try {
        console.log('query params:', req.query);
        let data;
        
        if (Object.keys(req.query).length > 0) {
            data = await officersTour.find(req.query)
                .populate('stateId')
                .populate('districtId')
                // .populate('orderType')
                // .populate('orderFor')
                // .populate({
                //     path: 'OtherOfficers.employeeProfileId',
                //     model: 'employeeprofiles'
                // })
                // .populate({
                //     path: 'OtherOfficers.departmentId',
                //     model: 'departments'
                // })
                // .populate({
                //     path: 'OtherOfficers.designationId',
                //     model: 'designations'
                // })
                .exec();
        } else {
            data = await officersTour.find()
                .populate('stateId')
                .populate('districtId')
                // .populate('orderType')
                // .populate('orderFor')
                // .populate({
                //     path: 'OtherOfficers.employeeProfileId',
                //     model: 'employeeprofiles'
                // })
                // .populate({
                //     path: 'OtherOfficers.departmentId',
                //     model: 'departments'
                // })
                // .populate({
                //     path: 'OtherOfficers.designationId',
                //     model: 'designations'
                // });
        }
        
        successRes(res, data, 'officersTour listed Successfully');
    } catch (error) {
        console.log('error', error);
        errorRes(res, error, "Error on listing officersTour");
    }
};

// Get single officer tour by ID
exports.getOfficersTourById = async (req, res) => {
    try {
        const data = await officersTour.findById(req.params.id)
            .populate('stateId')
            .populate('districtId')
            // .populate('orderType')
            // .populate('orderFor')
            .populate({
                path: 'OtherOfficers.employeeProfileId',
                model: 'employeeprofiles'
            })
            .populate({
                path: 'OtherOfficers.departmentId',
                model: 'departments'
            })
            .populate({
                path: 'OtherOfficers.designationId',
                model: 'designations'
            });
            
        if (!data) {
            return errorRes(res, null, "OfficersTour not found");
        }
        successRes(res, data, 'officersTour fetched Successfully');
    } catch (error) {
        console.log('error', error);
        errorRes(res, error, "Error on fetching officersTour");
    }
};

// Update officer tour
exports.updateOfficersTour = async (req, res) => {
    try {
        let updateData = { ...req.body };

        if (req.file) {
            updateData.orderFile = req.file.path;
            console.log('Uploaded file path:', req.file.path);
        } else {
            throw new Error('File upload failed: No file uploaded');
        }

        // Convert IDs to ObjectIds if present
        if (updateData.stateId) updateData.stateId = toObjectId(updateData.stateId);
        if (updateData.districtId) updateData.districtId = toObjectId(updateData.districtId);
        if (updateData.orderType) updateData.orderType = toObjectId(updateData.orderType);
        if (updateData.orderFor) updateData.orderFor = toObjectId(updateData.orderFor);

        // Convert dates if present
        if (updateData.fromDate) updateData.fromDate = parseDate(updateData.fromDate);
        if (updateData.toDate) updateData.toDate = parseDate(updateData.toDate);
        if (updateData.dateOfOrder) updateData.dateOfOrder = parseDate(updateData.dateOfOrder);

        // Transform OtherOfficers array if present
        if (updateData.OtherOfficers && Array.isArray(updateData.OtherOfficers)) {
            updateData.OtherOfficers = updateData.OtherOfficers.map(officer => ({
                designationId: toObjectId(officer.designationId),
                departmentId: toObjectId(officer.departmentId),
                employeeProfileId: toObjectId(officer.employeeProfileId)
            }));
        }

        const updatedData = await officersTour.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        );
        
        if (!updatedData) {
            return errorRes(res, null, "OfficersTour not found");
        }
        successRes(res, updatedData, 'officersTour updated Successfully');
    } catch (error) {
        console.log('error updating officersTour:', error);
        errorRes(res, error, "Error on updating officersTour");
    }
};

// Delete officer tour
exports.deleteOfficersTour = async (req, res) => {
    try {
        const deletedData = await officersTour.findByIdAndDelete(req.params.id);
        
        if (!deletedData) {
            return errorRes(res, null, "OfficersTour not found");
        }
        successRes(res, deletedData, 'officersTour deleted Successfully');
    } catch (error) {
        console.log('error deleting officersTour:', error);
        errorRes(res, error, "Error on deleting officersTour");
    }
};