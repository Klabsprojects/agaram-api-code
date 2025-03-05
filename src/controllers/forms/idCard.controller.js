const idcard = require('../../models/forms/idCard.model');
const login = require('../../models/login/login.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")
const whatsapp = require('../whatsapp/whatsapp.controller');
const empProfile = require('../employee/employeeProfile.controller');
const hba = require('../../models/forms/hba.model');

// Idcard creation
exports.addIdcard = async (req, res) => {
    try {
        console.log('try create Idcard', req.body);
        const query = req.body;

        if (req.files && req.files['orderFile'] && req.files['orderFile'].length > 0) {
            // If orderFile file exists
            query.orderFile = req.files['orderFile'][0].path; // Assuming only one file is uploaded
            console.log('Uploaded orderFile file path:', req.files['orderFile'][0].path);
        } else {
            throw new Error('orderFile upload failed: No orderFile file uploaded');
        }

        if (req.files && req.files['idCardApplication'] && req.files['idCardApplication'].length > 0) {
            // If idCardApplication file exists
            query.idCardApplication = req.files['idCardApplication'][0].path; // Assuming only one file is uploaded
            console.log('idCardApplication file path:', req.files['idCardApplication'][0].path);
        }

        if (req.files && req.files['finalIdCard'] && req.files['finalIdCard'].length > 0) {
            // If finalIdCard file exists
            query.finalIdCard = req.files['finalIdCard'][0].path; // Assuming only one file is uploaded
            console.log('finalIdCard file path:', req.files['finalIdCard'][0].path);
        }
        console.log('query ', query);
        const data = await idcard.create(query);
        let reqest = {}
        reqest.body = {
            phone: req.body.phone,
            module: req.body.module,
            date: req.body.dateOfOrder,
            fileName: query.orderFile
        }
        const goSent = await whatsapp.sendWhatsapp(reqest, res);
        successRes(res, data, 'Idcard created Successfully');
    } catch (error) {
        console.log('catch create Idcard', error);
        errorRes(res, error, "Error on creating Idcard");
    }
    }

    exports.getIdCard = async (req, res) => {
        console.log('helo from getIdCard controller', req.query);
        try {
            let query = {};
            let data;
            let resultData = [];
            let admins = [];
            let adminIds = [];
            if(req.query._id){
                query.where = req.query;
                data = await idcard.find(req.query)
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
                                idCardNo: data0.idCardNo,
                                availedDate: data0.availedDate,
                                expiryDate: data0.expiryDate,
                                idCardApplication: data0.idCardApplication,
                                finalIdCard: data0.finalIdCard,
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
                else{
                    let dataAll = {
                        _id: data0._id,
                        officerName: data0.officerName,
                        employeeProfileId: data0.employeeProfileId,
                        designation: data0.designation,
                        designationId: data0.designationId,
                        department: data0.department,
                        departmentId: data0.departmentId,
                        idCardNo: data0.idCardNo,
                        availedDate: data0.availedDate,
                        expiryDate: data0.expiryDate,
                        idCardApplication: data0.idCardApplication,
                        finalIdCard: data0.finalIdCard,
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
                else
                {
                    resultData = [];
                }
                successRes(res, resultData, 'education listed Successfully');
            }
            else if(req.query.employeeProfileId){
                console.log('profileid', req.query.employeeProfileId)
                query.employeeProfileId = req.query.employeeProfileId;
                if (req.query.designationId) {
                    query.designationId= req.query.designationId;
                }
                console.log('Query ', query);
                data = await idcard.find(query)
                .populate({
                    path: 'employeeProfileId',
                    model: 'employeeProfile', // Model of the application collection
                    select: ['batch', 'mobileNo1', 'fullName'] // Fields to select from the application collection
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
                console.log(data, 'idcard listed else Successfully');
                successRes(res, data, 'idcard listed Successfully');
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
            if (req.query.designationId) {
                profileQuery.designationId= req.query.designationId;
            }
            console.log('profileQuery ', profileQuery);
                 // Step 2: Query the leave collection where submittedBy matches any of the admin IDs
                 data = await idcard.find(profileQuery)
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
                                designation: data0.designation,
                                designationId: data0.designationId,
                                department: data0.department,
                                departmentId: data0.departmentId,
                                idCardNo: data0.idCardNo,
                                availedDate: data0.availedDate,
                                expiryDate: data0.expiryDate,
                                idCardApplication: data0.idCardApplication,
                                finalIdCard: data0.finalIdCard,
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
                        else{
                            dataAll = {
                                _id: data0._id,
                                officerName: data0.officerName,
                                employeeProfileId: data0.employeeProfileId,
                                designation: data0.designation,
                                designationId: data0.designationId,
                                department: data0.department,
                                departmentId: data0.departmentId,
                                idCardNo: data0.idCardNo,
                                availedDate: data0.availedDate,
                                expiryDate: data0.expiryDate,
                                idCardApplication: data0.idCardApplication,
                                finalIdCard: data0.finalIdCard,
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
                    else
                    {
                        resultData = [];
                    }
            successRes(res, resultData, 'education listed Successfully');
            }
            else{
                if (req.query.designationId) {
                    query.designationId= req.query.designationId;
                }
                console.log('Query ', query);
                data = await idcard.find(query)
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
            successRes(res, data, 'education listed Successfully');
            }
                
        } catch (error) {
            console.log('error', error);
            errorRes(res, error, "Error on listing IdCard");
        }
    }    

    exports.updateIdCard = async (req, res) => {
        try {
            console.log('try update IdCard', req.body);
            const query = req.body;
            if (req.files && req.files['orderFile'] && req.files['orderFile'].length > 0) {
                // If orderFile file exists
                query.orderFile = req.files['orderFile'][0].path; // Assuming only one file is uploaded
                console.log('Uploaded orderFile file path:', req.files['orderFile'][0].path);
            } 
    
            if (req.files && req.files['idCardApplication'] && req.files['idCardApplication'].length > 0) {
                // If politicalClearance file exists
                query.idCardApplication = req.files['idCardApplication'][0].path; // Assuming only one file is uploaded
                console.log('idCardApplication file path:', req.files['idCardApplication'][0].path);
            }

            if (req.files && req.files['finalIdCard'] && req.files['finalIdCard'].length > 0) {
                // If politicalClearance file exists
                query.finalIdCard = req.files['finalIdCard'][0].path; // Assuming only one file is uploaded
                console.log('finalIdCard file path:', req.files['finalIdCard'][0].path);
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
                const data = await idcard.findOneAndUpdate(filter, update, {
                    new: true
                  });
                console.log('data updated ', data);
                successRes(res, data, 'data updated Successfully');
            } else {
                console.log('empty');
                throw 'Update value missing';
            }
        } catch (error) {
            console.log('catch update idcard', error);
            errorRes(res, error, "Error on idcard updation");
        }
        }
    
        exports.updateIdCardApprovalStatus = async (req, res) => {
            try {
                console.log('try update IdCard', req.body);
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
                    const data = await idcard.findOneAndUpdate(filter, update, {
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