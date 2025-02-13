//const leave = require('../../models/employee/leave.model');
const formsupload = require('../../models/employee/formsupload.model')
const login = require('../../models/login/login.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")
const whatsapp = require('../whatsapp/whatsapp.controller');
const employeeProfile = require('../../models/employee/employeeProfile.model');

// Formsupload creation
exports.addFormsupload = async (req, res) => {
    try {
        console.log('try create Formsupload', req.body);
        const query = req.body;
        //console.log('Uploaded file path:', req.file.path);
        if (req.file) {
            query.formFile = req.file.path;
            console.log('Uploaded file path:', req.file.path);
            console.log('Uploaded file path:', req.file.filename);
        } else {
            throw new Error('File upload failed: No file uploaded');
        }
        const data = await formsupload.create(query);
        successRes(res, data, 'Formsupload created Successfully');
    } catch (error) {
        console.log('catch create Formsupload', error);
        errorRes(res, error, "Error on creating Formsupload");
    }
    }

// Get Formsupload
exports.getFormsupload = async (req, res) => {
        console.log('helo from Formsupload controller', req.query);
        try {
            let query = {};
            let data = [];
            let admins = [];
            let adminIds = [];
                    if(req.query.approvalStatus){
                        query.where = {
                            approvalStatus: req.query.approvalStatus
                        }
                    }
                    console.log('query =>', query);
                    data = await formsupload.find(query.where)
                    .populate({
                        path: 'employeeProfileId',
                        model: 'employeeProfile', // Model of the application collection
                        select: ['batch', 'mobileNo1', 'fullName'] // Fields to select from the application collection
                    })  
                    .populate({
                        path: 'approvedBy',
                        model: 'login', // Ensure the model name matches exactly
                        select: ['username', 'loginAs'] // Specify the fields you want to include from EmployeeProfile
                    }) 
                    .exec();
                    console.log(data, 'formsupload listed else Successfully');
                    successRes(res, data, 'formsupload listed Successfully');
        } catch (error) {
            console.log('error', error);
            errorRes(res, error, "Error on listing formsupload");
        }
    }

    exports.getFormsuploadByEmployee = async (req, res) => {
        console.log('helo from Formsupload controller', req.query);
        try {
            let query = {};
            let data = [];
            let admins = [];
            let adminIds = [];

            if(req.query.employeeProfileId){
                console.log('profileid', req.query.employeeProfileId)
                query.where = req.query;
                data = await formsupload.find(query.where)
                .populate({
                    path: 'employeeProfileId',
                    model: 'employeeProfile', // Model of the application collection
                    select: ['batch', 'mobileNo1'] // Fields to select from the application collection
                })  
                .populate({
                    path: 'approvedBy',
                    model: 'login', // Ensure the model name matches exactly
                    select: ['username', 'loginAs'] // Specify the fields you want to include from EmployeeProfile
                }) 
                .exec();
                console.log(data, 'formsupload listed else Successfully');
                successRes(res, data, 'formsupload listed Successfully');
            }
            else
                throw new Error('Pls provide valid profileId');
        } catch (error) {
            console.log('error', error);
            errorRes(res, error, "Error on listing formsupload");
        }
    }

        exports.updateFormsuploadApprovalStatus = async (req, res) => {
            try {
                console.log('try update Formsupload status', req.body, req);
                const query = req.body;
                let update = {};
                const currentDate = new Date();
                if(query.approvedBy){
                    update.approvedBy = query.approvedBy;
                    update.approvalStatus = true;
                    update.approvedDate = currentDate;
                } 
                else    
                    throw 'Pls provide inputs';
                let filter;
                if(query.id){
                    console.log('id coming');
                    console.log(query.id);
                    filter = {
                        _id : query.id
                    }
                }
                else{
                    console.log('id coming');
                    throw 'pls provide id field';
                }
                    
                console.log('update ', update);
                console.log('filter ', filter);
                // Check if the update object is empty or not
                if (Object.keys(update).length > 0) {
                    console.log('value got');
                    const data = await formsupload.findOneAndUpdate(filter, update, {
                        new: true
                      });
                    console.log('data updated ', data);
                    successRes(res, data, 'data updated Successfully');
                } else {
                    console.log('empty');
                    throw 'Update value missing';
                }
            } catch (error) {
                console.log('catch update', error);
                errorRes(res, error, error);
            }
            }