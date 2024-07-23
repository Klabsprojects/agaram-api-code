const ltc = require('../../models/forms/ltc.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")
const whatsapp = require('../whatsapp/whatsapp.controller');
const employeeProfile = require('../../models/employee/employeeProfile.model');
const empProfile = require('../employee/employeeProfile.controller');

// Ltc creation
exports.addLtc = async (req, res) => {
    try {
        console.log('try create ltc');
        const query = req.body;
        //console.log('Uploaded file path:', req.file.path);
        
        if(req.file){
            query.orderFile = req.file.path
            //query.fcraClearance = req.file.path
            console.log('Uploaded file path:', req.file.path);
        }
        const data = await ltc.create(query);
        let reqest = {}
        reqest.body = {
            phone: req.body.phone,
            module: req.body.module,
            date: req.body.dateOfOrder,
            fileName: req.file.filename
        }
        const goSent = await whatsapp.sendWhatsapp(reqest, res);
        //res.json(data);
        successRes(res, data, 'ltc created Successfully');
    } catch (error) {
        console.log('catch create ltc');
        //res.json(error);
        errorRes(res, error, "Error on creating ltc");
    }
    }

// Get Ltc
exports.getLtc = async (req, res) => {
        console.log('helo from ltc controller', req.query);
        try {
            let query = {};
            let data;
            let resultData = [];
            if(Object.keys(req.query).length >0){
                query.where = req.query;
                //data = await education.find(req.query).exec();
                data = await ltc.find(req.query)
                .populate({
                    path: 'employeeProfileId',
                    model: 'employeeProfile', // Model of the application collection
                    select: 'batch' // Fields to select from the application collection
                })  
                .exec();
                if(data.length > 0){
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
                            _id: data[0]._id,
                            officerName: data[0].officerName,
                            employeeProfileId: data[0].employeeProfileId,
                            designation: data[0].designation,
                            designationId: data[0].designationId,
                            department: data[0].department,
	                        departmentId: data[0].departmentId,
                            fromDate: data[0].fromDate,
                            toDate: data[0].toDate,
                            proposedPlaceOfVisit: data[0].proposedPlaceOfVisit,
                            blockYear: data[0].blockYear,
                            selfOrFamily: data[0].selfOrFamily,
                            fromPlace: data[0].fromPlace,
                            toPlace: data[0].toPlace,
                            dateOfOrder: data[0].dateOfOrder,
                            orderType: data[0].orderType,
                            orderNo: data[0].orderNo,
                            orderFor: data[0].orderFor,
                            remarks: data[0].remarks,
                            orderFile: data[0].orderFile,
                            submittedBy: data[0].submittedBy,
                            approvedBy: data[0].approvedBy,
                            approvedDate: data[0].approvedDate,
                            approvalStatus: data[0].approvalStatus,
                        }
                resultData.push(dataAll);
                    }
                }
                else
                {
                    resultData = [];
                }
                successRes(res, resultData, 'ltc listed Successfully');
            }
            else
                {
                    data = await ltc.find()
                    .populate({
                        path: 'employeeProfileId',
                        model: 'employeeProfile', // Model of the application collection
                        select: 'batch' // Fields to select from the application collection
                    })  
                    .exec();
                //res.json(data);
                successRes(res, data, 'ltc listed Successfully');
                }
                
        } catch (error) {
            console.log('error', error);
            //res.json(error);
            errorRes(res, error, "Error on listing ltc");
        }
    }

    exports.updateLtc = async (req, res) => {
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
                const data = await ltc.findOneAndUpdate(filter, update, {
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
    
        exports.updateLtcApprovalStatus = async (req, res) => {
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
                    const data = await ltc.findOneAndUpdate(filter, update, {
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