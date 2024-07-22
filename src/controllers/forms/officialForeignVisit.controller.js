const foreignVisit = require('../../models/forms/officialForeignVisit.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")
const employeeProfile = require('../../models/employee/employeeProfile.model');
const empProfile = require('../employee/employeeProfile.controller');

// Degree creation
exports.addVisit = async (req, res) => {
    try {
        console.log('try create foreignVisit', req.body);
        const query = req.body;
        console.log(query);
        console.log('REQ.FILE => ',req.file);
        /*if (req.file) {
            console.log('REQ.FILE INSIDE => ',req.file);
            query.politicalClearance = req.file.path;
            console.log('Uploaded file path:', req.file.path);
        } else {
            throw new Error('File upload failed: No file uploaded');
        }*/
        if (req.files && req.files['politicalClearance'] && req.files['politicalClearance'].length > 0) {
            // If politicalClearance file exists
            query.politicalClearance = req.files['politicalClearance'][0].path; // Assuming only one file is uploaded
            console.log('politicalClearance resume file path:', req.files['politicalClearance'][0].path);
        } else {
            throw new Error('politicalClearance upload failed: No resume file uploaded');
        }
        
        if (req.files && req.files['fcraClearance'] && req.files['fcraClearance'].length > 0) {
            // If fcraClearance file exists
            query.fcraClearance = req.files['fcraClearance'][0].path; // Assuming only one file is uploaded
            console.log('Uploaded fcraClearance file path:', req.files['fcraClearance'][0].path);
        } else {
            throw new Error('fcraClearance upload failed: No certificate file uploaded');
        }

        if (req.files && req.files['orderFile'] && req.files['orderFile'].length > 0) {
            // If orderFile file exists
            query.orderFile = req.files['orderFile'][0].path; // Assuming only one file is uploaded
            console.log('Uploaded orderFile file path:', req.files['orderFile'][0].path);
        } else {
            throw new Error('orderFile upload failed: No certificate file uploaded');
        }
        
        const data = await foreignVisit.create(query);
        successRes(res, data, 'foreignVisit created Successfully');
    } catch (error) {
        console.log('catch create foreignVisit');
        if (req.fileValidationError) {
            console.log(req.fileValidationError);
            throw req.fileValidationError;
        }
        errorRes(res, error, "Error on creating foreignVisit");
    }
    }

// Get foreignVisit
exports.getVisit = async (req, res) => {
        console.log('helo from foreignVisit controller', req.query);
        try {
            let query = {};
            let data;
            let resultData = [];
            if(req.query){
                query.where = req.query;
                data = await foreignVisit.find(req.query)
                .populate({
                    path: 'employeeProfileId',
                    model: 'employeeProfile', // Model of the application collection
                    select: 'batch' // Fields to select from the application collection
                })  
                .exec();

                // for(let employee of data){
                    // console.log('data => ', employee);
                    updateQueryJson = {
                        empId: data[0].employeeProfileId
                    }
                    uniqueArray = await empProfile.getEmployeeUpdateFilter(updateQueryJson);
                    console.log('length ==> ', uniqueArray.length);
                    if(uniqueArray.length > 0){
                        console.log('alert')
                        console.log('data => ', data[0]);
                        let dataAll = {
                            toPostingInCategoryCode: uniqueArray[0].transferOrPostingEmployeesList[0].toPostingInCategoryCode,
                            toDepartmentId: uniqueArray[0].transferOrPostingEmployeesList[0].toDepartmentId,
                            toDesignationId: uniqueArray[0].transferOrPostingEmployeesList[0].toDesignationId,
                            postTypeCategoryCode: uniqueArray[0].transferOrPostingEmployeesList[0].postTypeCategoryCode,
                            locationChangeCategoryId: uniqueArray[0].transferOrPostingEmployeesList[0].locationChangeCategoryId,
                            remarks: uniqueArray[0].remarks,
                            updateType: uniqueArray[0].updateType,
                            orderTypeCategoryCode: uniqueArray[0].orderTypeCategoryCode,
                            orderNumber: uniqueArray[0].orderNumber,
                            orderForCategoryCode: uniqueArray[0].orderForCategoryCode,
                            dateOfOrder: uniqueArray[0].dateOfOrder,
                            approvalStatus: data[0].approvalStatus,
                            _id: data[0]._id,
                            officer_name: data[0].officer_name,
                            employeeProfileId: data[0].employeeProfileId,
                            designation: data[0].designation,
                            designationId: data[0].designationId,
                            proposedCountry: data[0].proposedCountry,
                            fromDate: data[0].fromDate,
                            toDate: data[0].toDate,
                            otherDelegates: data[0].otherDelegates,
                            presentStatus: data[0].presentStatus,
                            rejectReason: data[0].rejectReason,
                            faxMessageLetterNo: data[0].faxMessageLetterNo,
                            dateOfOrder: data[0].dateOfOrder,
                            fundsSanctionedBy: data[0].fundsSanctionedBy,
                            fundsSanctioned: data[0].fundsSanctioned,
                            orderType: data[0].orderType,
                            orderNo: data[0].orderNo,
                            orderFor: data[0].orderFor,
                            dateOfOrderofFaxMessage: data[0].dateOfOrderofFaxMessage,
                            politicalClearance: data[0].politicalClearance,
                        }
                resultData.push(dataAll);
                    }
            successRes(res, resultData, 'foreignVisit listed Successfully');
            }
            else{
                data = await foreignVisit.find()
                .populate({
                    path: 'employeeProfileId',
                    model: 'employeeProfile', // Model of the application collection
                    select: 'batch' // Fields to select from the application collection
                })  
                .exec();
            successRes(res, data, 'foreignVisit listed Successfully');
            }
        } catch (error) {
            console.log('error', error);
            //res.json(error);
            errorRes(res, error, "Error on listing foreignVisit");
        }
    }

// visit updation
exports.updateVisit = async (req, res) => {
    try {
        console.log('try update block', req.body);
        const query = req.body;
        if(req.file){
            req.body.orderFile = req.file.path
            query.orderFile = req.file.path
            console.log('Uploaded file path:', req.file.path);
        }
        let filter;
        let update = {};
        update = req.body;
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
            const data = await foreignVisit.findOneAndUpdate(filter, update, {
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
        errorRes(res, error, "Error on updation");
    }
    }

    exports.updateVisitApprovalStatus = async (req, res) => {
        try {
            console.log('try update block', req.body);
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
                const data = await foreignVisit.findOneAndUpdate(filter, update, {
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