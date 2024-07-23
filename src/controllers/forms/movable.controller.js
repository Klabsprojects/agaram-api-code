const movable = require('../../models/forms/movable.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")
const whatsapp = require('../whatsapp/whatsapp.controller');
const empProfile = require('../employee/employeeProfile.controller');

// Movable creation
exports.addMovable = async (req, res) => {
    try {
        console.log('try create movable', req.body);
        const query = req.body;
        //console.log('Uploaded file path:', req.file.path);
        if (req.file) {
            query.orderFile = req.file.path;
            console.log('Uploaded file path:', req.file.path);
        } else {
            throw new Error('File upload failed: No file uploaded');
        }
        const data = await movable.create(query);
        let reqest = {}
        reqest.body = {
            phone: req.body.phone,
            module: req.body.module,
            date: req.body.dateOfOrder,
            fileName: req.file.filename
        }
        const goSent = await whatsapp.sendWhatsapp(reqest, res);
        //res.json(data);
        successRes(res, data, 'movable created Successfully');
    } catch (error) {
        console.log('catch create movable');
        //res.json(error);
        errorRes(res, error, "Error on creating movable");
    }
    }

// Get Movable
exports.getMovable = async (req, res) => {
        console.log('helo from movable controller', req.query);
        try {
            let query = {};
            let data;
            let resultData = [];
            if(Object.keys(req.query).length >0){
                query.where = req.query;
                data = await movable.find(req.query)
                .populate({
                    path: 'employeeProfileId',
                    model: 'employeeProfile', // Model of the application collection
                    select: 'batch' // Fields to select from the application collection
                }) 
                .exec();
                if(data.length > 0){
                let updateQueryJson = {
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
                        selfOrFamily: data[0].selfOrFamily,
                        propertyShownInIpr: data[0].propertyShownInIpr,
                        previousSanctionOrder: data[0].previousSanctionOrder,
                        sourceOfFunding: data[0].sourceOfFunding,
                        typeOfMovableProperty: data[0].typeOfMovableProperty,
                        detailsOfMovableProperty: data[0].detailsOfMovableProperty,
                        totalCostOfProperty: data[0].totalCostOfProperty,
                        boughtFromName: data[0].boughtFromName,
                        boughtFromContactNumber: data[0].boughtFromContactNumber,
                        boughtFromAddress: data[0].boughtFromAddress,
                        dateOfOrderAdditional: data[0].dateOfOrderAdditional,
                        movableDateOfOrder: data[0].movableDateOfOrder,
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
        successRes(res, resultData, 'movable listed Successfully');
            }
            else{
                data = await movable.find();
            //res.json(data);
            successRes(res, data, 'movable listed Successfully');
            }
                
        } catch (error) {
            console.log('error', error);
            //res.json(error);
            errorRes(res, error, "Error on listing movable");
        }
    }

    exports.updateMovable = async (req, res) => {
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
                const data = await movable.findOneAndUpdate(filter, update, {
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
    
        exports.updateMovableApprovalStatus = async (req, res) => {
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
                    const data = await movable.findOneAndUpdate(filter, update, {
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