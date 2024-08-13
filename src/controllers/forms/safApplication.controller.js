const safApplication = require('../../models/forms/safApplication.model');
const login = require('../../models/login/login.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")
const employeeProfile = require('../../models/employee/employeeProfile.model');
const empProfile = require('../employee/employeeProfile.controller');
const whatsapp = require('../whatsapp/whatsapp.controller');

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
exports.getSafApplicationOld = async (req, res) => {
        console.log('helo from safApplication controller', req.query);
        try {
            let query = {};
            let data;
            let resultData = [];
            let admins = [];
            let adminIds = [];
            if(req.query._id){
                query.where = req.query;
                //data = await education.find(req.query).exec();
                data = await safApplication.find(req.query)
                .populate({
                    path: 'employeeProfileId',
                    model: 'employeeProfile', // Model of the application collection
                    select: ['batch', 'mobileNo1'] // Fields to select from the application collection
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
                        employeeId: data[0].employeeId,
                        designation: data[0].designation,
                        designationId: data[0].designationId,
                        department: data[0].department,
                        departmentId: data[0].departmentId,
                        appliedOn: data[0].appliedOn,
                        appliedTime: data[0].appliedTime,
                        seniorityNumber: data[0].seniorityNumber,
                        waitingPeriod: data[0].waitingPeriod,
                        applicationStatus: data[0].applicationStatus,
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
                 data = await safApplication.find({ submittedBy: { $in: adminIds } })
                     .populate({
                         path: 'employeeProfileId',
                         model: 'employeeProfile',
                         select: ['batch', 'mobileNo1']
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
                                updateType: uniqueArray[0].updateType,
                                orderTypeCategoryCode: uniqueArray[0].orderTypeCategoryCode,
                                orderNumber: uniqueArray[0].orderNumber,
                                orderForCategoryCode: uniqueArray[0].orderForCategoryCode,
                                officerName: data[0].officerName,
                                employeeProfileId: data[0].employeeProfileId,
                                designation: data[0].designation,
                                designationId: data[0].designationId,
                                department: data[0].department,
                                departmentId: data[0].departmentId,
                                degreeData : data[0].degreeData,
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
                successRes(res, resultData, 'safApplication listed Successfully');
                    
            }
            else{
                data = await safApplication.find()
                .populate({
                    path: 'employeeProfileId',
                    model: 'employeeProfile', // Model of the application collection
                    select: ['batch', 'mobileNo1'] // Fields to select from the application collection
                })  
                .exec();
                successRes(res, data, 'safApplication listed Successfully');
            }
                
        } catch (error) {
            console.log('error', error);
            errorRes(res, error, "Error on listing safApplication");
        }
    }


exports.getSafApplication = async (req, res) => {
    console.log('helo from education controller', req.query);
    try {
        let query = {};
        let data;
        let resultData = [];
        let admins = [];
        let adminIds = [];
        if(req.query._id || req.query.employeeProfileId){
            query.where = req.query;
            data = await safApplication.find(req.query)
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
                            employeeId: data0.employeeId,
                            designation: data0.designation,
                            designationId: data0.designationId,
                            department: data0.department,
                            departmentId: data0.departmentId,
                            appliedOn: data0.appliedOn,
                            appliedTime: data0.appliedTime,
                            seniorityNumber: data0.seniorityNumber,
                            waitingPeriod: data0.waitingPeriod,
                            applicationStatus: data0.applicationStatus,
                            submittedBy: data0.submittedBy,
                            approvedBy: data0.approvedBy,
                            approvedDate: data0.approvedDate,
                            approvalStatus: data0.approvalStatus,
                }
        resultData.push(dataAll);
            }
                }
            }
            else{
                let dataAll = {
                    _id: data0._id,
                            officerName: data0.officerName,
                            employeeProfileId: data0.employeeProfileId,
                            employeeId: data0.employeeId,
                            designation: data0.designation,
                            designationId: data0.designationId,
                            department: data0.department,
                            departmentId: data0.departmentId,
                            appliedOn: data0.appliedOn,
                            appliedTime: data0.appliedTime,
                            seniorityNumber: data0.seniorityNumber,
                            waitingPeriod: data0.waitingPeriod,
                            applicationStatus: data0.applicationStatus,
                            submittedBy: data0.submittedBy,
                            approvedBy: data0.approvedBy,
                            approvedDate: data0.approvedDate,
                            approvalStatus: data0.approvalStatus,
                }
        resultData.push(dataAll);
            }
        }
            }
            else
            {
                resultData = [];
            }
            successRes(res, resultData, 'safApplication listed Successfully');
        }
        else if(req.query.loginAs == 'Spl A - SO' ||
            req.query.loginAs == 'Spl B - SO' ||
            req.query.loginAs == 'Spl A - ASO' || 
            req.query.loginAs == 'Spl B - ASO'
        ){
        if(req.query.loginAs == 'Spl A - SO'){
                admins  = await login.find({ loginAs: { $in: ['Spl A - ASO', 'Spl A - SO'] } }).select('_id').exec();
                if (admins .length === 0) {
                    return res.status(404).json({ message: 'No admin users found' });
                }   
        }
        if(req.query.loginAs == 'Spl A - ASO'){
            admins  = await login.find({ loginAs: { $in: ['Spl A - ASO'] } }).select('_id').exec();
            if (admins .length === 0) {
                return res.status(404).json({ message: 'No admin users found' });
            }   
        }
        if(req.query.loginAs == 'Spl B - SO'){
            admins  = await login.find({ loginAs: { $in: ['Spl B - ASO', 'Spl B - SO'] } }).select('_id').exec();
            if (admins .length === 0) {
                return res.status(404).json({ message: 'No admin users found' });
            }   
        }
        if(req.query.loginAs == 'Spl B - ASO'){
            admins  = await login.find({ loginAs: { $in: ['Spl B - ASO'] } }).select('_id').exec();
            if (admins .length === 0) {
                return res.status(404).json({ message: 'No admin users found' });
            }   
        }
        if(req.query.loginAs == 'Spl A - SO' || req.query.loginAs == 'Spl A - ASO' ||
            req.query.loginAs == 'Spl B - SO' || req.query.loginAs == 'Spl B - ASO')
        {
            adminIds = admins.map(admin => admin._id);
        }
        console.log('admins ', admins);
        console.log('adminIds ', adminIds);
        let profileQuery = {
            $or: [
                { submittedBy: { $in: adminIds } },
                { approvalStatus: true }
            ]
        }
             // Step 2: Query the leave collection where submittedBy matches any of the admin IDs
             data = await safApplication.find(profileQuery)
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
                            employeeId: data0.employeeId,
                            designation: data0.designation,
                            designationId: data0.designationId,
                            department: data0.department,
                            departmentId: data0.departmentId,
                            appliedOn: data0.appliedOn,
                            appliedTime: data0.appliedTime,
                            seniorityNumber: data0.seniorityNumber,
                            waitingPeriod: data0.waitingPeriod,
                            applicationStatus: data0.applicationStatus,
                            submittedBy: data0.submittedBy,
                            approvedBy: data0.approvedBy,
                            approvedDate: data0.approvedDate,
                            approvalStatus: data0.approvalStatus,
                        }
                resultData.push(dataAll);
                    }
                    
                }
                    }
                    else{
                        dataAll = {
                            _id: data0._id,
                            officerName: data0.officerName,
                            employeeProfileId: data0.employeeProfileId,
                            employeeId: data0.employeeId,
                            designation: data0.designation,
                            designationId: data0.designationId,
                            department: data0.department,
                            departmentId: data0.departmentId,
                            appliedOn: data0.appliedOn,
                            appliedTime: data0.appliedTime,
                            seniorityNumber: data0.seniorityNumber,
                            waitingPeriod: data0.waitingPeriod,
                            applicationStatus: data0.applicationStatus,
                            submittedBy: data0.submittedBy,
                            approvedBy: data0.approvedBy,
                            approvedDate: data0.approvedDate,
                            approvalStatus: data0.approvalStatus,
                        }
                resultData.push(dataAll);
                    }
                }
                }
                else
                {
                    resultData = [];
                }
        successRes(res, resultData, 'safApplication listed Successfully');
        }
        else{
            data = await safApplication.find()
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
                let reqest = {}
                reqest.body = {
                    phone: req.body.phone,
                    module: req.body.module,
                    date: req.body.dateOfOrder,
                    fileName: req.body.fileName
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