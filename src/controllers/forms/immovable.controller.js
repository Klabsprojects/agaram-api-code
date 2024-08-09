const immovable = require('../../models/forms/immovable.model');
const login = require('../../models/login/login.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")
const whatsapp = require('../whatsapp/whatsapp.controller');
const empProfile = require('../employee/employeeProfile.controller');

// Immovable creation
exports.addImmovable = async (req, res) => {
    try {
        console.log('try create immovable', req.body);
        const query = req.body;
        //console.log('Uploaded file path:', req.file.path);
        if (req.file) {
            query.orderFile = req.file.path;
            console.log('Uploaded file path:', req.file.path);
        } else {
            throw new Error('File upload failed: No file uploaded');
        }
        const data = await immovable.create(query);
        let reqest = {}
        reqest.body = {
            phone: req.body.phone,
            module: req.body.module,
            date: req.body.dateOfOrder,
            fileName: req.file.filename
        }
        const goSent = await whatsapp.sendWhatsapp(reqest, res);
        //res.json(data);
        successRes(res, data, 'immovable created Successfully');
    } catch (error) {
        console.log('catch create immovable', error);
        //res.json(error);
        errorRes(res, error, "Error on creating immovable");
    }
    }

// Get Immovable
exports.getImmovable = async (req, res) => {
        console.log('helo from immovable controller', req.query);
        try {
            let query = {};
            let data;
            let resultData = [];
            let admins = [];
            let adminIds = [];
            if(req.query._id){
                query.where = req.query;
                data = await immovable.find(req.query)
                .populate({
                    path: 'employeeProfileId',
                    model: 'employeeProfile', // Model of the application collection
                    select: ['batch', 'mobileNo1'] // Fields to select from the application collection
                })
                .populate({
                    path: 'submittedBy',
                    model: 'login', // Ensure the model name matches exactly
                    select: ['username', 'loginAs'] // Specify the fields you want to include from EmployeeProfile
                })
                .populate({
                    path: 'approvedBy',
                    model: 'login', // Ensure the model name matches exactly
                    select: ['username', 'loginAs'] // Specify the fields you want to include from EmployeeProfile
                })  
                .exec();
                if(data.length > 0){
                    console.log('data.length', data.length)
                    for(let data0 of data){
                        console.log('IDDD => ', data0);
                        console.log('IDDD => ', data0.employeeProfileId._id);
                        let updateQueryJson = {
                            empId: data0.employeeProfileId._id
                        }
                        uniqueArray = await empProfile.getEmployeeUpdateFilter(updateQueryJson);
                        console.log('length ==> ', uniqueArray.length);
                        if(uniqueArray.length > 0 && uniqueArray[0].transferOrPostingEmployeesList){
                            for(let transferOrPostingEmployeesList of uniqueArray[0].transferOrPostingEmployeesList){
                                console.log('Check ', transferOrPostingEmployeesList.fullName, transferOrPostingEmployeesList.empProfileId._id.toString(),
                                data0.employeeProfileId._id.toString());
                                if(transferOrPostingEmployeesList.empProfileId._id.toString() === data0.employeeProfileId._id.toString()){
                                    console.log('Matched ');
                                    console.log('posting available')
                                    dataAll = {
                                        toPostingInCategoryCode: transferOrPostingEmployeesList.toPostingInCategoryCode,
                                        toDepartmentId: transferOrPostingEmployeesList.toDepartmentId,
                                        toDesignationId: transferOrPostingEmployeesList.toDesignationId,
                                        postTypeCategoryCode: transferOrPostingEmployeesList.postTypeCategoryCode,
                                        locationChangeCategoryId: transferOrPostingEmployeesList.locationChangeCategoryId,
                                        updateType: uniqueArray[0].updateType,
                                        orderTypeCategoryCode: uniqueArray[0].orderTypeCategoryCode,
                                        orderNumber: uniqueArray[0].orderNumber,
                                        orderForCategoryCode: uniqueArray[0].orderForCategoryCode,

                                        _id: data0._id,
                                        officerName: data0.officerName,
                                        employeeProfileId: data0.employeeProfileId,
                                        designation: data0.designation,
                                        designationId: data0.designationId,
                                        department: data0.department,
                                        departmentId: data0.departmentId,
                                        typeOfImmovableProperty: data0.typeOfImmovableProperty,
                                        detailsOfImovableProperty: data0.detailsOfImovableProperty,
                                        sourceOfFunding: data0.sourceOfFunding,
                                        totalCostOfProperty: data0.totalCostOfProperty,
                                        boughtFromName: data0.boughtFromName,
                                        boughtFromContactNumber: data0.boughtFromContactNumber,
                                        boughtFromAddress: data0.boughtFromAddress,
                                        propertyShownInIpr: data0.propertyShownInIpr,
                                        immovableDateOfOrder: data0.immovableDateOfOrder,
                                        previousSanctionOrder: data0.previousSanctionOrder,
                                        detailsOfIntimation: data0.detailsOfIntimation,
                                        fundSource: data0.fundSource,
                                        typeOfIntimation: data0.typeOfIntimation,
                                        selfOrFamily: data0.selfOrFamily,
                                        dateOfOrder: data0.dateOfOrder,
                                        orderType: data0.orderType,
                                        orderNo: data0.orderNo,
                                        orderFor: data0.orderFor,
                                        remarks: data0.remarks,
                                        orderFile: data0.orderFile,
                                        submittedBy: data0.submittedBy,
                                        approvedBy: data0.approvedBy,
                                        approvedDate: data0.approvedDate,
                                        approvalStatus: data0.approvalStatus,
                                    }
                                    resultData.push(dataAll);
                                }   
                            }
                        }
                    }
            }
            else
            {
                resultData = [];
            }
        successRes(res, resultData, 'immovable listed Successfully');
            }
            else if(req.query.loginAs == 'Spl A - SO' ||
                req.query.loginAs == 'Spl B - SO' ||
                req.query.loginAs == 'Spl A - ASO' || 
                req.query.loginAs == 'Spl B - ASO'
            ){
                // Step 1: Find the user IDs where loginAs is 'adminLogin'
                if(req.query.loginAs == 'Spl A - SO'){
                    admins  = await login.find({ loginAs: { $in: ['Spl A - SO', 'Spl A - ASO'] } }).select('_id').exec();
                    if (admins .length === 0) {
                        return res.status(404).json({ message: 'No admin users found' });
                    }   
                }
                else if(req.query.loginAs == 'Spl B - SO'){
                    admins  = await login.find({ loginAs: { $in: ['Spl B - SO', 'Spl B - ASO'] } }).select('_id').exec();
                    if (admins .length === 0) {
                        return res.status(404).json({ message: 'No admin users found' });
                    }   
                }
                else if(req.query.loginAs == 'Spl A - ASO' || req.query.loginAs == 'Spl B - ASO'){
                    adminIds.push(req.query.loginId);
                }
                
                 if(req.query.loginAs == 'Spl A - SO' ||
                    req.query.loginAs == 'Spl B - SO')
                {
                    adminIds = admins.map(admin => admin._id);
                }
                console.log('admins ', admins);
                console.log('adminIds ', adminIds);
                 // Step 2: Query the leave collection where submittedBy matches any of the admin IDs
                 data = await immovable.find({ submittedBy: { $in: adminIds } })
                     .populate({
                         path: 'employeeProfileId',
                         model: 'employeeProfile',
                         select: ['batch', 'mobileNo1']
                     })
                     .populate({
                        path: 'submittedBy',
                        model: 'login', // Ensure the model name matches exactly
                        select: ['username', 'loginAs'] // Specify the fields you want to include from EmployeeProfile
                    })
                    .populate({
                        path: 'approvedBy',
                        model: 'login', // Ensure the model name matches exactly
                        select: ['username', 'loginAs'] // Specify the fields you want to include from EmployeeProfile
                    })  
                     .exec();   
                     if(data.length > 0){
                        for(let data0 of data){
                            let updateQueryJson = {
                                empId: data0.employeeProfileId._id
                            }
                            uniqueArray = await empProfile.getEmployeeUpdateFilter(updateQueryJson);
                            console.log('length ==> ', uniqueArray.length);
                            if(uniqueArray.length > 0 && uniqueArray[0].transferOrPostingEmployeesList){
                                for(let transferOrPostingEmployeesList of uniqueArray[0].transferOrPostingEmployeesList){
                                    console.log('Check ', transferOrPostingEmployeesList.fullName);
                                    if(transferOrPostingEmployeesList.empProfileId._id.toString() === data0.employeeProfileId._id.toString()){
                                        console.log('Matched ');
                                        console.log('posting available')
                                        let dataAll = {
                                            toPostingInCategoryCode: transferOrPostingEmployeesList.toPostingInCategoryCode,
                                            toDepartmentId: transferOrPostingEmployeesList.toDepartmentId,
                                            toDesignationId: transferOrPostingEmployeesList.toDesignationId,
                                            postTypeCategoryCode: transferOrPostingEmployeesList.postTypeCategoryCode,
                                            locationChangeCategoryId: transferOrPostingEmployeesList.locationChangeCategoryId,
                                            updateType: uniqueArray[0].updateType,
                                            orderTypeCategoryCode: uniqueArray[0].orderTypeCategoryCode,
                                            orderNumber: uniqueArray[0].orderNumber,
                                            orderForCategoryCode: uniqueArray[0].orderForCategoryCode,
                                            _id: data0._id,
                                            officerName: data0.officerName,
                                            employeeProfileId: data0.employeeProfileId,
                                            designation: data0.designation,
                                            designationId: data0.designationId,
                                            department: data0.department,
                                            departmentId: data0.departmentId,
                                            degreeData : data0.degreeData,
                                            dateOfOrder: data0.dateOfOrder,
                                            orderType: data0.orderType,
                                            orderNo: data0.orderNo,
                                            orderFor: data0.orderFor,
                                            remarks: data0.remarks,
                                            orderFile: data0.orderFile,
                                            submittedBy: data0.submittedBy,
                                            approvedBy: data0.approvedBy,
                                            approvedDate: data0.approvedDate,
                                            approvalStatus: data0.approvalStatus,
                                        }
                                        resultData.push(dataAll);
                                    }
                                }
                            }
                        }
                    }
                    else
                    {
                        resultData = [];
                    }
                successRes(res, resultData, 'immovable listed Successfully');
                    
            }
            else{
                data = await immovable.find()
                .populate({
                    path: 'employeeProfileId',
                    model: 'employeeProfile', // Model of the application collection
                    select: ['batch', 'mobileNo1'] // Fields to select from the application collection
                })  
                .populate({
                    path: 'submittedBy',
                    model: 'login', // Ensure the model name matches exactly
                    select: ['username', 'loginAs'] // Specify the fields you want to include from EmployeeProfile
                })
                .populate({
                    path: 'approvedBy',
                    model: 'login', // Ensure the model name matches exactly
                    select: ['username', 'loginAs'] // Specify the fields you want to include from EmployeeProfile
                })  
                .exec();
            //res.json(data);
            successRes(res, data, 'immovable listed Successfully');
            }
                
        } catch (error) {
            console.log('error', error);
            //res.json(error);
            errorRes(res, error, "Error on listing movable");
        }
    }

    exports.updateImmovable = async (req, res) => {
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
                const data = await immovable.findOneAndUpdate(filter, update, {
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
    
        exports.updateImmovableApprovalStatus = async (req, res) => {
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
                    const data = await immovable.findOneAndUpdate(filter, update, {
                        new: true
                      });
                    console.log('data updated ', data);
                    let reqest = {}
                    reqest.body = {
                        phone: req.body.phone,
                        module: req.body.module,
                        date: req.body.dateOfOrder,
                        fileName: req.file.filename
                    }
                    const goSent = await whatsapp.sendWhatsapp(reqest, res);
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
