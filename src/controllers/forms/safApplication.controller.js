const safApplication = require('../../models/forms/safApplication.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")
const employeeProfile = require('../../models/employee/employeeProfile.model');
const empProfile = require('../employee/employeeProfile.controller');

// safApplication creation
exports.addSafApplication = async (req, res) => {
    try {
        console.log('try create safApplication', req.body);
        const query = req.body;
         // Check if an application already exists for the given employee
         const existingApplication = await safApplication.findOne({ 
            employeeProfileId: query.employeeProfileId,
            applicationStatus: { $in: ["open", "alloted"] } });
            //applicationStatus: "open" });
        console.log('exist ', existingApplication);
         if (existingApplication) {
             // If an application exists, return the application info
             successRes(res, existingApplication, 'Application already exists for this employee');
         } else {
             // If no application exists, create a new application
            const data = await safApplication.create(query);
            successRes(res, data, 'safApplication created Successfully');
         }
    } catch (error) {
        console.log('catch create safApplication', error);
        errorRes(res, error, "Error on creating safApplication");
    }
    }

// Get safApplication
exports.getSafApplication = async (req, res) => {
        console.log('helo from safApplication controller', req.query);
        try {
            let query = {};
            let data;
            let resultData = [];
            if(req.query){
                query.where = req.query;
                //data = await education.find(req.query).exec();
                data = await safApplication.find(req.query)
                .populate({
                    path: 'employeeProfileId',
                    model: 'employeeProfile', // Model of the application collection
                    select: 'batch' // Fields to select from the application collection
                })  
                .exec();

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
        successRes(res, resultData, 'safApplication listed Successfully');
            }
            else{
//data = await education.find();
data = await safApplication.find()
.populate({
    path: 'employeeProfileId',
    model: 'employeeProfile', // Model of the application collection
    select: 'batch' // Fields to select from the application collection
})  
.exec();
successRes(res, data, 'safApplication listed Successfully');
            }
                
        } catch (error) {
            console.log('error', error);
            errorRes(res, error, "Error on listing safApplication");
        }
    }

// safApplication updation
exports.updateSafApplication = async (req, res) => {
    try {
        console.log('try update safApplication');
        const query = req.body;
        let update = {};
        let filter;
        if(query.waitingPeriod){
            update.waitingPeriod = query.waitingPeriod;
        }
        if(query.id){
            filter = {
                _id : query.id
            }
        }
        else
            throw 'pls provide id field';
        console.log('update ', update);
        console.log('filter ', filter);
        // Check if the update object is empty or not
        if (Object.keys(update).length > 0) {
            console.log('value got');
            const data = await safApplication.findOneAndUpdate(filter, update, {
                new: true
            });
            console.log('data updated ', data);
            successRes(res, data, 'safApplication waiting period updated Successfully');
        } else {
            console.log('empty');
            throw 'Update value missing';
        }
    } catch (error) {
        console.log('catch update safApplication waiting period updation', error);
        errorRes(res, error, "Error on safApplication waiting period updation");
    }
    }

// safApplication updation
exports.updateSafApplication = async (req, res) => {
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
            const data = await safApplication.findOneAndUpdate(filter, update, {
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

    exports.updateSafApplicationApprovalStatus = async (req, res) => {
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
                const data = await safApplication.findOneAndUpdate(filter, update, {
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