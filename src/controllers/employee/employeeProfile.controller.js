const employeeProfile = require('../../models/employee/employeeProfile.model');
const employeeUpdate = require('../../models/employee/employeeUpdate.model');
const categories = require('../../models/categories/categories.model');
const designations = require('../../models/categories/designation.model');
const login = require('../../models/login/login.model');
//const login = require('../../models/login/login.model');
const whatsapp = require('../whatsapp/whatsapp.controller');
const employeeUpdateController = require('./employeeUpdate.controller')
const departmentController = require('./../categories/department.controller')
const departments = require('../../models/categories/department.model');
const state = require('../../models/state/state.model');
const empProfile = require('../employee/employeeProfile.controller');
//const { Op } = require('sequelize');
//const leaveCredit = require('../../models/employee/leaveCredit.model');
const leaveCredit = require('../../models/employee/leaveCredit.model');

const { successRes, errorRes } = require("../../middlewares/response.middleware");
const { ObjectId, ObjectID } = require('mongodb');

const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

const uploadDir = 'uploadsImages/';

// employeeProfile creation
exports.addEmployeeProfile = async (req, res) => {
    try {
        console.log('DEMO');
        console.log('try create employeeProfile', req.body);
        let dateOrder = new Date();
        const query = req.body;
        if(req.body.toDepartmentId)
            query.departmentId = req.body.toDepartmentId;
        if(req.body.lastDateOfPromotion)
            query.lastDateOfPromotion = req.body.lastDateOfPromotion;
        if(req.body.languages)
            query.languages = req.body.languages;

        // if(req.body.updateType && req.body.toPostingInCategoryCode && req.body.toDepartmentId
        //     && req.body.toDesignationId && req.body.postTypeCategoryCode && req.body.locationChangeCategoryId
        // ){
        //     console.log('employee current posting data coming');
        // }
        // else
        //     throw new Error('Pls provide valid inputs for employee current posting');
        console.log('__dirname ', __dirname);
        const baseDir = path.resolve(__dirname, '../../../');  // Go two levels up from the current directory

        console.log('Base directory:', baseDir);

        const uploadDir = path.join(baseDir, 'profileImages');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        if (req.file) {
            const fileExtension = path.extname(req.file.originalname);  // Get the file extension
            console.log('uploadDir', uploadDir);
            
            // Output file path for the converted image
            const outputFilePath = path.join(uploadDir, `${Date.now()}.jpeg`);
            console.log('outputFilePath', outputFilePath);
            
            // Use imagemagick to convert the uploaded image to JPEG
            console.log('req.file.path', req.file.path);
        
            await Jimp.read(req.file.path)
            .then(image => {
                return image.writeAsync(outputFilePath);
            })
            .then(() => {
                console.log('Conversion successful! Output saved to', outputFilePath);
                const fileName = path.basename(outputFilePath);
            //query.imagePath = fileName;
            query.imagePath = fileName;
            })
            .catch(err => {
                console.error('Error during conversion:', err);
                throw new Error('Error during conversion');
            });
        }
        else {
            throw new Error('Photo upload failed: No Photo uploaded');
        }
        if(req.body.degreeData){
            console.log(' original transferOrPostingEmployeesList ', req.body.degreeData);
            //req.body.transferOrPostingEmployeesList = JSON.stringify(req.body.transferOrPostingEmployeesList);
            console.log(' after stringify transferOrPostingEmployeesList ', req.body.degreeData);
            console.log('yes');
            //query = req.body;
            query.degreeData = JSON.parse(req.body.degreeData);
            console.log(' after parse transferOrPostingEmployeesList ', req.body.degreeData);
        }
        
        const data = await employeeProfile.create(query);
        console.log('data ', data);
        if(data){
            //console.log('data ', data._id);
            let leaveCreditData = {
                casualLeave: 0,
                restrictedHoliday: 0,
                earnedLeave: 0,
                halfPayLeave: 0,
                empProfileId: data._id
            }
            console.log('leaveCreditData ', leaveCreditData)
            const leaveCreditDataRes = await leaveCredit.create(leaveCreditData);
            if(req.body.department && req.body.department == 'yes' && req.body.toDepartmentId && 
                req.body.deptAddress && req.body.deptPhoneNumber && req.body.deptFaxNumber && 
                req.body.deptOfficialMobileNo 
                //&& req.body.deptLastDateOfPromotion
            ){
                console.log('department details coming' , data._id);
                let request1 = {
                    body : {
                        address : req.body.deptAddress,
                        phoneNumber : req.body.deptPhoneNumber,
                        faxNumber : req.body.deptFaxNumber,
                        officialMobileNo : req.body.deptOfficialMobileNo,
                        //lastDateOfPromotion : req.body.deptLastDateOfPromotion,
                    },
                    where: {
                        _id: req.body.toDepartmentId
                    }
                }
                const dataDepartment = await departmentController.handledepartmentEdit(request1);
            }
            if(req.body.updateType && req.body.toPostingInCategoryCode && req.body.toDepartmentId
                && req.body.toDesignationId && req.body.postTypeCategoryCode && req.body.locationChangeCategoryId
                && data._id
            ){
                console.log('employee current posting' , data._id);
                let request = {
                    body : {
                        updateType : req.body.updateType,
                        dateOfOrder : dateOrder,
                        transferOrPostingEmployeesList : [{
                            empProfileId: data._id,
                                    employeeId: data.employeeId,
                                    fullName: data.fullName,
                                    toPostingInCategoryCode: req.body.toPostingInCategoryCode,
                                    toDepartmentId: req.body.toDepartmentId,
                                    toDesignationId: req.body.toDesignationId,
                                    postTypeCategoryCode: req.body.postTypeCategoryCode,
                                    locationChangeCategoryId: req.body.locationChangeCategoryId,
                        }]
                }
                }
                const dataPosting = await employeeUpdateController.handleBulkEmployeeTransferPosting(request);
                //await employeeUpdateController.addPostingFromProfile(req, res);
                let data1 = data;
                successRes(res, data1, 'Employee added Successfully');
            }
            else
                successRes(res, data, 'Employee added Successfully');
                //throw new Error('Pls provide valid inputs for employee current posting');
        }
    }
    catch (error) {
        if (error.code === 11000) {
            // Duplicate key error
            const duplicatedKey = Object.keys(error.keyValue)[0];
            const errorMessage = `The ${duplicatedKey} '${error.keyValue[duplicatedKey]}' is already exist.`;
            errorRes(res, error, errorMessage);
        }else{
            console.log('catch', error);
            errorRes(res, error, "Error on EmployeeProfile Creation");
        }
    }
    }

// Get employeeProfile
exports.getEmployeeProfile = async (req, res) => {
        console.log('helo from employeeProfile controller', req.query);
        try {
            
        let query = {};
        let data;
        let admins = [];
        let resultData = [];
            let adminIds = [];
            if((req.query._id || req.query.fullName || req.query.batch || req.query.loginId) && (!req.query.loginAs)){
                console.log('Inside if1');
            query.where = req.query;
            data = await employeeProfile.find(req.query)
            .populate({
                path: 'departmentId',
                model: 'departments', // Ensure the model name matches exactly
                //select: ['department_name', 'address', 'phoneNumber', 'faxNumber', 'officialMobileNo'] // Specify the fields you want to include from EmployeeProfile
                select: ['department_name', 'address', 'phoneNumber', 'faxNumber', 'officialMobileNo']
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
            
            .sort({ batch: 'asc' })
	    .allowDiskUse(true)
        //.limit(100)
	    .exec();
        console.log('data ', data);
        if(data.length > 0){
            console.log('data.length', data.length)
            for(let data0 of data){
                let updateQueryJson = {
                    empId: data0._id
                }
                uniqueArray = await empProfile.getEmployeeUpdateFilter(updateQueryJson);
                console.log('uniqueArray.length ==> ', uniqueArray.length, uniqueArray);
                console.log('uniqueArray ==> ', uniqueArray[0]);
                if(uniqueArray.length > 0 && uniqueArray[0].transferOrPostingEmployeesList){
                    for(let transferOrPostingEmployeesList of uniqueArray[0].transferOrPostingEmployeesList){
                        console.log('Check ', transferOrPostingEmployeesList.fullName);
                        if(transferOrPostingEmployeesList.empProfileId._id.toString() === data0._id.toString()){
                            console.log('Matched ');
                            console.log('posting available')
                    dataAll = {
                        // toPostingInCategoryCode: uniqueArray[0].transferOrPostingEmployeesList[0].toPostingInCategoryCode,
                        // toDepartmentId: uniqueArray[0].transferOrPostingEmployeesList[0].toDepartmentId,
                        // toDesignationId: uniqueArray[0].transferOrPostingEmployeesList[0].toDesignationId,
                        // postTypeCategoryCode: uniqueArray[0].transferOrPostingEmployeesList[0].postTypeCategoryCode,
                        // locationChangeCategoryId: uniqueArray[0].transferOrPostingEmployeesList[0].locationChangeCategoryId,
                        toPostingInCategoryCode: transferOrPostingEmployeesList.toPostingInCategoryCode,
                                toDepartmentId: transferOrPostingEmployeesList.toDepartmentId,
                                toDesignationId: transferOrPostingEmployeesList.toDesignationId,
                                postTypeCategoryCode: transferOrPostingEmployeesList.postTypeCategoryCode,
                                locationChangeCategoryId: transferOrPostingEmployeesList.locationChangeCategoryId,
                        uniqueId:  uniqueArray[0]._id,
                        updateType: uniqueArray[0].updateType,
                        orderTypeCategoryCode: uniqueArray[0].orderTypeCategoryCode,
                        orderNumber: uniqueArray[0].orderNumber,
                        orderForCategoryCode: uniqueArray[0].orderForCategoryCode,
                        fullName: data0.fullName,
                        personalEmail: data0.personalEmail,
                        _id: data0._id,
                        gender: data0.gender,
                        dateOfBirth: data0.dateOfBirth,
                        dateOfJoining: data0.dateOfJoining,
                        dateOfRetirement : data0.dateOfRetirement,
                        state: data0.state,
                        batch: data0.batch,
                        recruitmentType: data0.recruitmentType,
                        serviceStatus: data0.serviceStatus,
                        qualification1: data0.qualification1,
                        qualification2: data0.qualification2,
                        community: data0.community,
                        degreeData: data0.degreeData,
                        caste: data0.caste,
                        religion: data0.religion,
                        promotionGrade: data0.promotionGrade,
                        payscale: data0.payscale,
                        officeEmail: data0.officeEmail,
                        mobileNo1: data0.mobileNo1,
                        mobileNo2: data0.mobileNo2,
                        mobileNo3: data0.mobileNo3,
                        addressLine: data0.addressLine,
                        city: data0.city,
                        pincode: data0.pincode,
                        employeeId: data0.employeeId,
                        ifhrmsId: data0.ifhrmsId,
                        lastDateOfPromotion : data0.lastDateOfPromotion,
                        languages : data0.languages,
                        seniority: data0.seniority,
                        //photo: data0.photo,
                        imagePath: data0.imagePath,
                        submittedBy: data0.submittedBy,
                        approvedBy: data0.approvedBy,
                        approvedDate: data0.approvedDate,
                        approvalStatus: data0.approvalStatus,
                        departmentId: data0.departmentId,
                        leaveCredit: await leaveCredit.find(({empProfileId: data0._id}))
                    }
                    resultData.push(dataAll);
                }
            }

                }
                else{
                    dataAll = {
                        fullName: data0.fullName,
                        personalEmail: data0.personalEmail,
                        _id: data0._id,
                        gender: data0.gender,
                        dateOfBirth: data0.dateOfBirth,
                        dateOfJoining: data0.dateOfJoining,
                        dateOfRetirement : data0.dateOfRetirement,
                        state: data0.state,
                        batch: data0.batch,
                        recruitmentType: data0.recruitmentType,
                        serviceStatus: data0.serviceStatus,
                        qualification1: data0.qualification1,
                        qualification2: data0.qualification2,
                        community: data0.community,
                        degreeData: data0.degreeData,
                        caste: data0.caste,
                        religion: data0.religion,
                        promotionGrade: data0.promotionGrade,
                        payscale: data0.payscale,
                        officeEmail: data0.officeEmail,
                        mobileNo1: data0.mobileNo1,
                        mobileNo2: data0.mobileNo2,
                        mobileNo3: data0.mobileNo3,
                        addressLine: data0.addressLine,
                        city: data0.city,
                        pincode: data0.pincode,
                        employeeId: data0.employeeId,
                        ifhrmsId: data0.ifhrmsId,
                        
                        lastDateOfPromotion : data0.lastDateOfPromotion,
                        languages : data0.languages,
                        seniority: data0.seniority,
                        //photo: data0.photo,
                        imagePath: data0.imagePath,
                        submittedBy: data0.submittedBy,
                        approvedBy: data0.approvedBy,
                        approvedDate: data0.approvedDate,
                        approvalStatus: data0.approvalStatus,
                        
                        departmentId: data0.departmentId,
                        leaveCredit: await leaveCredit.find({empProfileId: data0._id})
                    }
                    resultData.push(dataAll);
                }
            }
            
        }
            //console.log('if', data);
            successRes(res, resultData, 'Employee listed Successfully');
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
                console.log('Inside else if2');
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
            if (req.query.batch) {
                profileQuery.batch= req.query.batch;
            }
             // Step 2: Query the leave collection where submittedBy matches any of the admin IDs
             data = await employeeProfile.find(profileQuery)
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
             .sort({ batch: 'asc' })
	    .allowDiskUse(true)
	    .exec();
            //console.log(data, 'employeeProfile listed if Successfully');
            successRes(res, data, 'employeeProfile listed Successfully');
                
        }
        else{
            if (req.query.batch) {
                query.batch= req.query.batch;
            }
            data = await employeeProfile.find(query).sort({ batch: 'asc' })
	        .allowDiskUse(true)
	        .exec();
            //console.log('else', data);
            successRes(res, data, 'Employee listed Successfully');

        }
        } catch (error) {
            console.log('error', error);
            errorRes(res, error, "Error on listing employee");
        }
    }


// Get getEmployeeForLogin
exports.getEmployeeForLogin = async (req, res) => {
    console.log('helo from employeeProfile controller', req.query);
    try {
        let query = {};
        let data;
        data = await employeeProfile
        .find({
            $or: [
              { loginId: { $exists: false } }, // loginId does not exist
              { loginId: null }                // loginId exists but is null
            ]
          })
        .select('fullName _id')
        .sort({ batch: 'asc' }).exec();
        console.log('else', data);
        successRes(res, data, 'Employee listed Successfully');
    }
    catch (error) {
        console.log('error', error);
        errorRes(res, error, "Error on listing employee");
    }
}


// Get getEmployeeByFilter
exports.getEmployeeByFilter = async (req, res) => {
    console.log('helo from getEmployeeByJoiningDate controller', req.query);
    try {
        let data = [];
        let dataUpdate = [];
        let matched = [];
        let postData = [];
        let resultData = [];
        if(req.query.name && !req.query.start && !req.query.end){
                let name = req.query.name;
                
                let getQueryJson = {
                    fullName: name
                } 
                console.log(getQueryJson);
                data = await employeeProfile.find(getQueryJson).exec();
                console.log('Data ==> ', data);
                let dataAll = {}
                if(data.length > 0){
                    console.log('data.length', data.length)
                    for(let data0 of data){
                        let updateQueryJson = {
                            empId: data0._id
                        }
                        uniqueArray = await empProfile.getEmployeeUpdateFilter(updateQueryJson);
                        console.log('uniqueArray.length ==> ', uniqueArray.length);
                        console.log('uniqueArray ==> ', uniqueArray[0]);
                        if(uniqueArray.length > 0 && uniqueArray[0].transferOrPostingEmployeesList){
                            for(let transferOrPostingEmployeesList of uniqueArray[0].transferOrPostingEmployeesList){
                                console.log('Check ', transferOrPostingEmployeesList.fullName);
                                if(transferOrPostingEmployeesList.empProfileId._id.toString() === data0._id.toString()){
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
                                        fullName: data0.fullName,
                                        personalEmail: data0.personalEmail,
                                        _id: data0._id,
                                        gender: data0.gender,
                                        dateOfBirth: data0.dateOfBirth,
                                        dateOfJoining: data0.dateOfJoining,
                                        dateOfRetirement : data0.dateOfRetirement,
                                        state: data0.state,
                                        batch: data0.batch,
                                        recruitmentType: data0.recruitmentType,
                                        serviceStatus: data0.serviceStatus,
                                        qualification1: data0.qualification1,
                                        qualification2: data0.qualification2,
                                        community: data0.community,
                                        degreeData: data0.degreeData,
                                        caste: data0.caste,
                                        religion: data0.religion,
                                        promotionGrade: data0.promotionGrade,
                                        payscale: data0.payscale,
                                        officeEmail: data0.officeEmail,
                                        mobileNo1: data0.mobileNo1,
                                        mobileNo2: data0.mobileNo2,
                                        mobileNo3: data0.mobileNo3,
                                        addressLine: data0.addressLine,
                                        city: data0.city,
                                        pincode: data0.pincode,
                                        employeeId: data0.employeeId,
                                        ifhrmsId: data0.ifhrmsId,
                                        //photo: data0.photo,
                                        imagePath: data0.imagePath,
                                        submittedBy: data0.submittedBy,
                                        approvedBy: data0.approvedBy,
                                        approvedDate: data0.approvedDate,
                                        approvalStatus: data0.approvalStatus,
                                    }
                                    resultData.push(dataAll);
                                }
                                else{
                                    dataAll = {
                                        fullName: data0.fullName,
                                        personalEmail: data0.personalEmail,
                                        _id: data0._id,
                                        gender: data0.gender,
                                        dateOfBirth: data0.dateOfBirth,
                                        dateOfJoining: data0.dateOfJoining,
                                        dateOfRetirement : data0.dateOfRetirement,
                                        state: data0.state,
                                        batch: data0.batch,
                                        recruitmentType: data0.recruitmentType,
                                        serviceStatus: data0.serviceStatus,
                                        qualification1: data0.qualification1,
                                        qualification2: data0.qualification2,
                                        community: data0.community,
                                        degreeData: data0.degreeData,
                                        caste: data0.caste,
                                        religion: data0.religion,
                                        promotionGrade: data0.promotionGrade,
                                        payscale: data0.payscale,
                                        officeEmail: data0.officeEmail,
                                        mobileNo1: data0.mobileNo1,
                                        mobileNo2: data0.mobileNo2,
                                        mobileNo3: data0.mobileNo3,
                                        addressLine: data0.addressLine,
                                        city: data0.city,
                                        pincode: data0.pincode,
                                        employeeId: data0.employeeId,
                                        ifhrmsId: data0.ifhrmsId,
                                        //photo: data0.photo,
                                        imagePath: data0.imagePath,
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
                                fullName: data0.fullName,
                                personalEmail: data0.personalEmail,
                                _id: data0._id,
                                gender: data0.gender,
                                dateOfBirth: data0.dateOfBirth,
                                dateOfJoining: data0.dateOfJoining,
                                dateOfRetirement : data0.dateOfRetirement,
                                state: data0.state,
                                batch: data0.batch,
                                recruitmentType: data0.recruitmentType,
                                serviceStatus: data0.serviceStatus,
                                qualification1: data0.qualification1,
                                qualification2: data0.qualification2,
                                community: data0.community,
                                degreeData: data0.degreeData,
                                caste: data0.caste,
                                religion: data0.religion,
                                promotionGrade: data0.promotionGrade,
                                payscale: data0.payscale,
                                officeEmail: data0.officeEmail,
                                mobileNo1: data0.mobileNo1,
                                mobileNo2: data0.mobileNo2,
                                mobileNo3: data0.mobileNo3,
                                addressLine: data0.addressLine,
                                city: data0.city,
                                pincode: data0.pincode,
                                employeeId: data0.employeeId,
                                ifhrmsId: data0.ifhrmsId,
                                //photo: data0.photo,
                                imagePath: data0.imagePath,
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
                    resultData = data;
                }
                successRes(res, resultData, 'Employee listed Successfully');
                
            }
            if(req.query.start && req.query.end){
                let dateJson = {};
                let start = req.query.start;
                let end = req.query.end;   
                let endDate = new Date(end)
                endDate.setDate(endDate.getDate() + 1);
                console.log('Start => ', start);
                console.log('end1 updated one day => ', endDate);
                dateJson .dateOfJoining= {
                    $gte: new Date(start), 
                    $lt: endDate
                }
                console.log('dateJson ', dateJson);
                data = await employeeProfile.find(dateJson).exec();
                console.log('Data ==> ', data);
                let dataAll = {}
                if(data.length > 0){
                    console.log('data.length', data.length)
                    for(let data0 of data){
                        let updateQueryJson = {
                            empId: data0._id
                        }
                        uniqueArray = await empProfile.getEmployeeUpdateFilter(updateQueryJson);
                        console.log('uniqueArray.length ==> ', uniqueArray.length);
                        console.log('uniqueArray ==> ', uniqueArray[0]);
                        if(uniqueArray.length > 0 && uniqueArray[0].transferOrPostingEmployeesList){
                            for(let transferOrPostingEmployeesList of uniqueArray[0].transferOrPostingEmployeesList){
                                console.log('Check ', transferOrPostingEmployeesList.fullName);
                                if(transferOrPostingEmployeesList.empProfileId._id.toString() === data0._id.toString()){
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
                                        fullName: data0.fullName,
                                        personalEmail: data0.personalEmail,
                                        _id: data0._id,
                                        gender: data0.gender,
                                        dateOfBirth: data0.dateOfBirth,
                                        dateOfJoining: data0.dateOfJoining,
                                        dateOfRetirement : data0.dateOfRetirement,
                                        state: data0.state,
                                        batch: data0.batch,
                                        recruitmentType: data0.recruitmentType,
                                        serviceStatus: data0.serviceStatus,
                                        qualification1: data0.qualification1,
                                        qualification2: data0.qualification2,
                                        community: data0.community,
                                        degreeData: data0.degreeData,
                                        caste: data0.caste,
                                        religion: data0.religion,
                                        promotionGrade: data0.promotionGrade,
                                        payscale: data0.payscale,
                                        officeEmail: data0.officeEmail,
                                        mobileNo1: data0.mobileNo1,
                                        mobileNo2: data0.mobileNo2,
                                        mobileNo3: data0.mobileNo3,
                                        addressLine: data0.addressLine,
                                        city: data0.city,
                                        pincode: data0.pincode,
                                        employeeId: data0.employeeId,
                                        ifhrmsId: data0.ifhrmsId,
                                        //photo: data0.photo,
                                        imagePath: data0.imagePath,
                                        submittedBy: data0.submittedBy,
                                        approvedBy: data0.approvedBy,
                                        approvedDate: data0.approvedDate,
                                        approvalStatus: data0.approvalStatus,
                                    }
                                    resultData.push(dataAll);
                                }
                                else{
                                    dataAll = {
                                        fullName: data0.fullName,
                                        personalEmail: data0.personalEmail,
                                        _id: data0._id,
                                        gender: data0.gender,
                                        dateOfBirth: data0.dateOfBirth,
                                        dateOfJoining: data0.dateOfJoining,
                                        dateOfRetirement : data0.dateOfRetirement,
                                        state: data0.state,
                                        batch: data0.batch,
                                        recruitmentType: data0.recruitmentType,
                                        serviceStatus: data0.serviceStatus,
                                        qualification1: data0.qualification1,
                                        qualification2: data0.qualification2,
                                        community: data0.community,
                                        degreeData: data0.degreeData,
                                        caste: data0.caste,
                                        religion: data0.religion,
                                        promotionGrade: data0.promotionGrade,
                                        payscale: data0.payscale,
                                        officeEmail: data0.officeEmail,
                                        mobileNo1: data0.mobileNo1,
                                        mobileNo2: data0.mobileNo2,
                                        mobileNo3: data0.mobileNo3,
                                        addressLine: data0.addressLine,
                                        city: data0.city,
                                        pincode: data0.pincode,
                                        employeeId: data0.employeeId,
                                        ifhrmsId: data0.ifhrmsId,
                                        //photo: data0.photo,
                                        imagePath: data0.imagePath,
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
                                fullName: data0.fullName,
                                personalEmail: data0.personalEmail,
                                _id: data0._id,
                                gender: data0.gender,
                                dateOfBirth: data0.dateOfBirth,
                                dateOfJoining: data0.dateOfJoining,
                                dateOfRetirement : data0.dateOfRetirement,
                                state: data0.state,
                                batch: data0.batch,
                                recruitmentType: data0.recruitmentType,
                                serviceStatus: data0.serviceStatus,
                                qualification1: data0.qualification1,
                                qualification2: data0.qualification2,
                                community: data0.community,
                                degreeData: data0.degreeData,
                                caste: data0.caste,
                                religion: data0.religion,
                                promotionGrade: data0.promotionGrade,
                                payscale: data0.payscale,
                                officeEmail: data0.officeEmail,
                                mobileNo1: data0.mobileNo1,
                                mobileNo2: data0.mobileNo2,
                                mobileNo3: data0.mobileNo3,
                                addressLine: data0.addressLine,
                                city: data0.city,
                                pincode: data0.pincode,
                                employeeId: data0.employeeId,
                                ifhrmsId: data0.ifhrmsId,
                                //photo: data0.photo,
                                imagePath: data0.imagePath,
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
                    resultData = data;
                }
                successRes(res, resultData, 'Employee listed Successfully');
            }
            else if(req.query.posting_in && !req.query.name){
                data = await employeeProfile.find().exec();
                //console.log('Data ==> ', data);
                let dataAll = {}
                if(data.length > 0){
                    console.log('true');
                    console.log('data.length', data.length)
                    for(let data0 of data){
                        let updateQueryJson = {
                            empId: data0._id
                        }
                        uniqueArray = await empProfile.getEmployeeUpdateFilter(updateQueryJson);
                        console.log('uniqueArray.length ==> ', uniqueArray.length);
                        //console.log('uniqueArray ==> ', uniqueArray[0]);
                        if(uniqueArray.length > 0 && uniqueArray[0].transferOrPostingEmployeesList){
                            for(let transferOrPostingEmployeesList of uniqueArray[0].transferOrPostingEmployeesList){
                                console.log('Check ', transferOrPostingEmployeesList.fullName);
                                console.log('Check ', transferOrPostingEmployeesList.toPostingInCategoryCode);
                                if(transferOrPostingEmployeesList.empProfileId._id.toString() === data0._id.toString()){
                                    console.log('Matched ');
                                    console.log('posting available')
                                    if(req.query.department && !req.query.designation){
                                        if(transferOrPostingEmployeesList.toPostingInCategoryCode == req.query.posting_in &&
                                            transferOrPostingEmployeesList.toDepartmentId == req.query.department
                                        ){
                                            console.log('posting in matched ')
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
                                                fullName: data0.fullName,
                                                personalEmail: data0.personalEmail,
                                                _id: data0._id,
                                                gender: data0.gender,
                                                dateOfBirth: data0.dateOfBirth,
                                                dateOfJoining: data0.dateOfJoining,
                                                dateOfRetirement : data0.dateOfRetirement,
                                                state: data0.state,
                                                batch: data0.batch,
                                                recruitmentType: data0.recruitmentType,
                                                serviceStatus: data0.serviceStatus,
                                                qualification1: data0.qualification1,
                                                qualification2: data0.qualification2,
                                                community: data0.community,
                                                degreeData: data0.degreeData,
                                                caste: data0.caste,
                                                religion: data0.religion,
                                                promotionGrade: data0.promotionGrade,
                                                payscale: data0.payscale,
                                                officeEmail: data0.officeEmail,
                                                mobileNo1: data0.mobileNo1,
                                                mobileNo2: data0.mobileNo2,
                                                mobileNo3: data0.mobileNo3,
                                                addressLine: data0.addressLine,
                                                city: data0.city,
                                                pincode: data0.pincode,
                                                employeeId: data0.employeeId,
                                                ifhrmsId: data0.ifhrmsId,
                                                //photo: data0.photo,
                                                imagePath: data0.imagePath,
                                                submittedBy: data0.submittedBy,
                                                approvedBy: data0.approvedBy,
                                                approvedDate: data0.approvedDate,
                                                approvalStatus: data0.approvalStatus,
                                            }
                                            resultData.push(dataAll);
                                            console.log('one ',resultData);
                                        }
                                    }
                                    else if(req.query.department && req.query.designation){
                                        if(transferOrPostingEmployeesList.toPostingInCategoryCode == req.query.posting_in &&
                                            transferOrPostingEmployeesList.toDepartmentId == req.query.department &&
                                            transferOrPostingEmployeesList.toDesignationId == req.query.designation
                                        ){
                                            console.log('posting in matched ')
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
                                                fullName: data0.fullName,
                                                personalEmail: data0.personalEmail,
                                                _id: data0._id,
                                                gender: data0.gender,
                                                dateOfBirth: data0.dateOfBirth,
                                                dateOfJoining: data0.dateOfJoining,
                                                dateOfRetirement : data0.dateOfRetirement,
                                                state: data0.state,
                                                batch: data0.batch,
                                                recruitmentType: data0.recruitmentType,
                                                serviceStatus: data0.serviceStatus,
                                                qualification1: data0.qualification1,
                                                qualification2: data0.qualification2,
                                                community: data0.community,
                                                degreeData: data0.degreeData,
                                                caste: data0.caste,
                                                religion: data0.religion,
                                                promotionGrade: data0.promotionGrade,
                                                payscale: data0.payscale,
                                                officeEmail: data0.officeEmail,
                                                mobileNo1: data0.mobileNo1,
                                                mobileNo2: data0.mobileNo2,
                                                mobileNo3: data0.mobileNo3,
                                                addressLine: data0.addressLine,
                                                city: data0.city,
                                                pincode: data0.pincode,
                                                employeeId: data0.employeeId,
                                                ifhrmsId: data0.ifhrmsId,
                                                //photo: data0.photo,
                                                imagePath: data0.imagePath,
                                                submittedBy: data0.submittedBy,
                                                approvedBy: data0.approvedBy,
                                                approvedDate: data0.approvedDate,
                                                approvalStatus: data0.approvalStatus,
                                            }
                                            resultData.push(dataAll);
                                            console.log('one ',resultData);
                                        }
                                    }
                                    else if(!req.query.department && !req.query.designation){
                                        if(transferOrPostingEmployeesList.toPostingInCategoryCode == req.query.posting_in){
                                            console.log('posting in matched ')
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
                                                fullName: data0.fullName,
                                                personalEmail: data0.personalEmail,
                                                _id: data0._id,
                                                gender: data0.gender,
                                                dateOfBirth: data0.dateOfBirth,
                                                dateOfJoining: data0.dateOfJoining,
                                                dateOfRetirement : data0.dateOfRetirement,
                                                state: data0.state,
                                                batch: data0.batch,
                                                recruitmentType: data0.recruitmentType,
                                                serviceStatus: data0.serviceStatus,
                                                qualification1: data0.qualification1,
                                                qualification2: data0.qualification2,
                                                community: data0.community,
                                                degreeData: data0.degreeData,
                                                caste: data0.caste,
                                                religion: data0.religion,
                                                promotionGrade: data0.promotionGrade,
                                                payscale: data0.payscale,
                                                officeEmail: data0.officeEmail,
                                                mobileNo1: data0.mobileNo1,
                                                mobileNo2: data0.mobileNo2,
                                                mobileNo3: data0.mobileNo3,
                                                addressLine: data0.addressLine,
                                                city: data0.city,
                                                pincode: data0.pincode,
                                                employeeId: data0.employeeId,
                                                ifhrmsId: data0.ifhrmsId,
                                                //photo: data0.photo,
                                                imagePath: data0.imagePath,
                                                submittedBy: data0.submittedBy,
                                                approvedBy: data0.approvedBy,
                                                approvedDate: data0.approvedDate,
                                                approvalStatus: data0.approvalStatus,
                                            }
                                            resultData.push(dataAll);
                                            console.log('one ',resultData);
                                        }
                                    }
                                    
                                    
                                }
                            }

                        }
                    }
                    
                }
                else
                {
                    console.log('false');
                    resultData = data;
                }
                console.log('resultDate ', resultData);
                successRes(res, resultData, 'Employee listed Successfully');
                
            }
            // if(req.query.posting_in){
            //     let dataJsonFrom = {};
            //     let dataJsonTo = {};
            //     let resData = [];
            //     if(req.query.department && !req.query.designation){
            //         dataJsonFrom.fromPostingInCategoryCode = req.query.posting_in;
            //         dataJsonTo.toPostingInCategoryCode = req.query.posting_in;
            //         dataJsonFrom.fromDepartmentId = req.query.department;
            //         dataJsonTo.toDepartmentId = req.query.department;
            //     }
            //     else if(req.query.department && req.query.designation){
            //         dataJsonFrom.fromPostingInCategoryCode = req.query.posting_in;
            //         dataJsonTo.toPostingInCategoryCode = req.query.posting_in;
            //         dataJsonFrom.fromDepartmentId = req.query.department;
            //         dataJsonTo.toDepartmentId = req.query.department;
            //         dataJsonFrom.fromDesignationId = req.query.designation;
            //         dataJsonTo.toDesignationId = req.query.designation;
            //     }
            //     else if(!req.query.department && !req.query.designation){
            //         dataJsonFrom.fromPostingInCategoryCode = req.query.posting_in;
            //         dataJsonTo.toPostingInCategoryCode = req.query.posting_in;
            //     }
            //     dataUpdate = await employeeUpdate.find({$or:[dataJsonFrom,dataJsonTo]}).exec();
            //         if(dataUpdate.length == 0){
            //             console.log('no');
            //         }
            //         else{
            //             console.log('dataUpdate ', dataUpdate);
            //             const array = [1, 2, 3, 2, 4, 5, 4, 5];
            //             const uniqueElements = new Set();

            //             dataUpdate.forEach(item => {
            //                 if (!uniqueElements.has(item.fullName)) {
            //                     uniqueElements.add(item.fullName);
            //                 }
            //             });
            //             const arrayUnique = Array.from(uniqueElements);
            //             //console.log('UNIQUE ARR => ', arrayUnique);
            //             let matchedData = [];
            //             for (var i = 0; i < arrayUnique.length; i++) {
            //                 console.log('inside I => ',i);
            //                 for (var j = 0; j < dataUpdate.length; j++) {
            //                     console.log('inside J => ',i, j);
            //                     if (arrayUnique[i] == dataUpdate[j].fullName) {
            //                         console.log('array matched ', arrayUnique[i], dataUpdate[j].fullName);
            //                         matchedData.push(dataUpdate[j])
            //                       }
            //                     else{
            //                         console.log('error');
            //                     }
            //                 }
            //                 //console.log('dummy ===>>> ', dummy);
            //                 matchedData.sort((a, b) => a.dateOfOrder - b.dateOfOrder);
            //                 //console.log('dummy sorted ===>>> ', dummy);
            //                 matchedData = matchedData.reverse();
            //                 //console.log('dummy reversed ===>>> ', dummy);
            //                 if(matchedData.length == 0){
            //                     console.log('no');
            //                 }
            //                 else{
            //                     matchedData = matchedData[0];
            //                     console.log('dataUpdate ====> ', matchedData);
            //                     if (typeof matchedData["fromDepartmentId"] !== "undefined" ) {
            //                         console.log('from exists');
            //                         let today = new Date()
            //                     console.log(matchedData.dateOfOrder);
            //                     console.log(today);
            //                     if(matchedData.dateOfOrder > today){
            //                         console.log('date of order greater');
            //                         department = matchedData.fromDepartmentId;
            //                         designation = matchedData.fromDesignationId;
            //                     }
            //                     else {
            //                         console.log('today greater');
            //                         department = matchedData.toDepartmentId;
            //                         designation = matchedData.toDesignationId;
            //                     }
            //                     } else {
            //                         console.log('from does not exist');
            //                         console.log('only to dept avail');
            //                     department = matchedData.toDepartmentId;
            //                     designation = matchedData.toDesignationId;
            //                     }
            //                 }
            //                 if(matchedData.length !== 0){
        
            //                     let jsonval = {
            //                         /*fullName: res.fullName,
            //                         gender: res.gender,
            //                         batch: res.batch,*/
            //                         department: department,
            //                         designation: designation,
            //                         empProfileId: matchedData.empProfileId,
            //                         fullName: matchedData.fullName
            //                         }
            //                         resData.push(jsonval);
            //                 }
            //                 /*resData.push({
            //                     fullName: matchedData[0].fullName,
            //                     empProfileId: matchedData[0].empProfileId,
            //                 });*/
            //                 matchedData = [];
            //             }
            //             //console.log('resData ==> ', resData);
            //             for(let i=0; i< resData.length; i++){
            //                 console.log('resData name==> ', resData[i]);
            //                 let getQueryJson = {
            //                     _id: resData[i].empProfileId
            //                 } 
            //                 console.log(getQueryJson);
            //                 postData = await employeeProfile.find(getQueryJson, {
            //                     new: true
            //                 }).select({"gender": 1, "batch": 1}).exec();
            //                 console.log('post data ', postData);
            //                 console.log('res data ', resData[i]);
            //                 resData[i].gender = postData[0].gender;
            //                 resData[i].batch = postData[0].batch;
            //                 console.log('resdata[i] = > ', resData[i]);
            //             }

            //     console.log('DATA RES from date search ', resData);
            //     successRes(res, resData, 'Employee listed Successfully');
            // }
            // }
}
    catch (error) {
        console.log('error => ', error);
        console.log('error', error.reason);
        errorRes(res, error, "Error on listing employee");
    }
}


// Get getEmployeeByFilterOfficer
exports.getEmployeeByFilterOfficer = async (req, res) => {
    console.log('helo from getEmployeeByFilterOfficer controller', req.query);
    try {
            let data = [];
            let dataUpdate = [];
            let matched = [];
            let postData = [];
            let resultData = [];
            if(req.query.name && !req.query.posting_in){
                let name = req.query.name;
                
                let getQueryJson = {
                    fullName: name
                } 
                console.log(getQueryJson);
                data = await employeeProfile.find(getQueryJson).exec();
                console.log('Data ==> ', data);
                let dataAll = {}
                if(data.length > 0){
                    console.log('data.length', data.length)
                    for(let data0 of data){
                        let updateQueryJson = {
                            empId: data0._id
                        }
                        uniqueArray = await empProfile.getEmployeeUpdateFilter(updateQueryJson);
                        console.log('uniqueArray.length ==> ', uniqueArray.length);
                        console.log('uniqueArray ==> ', uniqueArray[0]);
                        if(uniqueArray.length > 0 && uniqueArray[0].transferOrPostingEmployeesList){
                            for(let transferOrPostingEmployeesList of uniqueArray[0].transferOrPostingEmployeesList){
                                console.log('Check ', transferOrPostingEmployeesList.fullName);
                                if(transferOrPostingEmployeesList.empProfileId._id.toString() === data0._id.toString()){
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
                                        fullName: data0.fullName,
                                        personalEmail: data0.personalEmail,
                                        _id: data0._id,
                                        gender: data0.gender,
                                        dateOfBirth: data0.dateOfBirth,
                                        dateOfJoining: data0.dateOfJoining,
                                        dateOfRetirement : data0.dateOfRetirement,
                                        state: data0.state,
                                        batch: data0.batch,
                                        recruitmentType: data0.recruitmentType,
                                        serviceStatus: data0.serviceStatus,
                                        qualification1: data0.qualification1,
                                        qualification2: data0.qualification2,
                                        community: data0.community,
                                        degreeData: data0.degreeData,
                                        caste: data0.caste,
                                        religion: data0.religion,
                                        promotionGrade: data0.promotionGrade,
                                        payscale: data0.payscale,
                                        officeEmail: data0.officeEmail,
                                        mobileNo1: data0.mobileNo1,
                                        mobileNo2: data0.mobileNo2,
                                        mobileNo3: data0.mobileNo3,
                                        addressLine: data0.addressLine,
                                        city: data0.city,
                                        pincode: data0.pincode,
                                        employeeId: data0.employeeId,
                                        ifhrmsId: data0.ifhrmsId,
                                        //photo: data0.photo,
                                        imagePath: data0.imagePath,
                                        submittedBy: data0.submittedBy,
                                        approvedBy: data0.approvedBy,
                                        approvedDate: data0.approvedDate,
                                        approvalStatus: data0.approvalStatus,
                                    }
                                    resultData.push(dataAll);
                                }
                                else{
                                    dataAll = {
                                        fullName: data0.fullName,
                                        personalEmail: data0.personalEmail,
                                        _id: data0._id,
                                        gender: data0.gender,
                                        dateOfBirth: data0.dateOfBirth,
                                        dateOfJoining: data0.dateOfJoining,
                                        dateOfRetirement : data0.dateOfRetirement,
                                        state: data0.state,
                                        batch: data0.batch,
                                        recruitmentType: data0.recruitmentType,
                                        serviceStatus: data0.serviceStatus,
                                        qualification1: data0.qualification1,
                                        qualification2: data0.qualification2,
                                        community: data0.community,
                                        degreeData: data0.degreeData,
                                        caste: data0.caste,
                                        religion: data0.religion,
                                        promotionGrade: data0.promotionGrade,
                                        payscale: data0.payscale,
                                        officeEmail: data0.officeEmail,
                                        mobileNo1: data0.mobileNo1,
                                        mobileNo2: data0.mobileNo2,
                                        mobileNo3: data0.mobileNo3,
                                        addressLine: data0.addressLine,
                                        city: data0.city,
                                        pincode: data0.pincode,
                                        employeeId: data0.employeeId,
                                        ifhrmsId: data0.ifhrmsId,
                                        //photo: data0.photo,
                                        imagePath: data0.imagePath,
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
                                fullName: data0.fullName,
                                personalEmail: data0.personalEmail,
                                _id: data0._id,
                                gender: data0.gender,
                                dateOfBirth: data0.dateOfBirth,
                                dateOfJoining: data0.dateOfJoining,
                                dateOfRetirement : data0.dateOfRetirement,
                                state: data0.state,
                                batch: data0.batch,
                                recruitmentType: data0.recruitmentType,
                                serviceStatus: data0.serviceStatus,
                                qualification1: data0.qualification1,
                                qualification2: data0.qualification2,
                                community: data0.community,
                                degreeData: data0.degreeData,
                                caste: data0.caste,
                                religion: data0.religion,
                                promotionGrade: data0.promotionGrade,
                                payscale: data0.payscale,
                                officeEmail: data0.officeEmail,
                                mobileNo1: data0.mobileNo1,
                                mobileNo2: data0.mobileNo2,
                                mobileNo3: data0.mobileNo3,
                                addressLine: data0.addressLine,
                                city: data0.city,
                                pincode: data0.pincode,
                                employeeId: data0.employeeId,
                                ifhrmsId: data0.ifhrmsId,
                                //photo: data0.photo,
                                imagePath: data0.imagePath,
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
                    resultData = data;
                }
                successRes(res, resultData, 'Employee listed Successfully');
                
            }
            else if(req.query.posting_in && !req.query.name){
                data = await employeeProfile.find().exec();
                //console.log('Data ==> ', data);
                let dataAll = {}
                if(data.length > 0){
                    console.log('true');
                    console.log('data.length', data.length)
                    for(let data0 of data){
                        let updateQueryJson = {
                            empId: data0._id
                        }
                        uniqueArray = await empProfile.getEmployeeUpdateFilter(updateQueryJson);
                        console.log('uniqueArray.length ==> ', uniqueArray.length);
                        //console.log('uniqueArray ==> ', uniqueArray[0]);
                        if(uniqueArray.length > 0 && uniqueArray[0].transferOrPostingEmployeesList){
                            for(let transferOrPostingEmployeesList of uniqueArray[0].transferOrPostingEmployeesList){
                                console.log('Check ', transferOrPostingEmployeesList.fullName);
                                console.log('Check ', transferOrPostingEmployeesList.toPostingInCategoryCode);
                                if(transferOrPostingEmployeesList.empProfileId._id.toString() === data0._id.toString()){
                                    console.log('Matched ');
                                    console.log('posting available')
                                    if(req.query.department && !req.query.designation){
                                        if(transferOrPostingEmployeesList.toPostingInCategoryCode == req.query.posting_in &&
                                            transferOrPostingEmployeesList.toDepartmentId == req.query.department
                                        ){
                                            console.log('posting in matched ')
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
                                                fullName: data0.fullName,
                                                personalEmail: data0.personalEmail,
                                                _id: data0._id,
                                                gender: data0.gender,
                                                dateOfBirth: data0.dateOfBirth,
                                                dateOfJoining: data0.dateOfJoining,
                                                dateOfRetirement : data0.dateOfRetirement,
                                                state: data0.state,
                                                batch: data0.batch,
                                                recruitmentType: data0.recruitmentType,
                                                serviceStatus: data0.serviceStatus,
                                                qualification1: data0.qualification1,
                                                qualification2: data0.qualification2,
                                                community: data0.community,
                                                degreeData: data0.degreeData,
                                                caste: data0.caste,
                                                religion: data0.religion,
                                                promotionGrade: data0.promotionGrade,
                                                payscale: data0.payscale,
                                                officeEmail: data0.officeEmail,
                                                mobileNo1: data0.mobileNo1,
                                                mobileNo2: data0.mobileNo2,
                                                mobileNo3: data0.mobileNo3,
                                                addressLine: data0.addressLine,
                                                city: data0.city,
                                                pincode: data0.pincode,
                                                employeeId: data0.employeeId,
                                                ifhrmsId: data0.ifhrmsId,
                                                //photo: data0.photo,
                                                imagePath: data0.imagePath,
                                                submittedBy: data0.submittedBy,
                                                approvedBy: data0.approvedBy,
                                                approvedDate: data0.approvedDate,
                                                approvalStatus: data0.approvalStatus,
                                            }
                                            resultData.push(dataAll);
                                            console.log('one ',resultData);
                                        }
                                    }
                                    else if(req.query.department && req.query.designation){
                                        if(transferOrPostingEmployeesList.toPostingInCategoryCode == req.query.posting_in &&
                                            transferOrPostingEmployeesList.toDepartmentId == req.query.department &&
                                            transferOrPostingEmployeesList.toDesignationId == req.query.designation
                                        ){
                                            console.log('posting in matched ')
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
                                                fullName: data0.fullName,
                                                personalEmail: data0.personalEmail,
                                                _id: data0._id,
                                                gender: data0.gender,
                                                dateOfBirth: data0.dateOfBirth,
                                                dateOfJoining: data0.dateOfJoining,
                                                dateOfRetirement : data0.dateOfRetirement,
                                                state: data0.state,
                                                batch: data0.batch,
                                                recruitmentType: data0.recruitmentType,
                                                serviceStatus: data0.serviceStatus,
                                                qualification1: data0.qualification1,
                                                qualification2: data0.qualification2,
                                                community: data0.community,
                                                degreeData: data0.degreeData,
                                                caste: data0.caste,
                                                religion: data0.religion,
                                                promotionGrade: data0.promotionGrade,
                                                payscale: data0.payscale,
                                                officeEmail: data0.officeEmail,
                                                mobileNo1: data0.mobileNo1,
                                                mobileNo2: data0.mobileNo2,
                                                mobileNo3: data0.mobileNo3,
                                                addressLine: data0.addressLine,
                                                city: data0.city,
                                                pincode: data0.pincode,
                                                employeeId: data0.employeeId,
                                                ifhrmsId: data0.ifhrmsId,
                                                //photo: data0.photo,
                                                imagePath: data0.imagePath,
                                                submittedBy: data0.submittedBy,
                                                approvedBy: data0.approvedBy,
                                                approvedDate: data0.approvedDate,
                                                approvalStatus: data0.approvalStatus,
                                            }
                                            resultData.push(dataAll);
                                            console.log('one ',resultData);
                                        }
                                    }
                                    else if(!req.query.department && !req.query.designation){
                                        if(transferOrPostingEmployeesList.toPostingInCategoryCode == req.query.posting_in){
                                            console.log('posting in matched ')
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
                                                fullName: data0.fullName,
                                                personalEmail: data0.personalEmail,
                                                _id: data0._id,
                                                gender: data0.gender,
                                                dateOfBirth: data0.dateOfBirth,
                                                dateOfJoining: data0.dateOfJoining,
                                                dateOfRetirement : data0.dateOfRetirement,
                                                state: data0.state,
                                                batch: data0.batch,
                                                recruitmentType: data0.recruitmentType,
                                                serviceStatus: data0.serviceStatus,
                                                qualification1: data0.qualification1,
                                                qualification2: data0.qualification2,
                                                community: data0.community,
                                                degreeData: data0.degreeData,
                                                caste: data0.caste,
                                                religion: data0.religion,
                                                promotionGrade: data0.promotionGrade,
                                                payscale: data0.payscale,
                                                officeEmail: data0.officeEmail,
                                                mobileNo1: data0.mobileNo1,
                                                mobileNo2: data0.mobileNo2,
                                                mobileNo3: data0.mobileNo3,
                                                addressLine: data0.addressLine,
                                                city: data0.city,
                                                pincode: data0.pincode,
                                                employeeId: data0.employeeId,
                                                ifhrmsId: data0.ifhrmsId,
                                                //photo: data0.photo,
                                                imagePath: data0.imagePath,
                                                submittedBy: data0.submittedBy,
                                                approvedBy: data0.approvedBy,
                                                approvedDate: data0.approvedDate,
                                                approvalStatus: data0.approvalStatus,
                                            }
                                            resultData.push(dataAll);
                                            console.log('one ',resultData);
                                        }
                                    }
                                    
                                    
                                }
                            }

                        }
                    }
                    
                }
                else
                {
                    console.log('false');
                    resultData = data;
                }
                console.log('resultDate ', resultData);
                successRes(res, resultData, 'Employee listed Successfully');
                
            }
            // else if(req.query.designation && !req.query.name && !req.query.posting_in){
            //     data = await employeeProfile.find().exec();
            //     //console.log('Data ==> ', data);
            //     let dataAll = {}
            //     if(data.length > 0){
            //         console.log('true');
            //         console.log('data.length', data.length)
            //         for(let data0 of data){
            //             let updateQueryJson = {
            //                 empId: data0._id
            //             }
            //             uniqueArray = await empProfile.getEmployeeUpdateFilter(updateQueryJson);
            //             console.log('uniqueArray.length ==> ', uniqueArray.length);
            //             //console.log('uniqueArray ==> ', uniqueArray[0]);
            //             if(uniqueArray.length > 0 && uniqueArray[0].transferOrPostingEmployeesList){
            //                 for(let transferOrPostingEmployeesList of uniqueArray[0].transferOrPostingEmployeesList){
            //                     console.log('Check ', transferOrPostingEmployeesList.fullName);
            //                     console.log('Check ', transferOrPostingEmployeesList.toPostingInCategoryCode);
            //                     if(transferOrPostingEmployeesList.empProfileId._id.toString() === data0._id.toString()){
            //                         console.log('Matched ');
            //                         console.log('posting available')
            //                         if(transferOrPostingEmployeesList.toDesignationId == req.query.designation){
            //                             console.log('posting in matched ')
            //                             dataAll = {
            //                                 toPostingInCategoryCode: transferOrPostingEmployeesList.toPostingInCategoryCode,
            //                                 toDepartmentId: transferOrPostingEmployeesList.toDepartmentId,
            //                                 toDesignationId: transferOrPostingEmployeesList.toDesignationId,
            //                                 postTypeCategoryCode: transferOrPostingEmployeesList.postTypeCategoryCode,
            //                                 locationChangeCategoryId: transferOrPostingEmployeesList.locationChangeCategoryId,
            //                                 updateType: uniqueArray[0].updateType,
            //                                 orderTypeCategoryCode: uniqueArray[0].orderTypeCategoryCode,
            //                                 orderNumber: uniqueArray[0].orderNumber,
            //                                 orderForCategoryCode: uniqueArray[0].orderForCategoryCode,
            //                                 fullName: data0.fullName,
            //                                 personalEmail: data0.personalEmail,
            //                                 _id: data0._id,
            //                                 gender: data0.gender,
            //                                 dateOfBirth: data0.dateOfBirth,
            //                                 dateOfJoining: data0.dateOfJoining,
            //                                 dateOfRetirement : data0.dateOfRetirement,
            //                                 state: data0.state,
            //                                 batch: data0.batch,
            //                                 recruitmentType: data0.recruitmentType,
            //                                 serviceStatus: data0.serviceStatus,
            //                                 qualification1: data0.qualification1,
            //                                 qualification2: data0.qualification2,
            //                                 community: data0.community,
            //                                 degreeData: data0.degreeData,
            //                                 caste: data0.caste,
            //                                 religion: data0.religion,
            //                                 promotionGrade: data0.promotionGrade,
            //                                 payscale: data0.payscale,
            //                                 officeEmail: data0.officeEmail,
            //                                 mobileNo1: data0.mobileNo1,
            //                                 mobileNo2: data0.mobileNo2,
            //                                 mobileNo3: data0.mobileNo3,
            //                                 addressLine: data0.addressLine,
            //                                 city: data0.city,
            //                                 pincode: data0.pincode,
            //                                 employeeId: data0.employeeId,
            //                                 ifhrmsId: data0.ifhrmsId,
            //                                 // photo: data0.photo,
            //                                 submittedBy: data0.submittedBy,
            //                                 approvedBy: data0.approvedBy,
            //                                 approvedDate: data0.approvedDate,
            //                                 approvalStatus: data0.approvalStatus,
            //                             }
            //                             resultData.push(dataAll);
            //                             console.log('one ',resultData);
            //                         }
                                    
            //                     }
            //                 }

            //             }
            //         }
                    
            //     }
            //     else
            //     {
            //         console.log('false');
            //         resultData = data;
            //     }
            //     console.log('resultDate ', resultData);
            //     successRes(res, resultData, 'Employee listed Successfully');
                
            // }
            else
                throw 'Pls provide proper parameters';
}
    catch (error) {
        console.log('error => ', error);
        console.log('error', error.reason);
        errorRes(res, error, "Error on listing employee");
    }
}

// employeeProfile updation
exports.updateEmployeeProfileOLD = async (req, res) => {
    try {
        console.log('try update employeeProfile');
        const query = req.body;
        let update = {};
        if(query.fullName){
            update.fullName = query.fullName;
        }
        if(query.degreeData){
            update.degreeData = JSON.parse(query.degreeData);
            //update.degreeData = query.degreeData;
        }
        if(query.mobileNo1){
            update.mobileNo1 = query.mobileNo1;
        }
        if(query.mobileNo2){
            update.mobileNo2 = query.mobileNo2;
        }
        if(query.mobileNo3){
            update.mobileNo3 = query.mobileNo3;
        }
        if(query.religion){
            update.religion = query.religion;
        }
        if(query.personalEmail){
            update.personalEmail = query.personalEmail;
        }
        if(query.ifhrmsId){
            update.ifhrmsId = query.ifhrmsId;
        }
        if(query.employeeId){
            update.employeeId = query.employeeId;
        }
        if(query.loginId){
            update.loginId = query.loginId;
        }
        if(query.seniority){
            update.seniority = query.seniority;
        }
	    if(query.dateOfJoining){
            update.dateOfJoining = query.dateOfJoining;
        }
        if(req.file) {
            update.imagePath = path.relative('imageUploads/', req.file.path);
            //update.imagePath = req.file.path;
            console.log('Uploaded file path:', req.file.path);
        }
        let filter = {
            _id : query.id
        }

        console.log('update ', update);
        console.log('filter ', filter);

        const data = await employeeProfile.findOneAndUpdate(filter, update, {
            new: true
          });
        console.log('data updated ', data);
        successRes(res, data, 'Employee updated Successfully');
    } catch (error) {
        console.log('catch update employeeProfile', error);
        errorRes(res, error, "Error on employeeProfile updation");
    }
    }

    exports.updateEmployeeProfileOLDV2 = async (req, res) => {
        try {
            console.log('try update employeeProfile');
            const query = req.body;
            let update = {};
            if(query.fullName){
                update.fullName = query.fullName;
            }
            if(query.degreeData){
                update.degreeData = JSON.parse(query.degreeData);
                //update.degreeData = query.degreeData;
            }
            if(query.mobileNo1){
                update.mobileNo1 = query.mobileNo1;
            }
            if(query.mobileNo2){
                update.mobileNo2 = query.mobileNo2;
            }
            if(query.mobileNo3){
                update.mobileNo3 = query.mobileNo3;
            }
            if(query.religion){
                update.religion = query.religion;
            }
            if(query.personalEmail){
                update.personalEmail = query.personalEmail;
            }
            if(query.ifhrmsId){
                update.ifhrmsId = query.ifhrmsId;
            }
            if(query.employeeId){
                update.employeeId = query.employeeId;
            }
            if(query.loginId){
                update.loginId = query.loginId;
            }
            if(query.seniority){
                update.seniority = query.seniority;
            }
            if(query.dateOfJoining){
                update.dateOfJoining = query.dateOfJoining;
            }
            // if(req.file) {
            //     update.imagePath = req.file.path;
            //     console.log('Uploaded file path:', req.file.path);
            // }
            // Ensure the upload directory exists before converting the image
            const uploadDir = path.join(__dirname, 'uploadsImages');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            if (req.file) {
                const fileExtension = path.extname(req.file.originalname);  // Get the file extension
                //console.log('__dirname', __dirname);
                console.log('uploadDir', uploadDir)
                const outputFilePath = path.join(uploadDir, `${Date.now()}.jpeg`);  // Output file path for the converted image
                console.log('outputFilePath', outputFilePath);

                // Convert the uploaded image to JPEG using sharp
                console.log('req.file.path', req.file.path);
                
                sharp(req.file.path)
                    .jpeg()
                    .toFile(outputFilePath, (err, info) => {
                        if (err) {
                            console.error('Error converting image:', err);
                            return res.status(500).json({ message: 'Error processing image' });
                        }
                        const fileName = path.basename(outputFilePath);
                        update.imagePath = fileName;
    
                        const filter = { _id: query.id };
                        console.log('update ', update);
                        console.log('filter ', filter);
    
                        employeeProfile.findOneAndUpdate(filter, update, { new: true })
                            .then(data => {
                                console.log('data updated ', data);
                                successRes(res, data, 'Employee updated Successfully');
                            })
                            .catch(err => {
                                console.log('Error updating employee profile:', err);
                                errorRes(res, err, "Error on employeeProfile updation");
                            });
                    });
            }
            else{

                let filter = {
                    _id : query.id
                }
        
                console.log('update ', update);
                console.log('filter ', filter);
        
                const data = await employeeProfile.findOneAndUpdate(filter, update, {
                    new: true
                  });
                console.log('data updated ', data);
                successRes(res, data, 'Employee updated Successfully');
            }
            
        } catch (error) {
            console.log('catch update employeeProfile', error);
            errorRes(res, error, "Error on employeeProfile updation");
        }
        }

        exports.updateEmployeeProfile = async (req, res) => {
            try {
                console.log('try update employeeProfile', req.body);
                const query = req.body;
                let update = {};
                let request = {};
                let dateOrder = new Date();
                if(query.fullName){
                    update.fullName = query.fullName;
                }
                if(query.degreeData){
                    update.degreeData = JSON.parse(query.degreeData);
                    //update.degreeData = query.degreeData;
                }
                if(query.mobileNo1){
                    update.mobileNo1 = query.mobileNo1;
                }
                if(query.mobileNo2){
                    update.mobileNo2 = query.mobileNo2;
                }
                if(query.mobileNo3){
                    update.mobileNo3 = query.mobileNo3;
                }
                if(query.religion){
                    update.religion = query.religion;
                }
                if(query.personalEmail){
                    update.personalEmail = query.personalEmail;
                }
                if(query.ifhrmsId){
                    update.ifhrmsId = query.ifhrmsId;
                }
                if(query.employeeId){
                    update.employeeId = query.employeeId;
                }
                if(query.loginId){
                    update.loginId = query.loginId;
                }
                if(query.seniority){
                    //update.seniority = query.seniority ? query.seniority : '';
                }
                if(query.dateOfJoining){
                    update.dateOfJoining = query.dateOfJoining;
                }
                if(query.batch){
                    update.batch = query.batch;
                }
                if(query.personalEmail){
                    update.personalEmail = query.personalEmail;
                }
                // if(query.languages){
                //     update.languages = query.languages;
                // }
                // if(query.lastDateOfPromotion){
                //     update.lastDateOfPromotion = query.lastDateOfPromotion;
                // }
                if(req.body.toDepartmentId){
                    update.departmentId = req.body.toDepartmentId;
                }
                update.languages = query.languages ? query.languages : '';
                update.lastDateOfPromotion = query.lastDateOfPromotion ? query.lastDateOfPromotion : '';
                update.seniority = query.seniority ? query.seniority : '';
                //update.departmentId = query.departmentId ? query.departmentId : '';
                //console.log('__dirname ', __dirname);
                const baseDir = path.resolve(__dirname, '../../../');  // Go two levels up from the current directory

                //console.log('Base directory:', baseDir);

                const uploadDir = path.join(baseDir, 'profileImages');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }

                    if (req.file) {
                        const fileExtension = path.extname(req.file.originalname);  // Get the file extension
                        //console.log('uploadDir', uploadDir);
                        
                        // Output file path for the converted image
                        const outputFilePath = path.join(uploadDir, `${Date.now()}.jpeg`);
                        //console.log('outputFilePath', outputFilePath);
                        
                        // Use imagemagick to convert the uploaded image to JPEG
                        //console.log('req.file.path', req.file.path);
                    
                        Jimp.read(req.file.path)
                        .then(image => {
                            return image.writeAsync(outputFilePath);
                        })
                        .then(() => {
                            console.log('Conversion successful! Output saved to', outputFilePath);
                            const fileName = path.basename(outputFilePath);
                        update.imagePath = fileName;
    
                        const filter = { _id: query.id };
                        console.log('update ', update);
                        console.log('filter ', filter);
    
                        employeeProfile.findOneAndUpdate(filter, update, { new: true })
                            .then(async (data) => {
                                //console.log('data ', data);
                                if(data && req.body.serving && req.body.serving == 'yes'){
                                    //console.log('data ', data);

                                    if(req.body.department && req.body.department == 'yes' && req.body.toDepartmentId && 
                                        req.body.deptAddress && req.body.deptPhoneNumber 
                                        // && req.body.deptFaxNumber && 
                                        // req.body.deptOfficialMobileNo
                                    ){
                                        console.log('department details coming' , data._id);
                                        let deptFaxNumber;
                                        let deptOfficialMobileNo;
                                        let transferObjectDept = {
                                            address : req.body.deptAddress,
                                            phoneNumber : req.body.deptPhoneNumber,
                                            officialMobileNo : req.body.deptOfficialMobileNo ? req.body.deptOfficialMobileNo : '',
                                            faxNumber : req.body.deptFaxNumber ? req.body.deptFaxNumber : '',
                                        }
                                        // if(req.body.deptFaxNumber || req.body.deptFaxNumber == undefined || req.body.deptFaxNumber == ''){
                                        //     console.log('faxNumber is coming');
                                        //     deptFaxNumber = req.body.deptFaxNumber;
                                        //     transferObjectDept.faxNumber = req.body.deptFaxNumber;
                                        // }
                                        // if(req.body.deptOfficialMobileNo || req.body.deptOfficialMobileNo == undefined || req.body.deptOfficialMobileNo == ''){
                                        //     console.log('deptOfficialMobileNo is coming');
                                        //     deptOfficialMobileNo = req.body.deptOfficialMobileNo;
                                        //     transferObjectDept.officialMobileNo = req.body.deptOfficialMobileNo;
                                        // }
                                        console.log('transferObjectDept ', transferObjectDept)
                                        let request1 = {
                                            body : transferObjectDept,
                                            where: {
                                                _id: req.body.toDepartmentId
                                            }
                                        }
                                        const dataDepartment = await departmentController.handledepartmentEdit(request1);
                                    }
                                    if(req.body.updateType && req.body.toDepartmentId && req.body.toDesignationId  
                                        // && req.body.toPostingInCategoryCode && req.body.postTypeCategoryCode && req.body.locationChangeCategoryId
                                        // && data._id
                                    ){
                                        console.log('employee updateType coming' );
                                        let postingIn;
                                        let postType;
                                        let location;
                                        let transferObject = {
                                            empProfileId: data._id,
                                            employeeId: data.employeeId,
                                            fullName: data.fullName,
                                            toDepartmentId: req.body.toDepartmentId,
                                            toDesignationId: req.body.toDesignationId,
                                            // toPostingInCategoryCode: req.body.toPostingInCategoryCode ? req.body.toPostingInCategoryCode : '',
                                            // postTypeCategoryCode: req.body.postTypeCategoryCode ? req.body.postTypeCategoryCode : '',
                                            // locationChangeCategoryId: req.body.locationChangeCategoryId ? req.body.locationChangeCategoryId : ''
                                        }
                                        if(req.body.toPostingInCategoryCode){
                                            postingIn = req.body.toPostingInCategoryCode;
                                            transferObject.toPostingInCategoryCode = postingIn;
                                        }
                                        if(req.body.postTypeCategoryCode){
                                            postType = req.body.postTypeCategoryCode;
                                            transferObject.postTypeCategoryCode = postType;
                                        }
                                        if(req.body.locationChangeCategoryId){
                                            location = req.body.locationChangeCategoryId;
                                            transferObject.locationChangeCategoryId = location;
                                        }
                                        console.log('transferObject ', transferObject)
                                        let tansferArray = [];
                                        tansferArray.push(transferObject);
                                        request.body = {
                                                updateType : req.body.updateType,
                                                dateOfOrder : dateOrder,
                                                transferOrPostingEmployeesList : tansferArray
                                        }
                                        
                                        if(req.body.updatePost && req.body.updatePost == 'yes' && req.body.updateId)
                                        {
                                            console.log('Already post available -> edit post');
                                            request.where = {
                                                _id : req.body.updateId
                                            }
                                            const dataPosting = await employeeUpdateController.handlePostingEdit(request);
                                        }
                                        else
                                        {
                                            console.log('Already not availabl - New post')
                                            const dataPosting = await employeeUpdateController.handleBulkEmployeeTransferPosting(request);
                                        }
                                        //await employeeUpdateController.addPostingFromProfile(req, res);
                                        //let data1 = data;
                                        //successRes(res, data1, 'Employee added Successfully');
                                    }
                                    
                                }
                                //below
                                successRes(res, data, 'Employee updated Successfully');
                            })
                            .catch(err => {
                                console.log('Error updating employee profile:', err);
                                errorRes(res, err, "Error on employeeProfile updation");
                            });
                            
                        })
                        .catch(err => {
                            console.error('Error during conversion:', err);
                        });
                    }

                else{
    
                    let filter = {
                        _id : query.id
                    }
            
                    console.log('update ', update);
                    console.log('filter ', filter);
            
                    const data = await employeeProfile.findOneAndUpdate(filter, update, {
                        new: true
                      }).then(async (data) => {
                        //console.log('data updated ', data);
                        //const data = await employeeProfile.create(query);
                        //console.log('data coming 1', data);
                        if(data && req.body.serving && req.body.serving == 'yes'){
                            //console.log('data coming 2', data);
                            if(req.body.department && req.body.department == 'yes' && req.body.toDepartmentId && 
                                req.body.deptAddress && req.body.deptPhoneNumber 
                                // && req.body.deptFaxNumber && 
                                // req.body.deptOfficialMobileNo
                            ){
                                console.log('department details coming' , data._id);
                                let deptFaxNumber;
                                let deptOfficialMobileNo;
                                let transferObjectDept = {
                                    address : req.body.deptAddress,
                                    phoneNumber : req.body.deptPhoneNumber,
                                    officialMobileNo : req.body.deptOfficialMobileNo ? req.body.deptOfficialMobileNo : '',
                                    faxNumber : req.body.deptFaxNumber ? req.body.deptFaxNumber : '',
                                }
                                // if(req.body.deptFaxNumber || req.body.deptFaxNumber == undefined || req.body.deptFaxNumber == ''){
                                //     console.log('faxNumber is coming');
                                //     deptFaxNumber = req.body.deptFaxNumber;
                                //     transferObjectDept.faxNumber = deptFaxNumber;
                                // }
                                // if(req.body.deptOfficialMobileNo || req.body.deptOfficialMobileNo == undefined || req.body.deptFaxNumber == ''){
                                //     console.log('deptOfficialMobileNo is coming');
                                //     deptOfficialMobileNo = req.body.deptOfficialMobileNo;
                                //     transferObjectDept.officialMobileNo = deptOfficialMobileNo;
                                // }
                                console.log('transferObjectDept ', transferObjectDept)
                                let request1 = {
                                    body : transferObjectDept,
                                    where: {
                                        _id: req.body.toDepartmentId
                                    }
                                }
                                const dataDepartment = await departmentController.handledepartmentEdit(request1);
                            }
                            if(req.body.updateType && req.body.toDepartmentId && req.body.toDesignationId  
                                // && req.body.toPostingInCategoryCode && req.body.postTypeCategoryCode && req.body.locationChangeCategoryId
                                // && data._id
                            ){
                                console.log('employee updateType coming' );
                                let postingIn;
                                let postType;
                                let location;
                                let transferObject = {
                                    empProfileId: data._id,
                                    employeeId: data.employeeId,
                                    fullName: data.fullName,
                                    toDepartmentId: req.body.toDepartmentId,
                                    toDesignationId: req.body.toDesignationId,
                                    // toPostingInCategoryCode: req.body.toPostingInCategoryCode ? req.body.toPostingInCategoryCode : '',
                                    // postTypeCategoryCode: req.body.postTypeCategoryCode ? req.body.postTypeCategoryCode : '',
                                    // locationChangeCategoryId: req.body.locationChangeCategoryId ? req.body.locationChangeCategoryId : ''
                                }
                                if(req.body.toPostingInCategoryCode){
                                    postingIn = req.body.toPostingInCategoryCode;
                                    transferObject.toPostingInCategoryCode = postingIn;
                                }
                                if(req.body.postTypeCategoryCode){
                                    postType = req.body.postTypeCategoryCode;
                                    transferObject.postTypeCategoryCode = postType;
                                }
                                if(req.body.locationChangeCategoryId){
                                    location = req.body.locationChangeCategoryId;
                                    transferObject.locationChangeCategoryId = location;
                                }
                                console.log('transferObject ', transferObject)
                                let tansferArray = [];
                                tansferArray.push(transferObject);
                                request.body = {
                                        updateType : req.body.updateType,
                                         dateOfOrder : dateOrder,
                                        transferOrPostingEmployeesList : tansferArray
                                }
                                
                                if(req.body.updatePost && req.body.updatePost == 'yes' && req.body.updateId)
                                {
                                    console.log('Already post available -> edit post');
                                    request.where = {
                                        _id : req.body.updateId
                                    }
                                    const dataPosting = await employeeUpdateController.handlePostingEdit(request);
                                }
                                else
                                {
                                    console.log(' - New post')
                                    const dataPosting = await employeeUpdateController.handleBulkEmployeeTransferPosting(request);
                                }
                                //await employeeUpdateController.addPostingFromProfile(req, res);
                                //let data1 = data;
                                //successRes(res, data1, 'Employee added Successfully');
                            }
                            // else
                            //     throw new Error('Pls provide valid inputs for employee current posting');
                        }
                        //below
                        successRes(res, data, 'Employee updated Successfully');
                    })
                    .catch(err => {
                        console.log('Error updating employee profile:', err);
                        errorRes(res, err, "Error on employeeProfile updation");
                    });
                    // console.log('data updated ', data);
                    // successRes(res, data, 'Employee updated Successfully');
                }
                
            } catch (error) {
                console.log('catch update employeeProfile', error);
                errorRes(res, error, "Error on employeeProfile updation");
            }
            }

    exports.updateApprovalStatus = async (req, res) => {
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
                const data = await employeeProfile.findOneAndUpdate(filter, update, {
                    new: true
                  });
                console.log('data updated ', data);
                // let reqest = {}
                // reqest.body = {
                //     phone: req.body.phone,
                //     module: req.body.module,
                //     date: req.body.dateOfOrder,
                //     fileName: req.body.filename
                // }
                // const goSent = await whatsapp.sendWhatsapp(reqest, res);
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

exports.getEmployeeUpdate = async(empId) => {
    console.log('inside getEmployeeUpdate function')
    let secretariatDetails;
    secretariatDetails =  await employeeUpdate.find({
        empProfileId: empId
    })
    console.log('secretariatDetails ', secretariatDetails);
    const uniqueNamesByLatestDateOfOrder = secretariatDetails
      .sort((a, b) => new Date(b.dateOfOrder) - new Date(a.dateOfOrder)) // Sort by latest date first
      .reduce((acc, curr) => {
        if (!acc[curr.empProfileId]) { // Check if name already exists in accumulator
          acc[curr.empProfileId] = curr; // If not, add the current item
        }
        return acc;
      }, {});
      console.log('uniqueNamesByLatestDateOfOrder ', uniqueNamesByLatestDateOfOrder);
    const uniqueArray = Object.values(uniqueNamesByLatestDateOfOrder);
    console.log('Unique by latest date of order:', uniqueArray);
    return uniqueArray;
}

exports.getEmployeeUpdateChange = async(empId) => {
    console.log('inside getEmployeeUpdate function')

    const dataResArray  = await employeeUpdate.find({
        'transferOrPostingEmployeesList.empProfileId': empId,
        'updateType': 'Transfer / Posting'
    })
    .populate({
        path: 'transferOrPostingEmployeesList.empProfileId',
        model: 'employeeProfile', // Ensure the model name matches exactly
        select: 'orderNumber' // Specify the fields you want to include from EmployeeProfile
    })
    .sort({ dateOfOrder: -1 }) // Sort by dateOfOrder in descending order (-1)
    .exec();
    console.log(dataResArray);
    console.log('Unique by latest date of order:', dataResArray);
    return dataResArray;
}

    // Get MaleEmployees
exports.getMaleEmployees = async (req, res) => {
    try {
        let query = {};
        let genderDetails;
        let data = [];
        let genderId;
        let uniqueArray = [];
        let resultData = [];

        genderDetails = await categories.find({
            "category_name": "Male"
        })

        console.log('genderDetails', genderDetails[0]._id);
        genderId = genderDetails[0]._id;
        query = {
            gender : genderId,
            serviceStatus : "65f43649a4a01c1cbbd6c9d6"
        };
        data = await employeeProfile.find(query).sort({ dateOfJoining: 'asc' }).exec();

        let dataAll = {}
        if(data.length > 0){
            console.log('data.length', data.length)
            for(let data0 of data){
                let updateQueryJson = {
                    empId: data0._id
                }
                uniqueArray = await empProfile.getEmployeeUpdateFilter(updateQueryJson);
                console.log('uniqueArray.length ==> ', uniqueArray.length);
                console.log('uniqueArray ==> ', uniqueArray[0]);
                if(uniqueArray.length > 0 && uniqueArray[0].transferOrPostingEmployeesList){
                    for(let transferOrPostingEmployeesList of uniqueArray[0].transferOrPostingEmployeesList){
                        console.log('Check ', transferOrPostingEmployeesList.fullName);
                        if(transferOrPostingEmployeesList.empProfileId._id.toString() === data0._id.toString()){
                            console.log('Matched ');
                            console.log('posting available')
                    dataAll = {
                        // toPostingInCategoryCode: uniqueArray[0].transferOrPostingEmployeesList[0].toPostingInCategoryCode,
                        // toDepartmentId: uniqueArray[0].transferOrPostingEmployeesList[0].toDepartmentId,
                        // toDesignationId: uniqueArray[0].transferOrPostingEmployeesList[0].toDesignationId,
                        // postTypeCategoryCode: uniqueArray[0].transferOrPostingEmployeesList[0].postTypeCategoryCode,
                        // locationChangeCategoryId: uniqueArray[0].transferOrPostingEmployeesList[0].locationChangeCategoryId,
                        toPostingInCategoryCode: transferOrPostingEmployeesList.toPostingInCategoryCode,
                                toDepartmentId: transferOrPostingEmployeesList.toDepartmentId,
                                toDesignationId: transferOrPostingEmployeesList.toDesignationId,
                                postTypeCategoryCode: transferOrPostingEmployeesList.postTypeCategoryCode,
                                locationChangeCategoryId: transferOrPostingEmployeesList.locationChangeCategoryId,
                        updateType: uniqueArray[0].updateType,
                        orderTypeCategoryCode: uniqueArray[0].orderTypeCategoryCode,
                        orderNumber: uniqueArray[0].orderNumber,
                        orderForCategoryCode: uniqueArray[0].orderForCategoryCode,
                        fullName: data0.fullName,
                        personalEmail: data0.personalEmail,
                        _id: data0._id,
                        gender: data0.gender,
                        dateOfBirth: data0.dateOfBirth,
                        dateOfJoining: data0.dateOfJoining,
                        dateOfRetirement : data0.dateOfRetirement,
                        state: data0.state,
                        batch: data0.batch,
                        recruitmentType: data0.recruitmentType,
                        serviceStatus: data0.serviceStatus,
                        qualification1: data0.qualification1,
                        qualification2: data0.qualification2,
                        community: data0.community,
                        degreeData: data0.degreeData,
                        caste: data0.caste,
                        religion: data0.religion,
                        promotionGrade: data0.promotionGrade,
                        payscale: data0.payscale,
                        officeEmail: data0.officeEmail,
                        mobileNo1: data0.mobileNo1,
                        mobileNo2: data0.mobileNo2,
                        mobileNo3: data0.mobileNo3,
                        addressLine: data0.addressLine,
                        city: data0.city,
                        pincode: data0.pincode,
                        employeeId: data0.employeeId,
                        ifhrmsId: data0.ifhrmsId,
                        //photo: data0.photo,
                        imagePath: data0.imagePath,
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
                        fullName: data0.fullName,
                        personalEmail: data0.personalEmail,
                        _id: data0._id,
                        gender: data0.gender,
                        dateOfBirth: data0.dateOfBirth,
                        dateOfJoining: data0.dateOfJoining,
                        dateOfRetirement : data0.dateOfRetirement,
                        state: data0.state,
                        batch: data0.batch,
                        recruitmentType: data0.recruitmentType,
                        serviceStatus: data0.serviceStatus,
                        qualification1: data0.qualification1,
                        qualification2: data0.qualification2,
                        community: data0.community,
                        degreeData: data0.degreeData,
                        caste: data0.caste,
                        religion: data0.religion,
                        promotionGrade: data0.promotionGrade,
                        payscale: data0.payscale,
                        officeEmail: data0.officeEmail,
                        mobileNo1: data0.mobileNo1,
                        mobileNo2: data0.mobileNo2,
                        mobileNo3: data0.mobileNo3,
                        addressLine: data0.addressLine,
                        city: data0.city,
                        pincode: data0.pincode,
                        employeeId: data0.employeeId,
                        ifhrmsId: data0.ifhrmsId,
                        //photo: data0.photo,
                        imagePath: data0.imagePath,
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
        console.log('Unique by latest date of order:', uniqueArray);
        let resData = {
            empCount : resultData.length,
            empList: resultData
        }
        successRes(res, resData, 'Male Employees listed Successfully');
    } catch (error) {
        console.log('error', error);
        errorRes(res, error, "Error on listing Male employees");
    }
}

    // Get MaleEmployees
    exports.getFemaleEmployees = async (req, res) => {
        try {
            let query = {};
            let genderDetails;
            let data;
            let genderId;
            let uniqueArray = [];
            let resultData = [];

            genderDetails = await categories.find({
                "category_name": "Female"
            })
    
            console.log('genderDetails', genderDetails[0]._id);
            genderId = genderDetails[0]._id;
            query = {
                gender : genderId,
                serviceStatus : "65f43649a4a01c1cbbd6c9d6"
            };
            data = await employeeProfile.find(query).sort({ dateOfJoining: 'asc' }).exec();

            let dataAll = {}
            if(data.length > 0){
                console.log('data.length', data.length)
                for(let data0 of data){
                    let updateQueryJson = {
                        empId: data0._id
                    }
                    uniqueArray = await empProfile.getEmployeeUpdateFilter(updateQueryJson);
                    console.log('uniqueArray.length ==> ', uniqueArray.length);
                    console.log('uniqueArray ==> ', uniqueArray[0]);
                    if(uniqueArray.length > 0 && uniqueArray[0].transferOrPostingEmployeesList){
                        for(let transferOrPostingEmployeesList of uniqueArray[0].transferOrPostingEmployeesList){
                            console.log('Check ', transferOrPostingEmployeesList.fullName);
                            if(transferOrPostingEmployeesList.empProfileId._id.toString() === data0._id.toString()){
                                console.log('Matched ');
                                console.log('posting available')
                        dataAll = {
                            // toPostingInCategoryCode: uniqueArray[0].transferOrPostingEmployeesList[0].toPostingInCategoryCode,
                            // toDepartmentId: uniqueArray[0].transferOrPostingEmployeesList[0].toDepartmentId,
                            // toDesignationId: uniqueArray[0].transferOrPostingEmployeesList[0].toDesignationId,
                            // postTypeCategoryCode: uniqueArray[0].transferOrPostingEmployeesList[0].postTypeCategoryCode,
                            // locationChangeCategoryId: uniqueArray[0].transferOrPostingEmployeesList[0].locationChangeCategoryId,
                            toPostingInCategoryCode: transferOrPostingEmployeesList.toPostingInCategoryCode,
                                    toDepartmentId: transferOrPostingEmployeesList.toDepartmentId,
                                    toDesignationId: transferOrPostingEmployeesList.toDesignationId,
                                    postTypeCategoryCode: transferOrPostingEmployeesList.postTypeCategoryCode,
                                    locationChangeCategoryId: transferOrPostingEmployeesList.locationChangeCategoryId,
                            updateType: uniqueArray[0].updateType,
                            orderTypeCategoryCode: uniqueArray[0].orderTypeCategoryCode,
                            orderNumber: uniqueArray[0].orderNumber,
                            orderForCategoryCode: uniqueArray[0].orderForCategoryCode,
                            fullName: data0.fullName,
                            personalEmail: data0.personalEmail,
                            _id: data0._id,
                            gender: data0.gender,
                            dateOfBirth: data0.dateOfBirth,
                            dateOfJoining: data0.dateOfJoining,
                            dateOfRetirement : data0.dateOfRetirement,
                            state: data0.state,
                            batch: data0.batch,
                            recruitmentType: data0.recruitmentType,
                            serviceStatus: data0.serviceStatus,
                            qualification1: data0.qualification1,
                            qualification2: data0.qualification2,
                            community: data0.community,
                            degreeData: data0.degreeData,
                            caste: data0.caste,
                            religion: data0.religion,
                            promotionGrade: data0.promotionGrade,
                            payscale: data0.payscale,
                            officeEmail: data0.officeEmail,
                            mobileNo1: data0.mobileNo1,
                            mobileNo2: data0.mobileNo2,
                            mobileNo3: data0.mobileNo3,
                            addressLine: data0.addressLine,
                            city: data0.city,
                            pincode: data0.pincode,
                            employeeId: data0.employeeId,
                            ifhrmsId: data0.ifhrmsId,
                            //photo: data0.photo,
                            imagePath: data0.imagePath,
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
                            fullName: data0.fullName,
                            personalEmail: data0.personalEmail,
                            _id: data0._id,
                            gender: data0.gender,
                            dateOfBirth: data0.dateOfBirth,
                            dateOfJoining: data0.dateOfJoining,
                            dateOfRetirement : data0.dateOfRetirement,
                            state: data0.state,
                            batch: data0.batch,
                            recruitmentType: data0.recruitmentType,
                            serviceStatus: data0.serviceStatus,
                            qualification1: data0.qualification1,
                            qualification2: data0.qualification2,
                            community: data0.community,
                            degreeData: data0.degreeData,
                            caste: data0.caste,
                            religion: data0.religion,
                            promotionGrade: data0.promotionGrade,
                            payscale: data0.payscale,
                            officeEmail: data0.officeEmail,
                            mobileNo1: data0.mobileNo1,
                            mobileNo2: data0.mobileNo2,
                            mobileNo3: data0.mobileNo3,
                            addressLine: data0.addressLine,
                            city: data0.city,
                            pincode: data0.pincode,
                            employeeId: data0.employeeId,
                            ifhrmsId: data0.ifhrmsId,
                            //photo: data0.photo,
                            imagePath: data0.imagePath,
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
            console.log('Unique by latest date of order:', uniqueArray);
            let resData = {
                empCount : resultData.length,
                empList: resultData
            }
            successRes(res, resData, 'Female Employees listed Successfully');

        } catch (error) {
            console.log('error', error);
            errorRes(res, error, "Error on listing Female employees");
        }
    }

// Get Active Employees
exports.getActiveEmployees = async (req, res) => {
    try {
        let query = {};
        let serviceDetails;
        let data;
        let serviceId;
        let uniqueArray = [];
            let resultData = [];

        serviceDetails = await categories.find({
            "category_name": "Serving"
        })

        console.log('service Details', serviceDetails[0]._id);
        serviceId = serviceDetails[0]._id;
        query = {
            serviceStatus : serviceId
        };
        data = await employeeProfile.find(query).sort({ dateOfJoining: 'asc' }).exec();
        let dataAll = {}
        if(data.length > 0){
            console.log('data.length', data.length)
            for(let data0 of data){
                let updateQueryJson = {
                    empId: data0._id
                }
                uniqueArray = await empProfile.getEmployeeUpdateFilter(updateQueryJson);
                console.log('uniqueArray.length ==> ', uniqueArray.length);
                console.log('uniqueArray ==> ', uniqueArray[0]);
                if(uniqueArray.length > 0 && uniqueArray[0].transferOrPostingEmployeesList){
                    for(let transferOrPostingEmployeesList of uniqueArray[0].transferOrPostingEmployeesList){
                        console.log('Check ', transferOrPostingEmployeesList.fullName);
                        if(transferOrPostingEmployeesList.empProfileId._id.toString() === data0._id.toString()){
                            console.log('Matched ');
                            console.log('posting available')
                    dataAll = {
                        // toPostingInCategoryCode: uniqueArray[0].transferOrPostingEmployeesList[0].toPostingInCategoryCode,
                        // toDepartmentId: uniqueArray[0].transferOrPostingEmployeesList[0].toDepartmentId,
                        // toDesignationId: uniqueArray[0].transferOrPostingEmployeesList[0].toDesignationId,
                        // postTypeCategoryCode: uniqueArray[0].transferOrPostingEmployeesList[0].postTypeCategoryCode,
                        // locationChangeCategoryId: uniqueArray[0].transferOrPostingEmployeesList[0].locationChangeCategoryId,
                        toPostingInCategoryCode: transferOrPostingEmployeesList.toPostingInCategoryCode,
                                toDepartmentId: transferOrPostingEmployeesList.toDepartmentId,
                                toDesignationId: transferOrPostingEmployeesList.toDesignationId,
                                postTypeCategoryCode: transferOrPostingEmployeesList.postTypeCategoryCode,
                                locationChangeCategoryId: transferOrPostingEmployeesList.locationChangeCategoryId,
                        Departmentdetails: await departments.findById(transferOrPostingEmployeesList.toDepartmentId).select(
                                    ['department_name', 'address']),
                        updateType: uniqueArray[0].updateType,
                        orderTypeCategoryCode: uniqueArray[0].orderTypeCategoryCode,
                        orderNumber: uniqueArray[0].orderNumber,
                        orderForCategoryCode: uniqueArray[0].orderForCategoryCode,
                        fullName: data0.fullName,
                        personalEmail: data0.personalEmail,
                        _id: data0._id,
                        gender: data0.gender,
                        dateOfBirth: data0.dateOfBirth,
                        dateOfJoining: data0.dateOfJoining,
                        dateOfRetirement : data0.dateOfRetirement,
                        state: data0.state,
                        batch: data0.batch,
                        recruitmentType: data0.recruitmentType,
                        serviceStatus: data0.serviceStatus,
                        qualification1: data0.qualification1,
                        qualification2: data0.qualification2,
                        community: data0.community,
                        degreeData: data0.degreeData,
                        caste: data0.caste,
                        religion: data0.religion,
                        promotionGrade: data0.promotionGrade,
                        payscale: data0.payscale,
                        officeEmail: data0.officeEmail,
                        mobileNo1: data0.mobileNo1,
                        mobileNo2: data0.mobileNo2,
                        mobileNo3: data0.mobileNo3,
                        addressLine: data0.addressLine,
                        city: data0.city,
                        pincode: data0.pincode,
                        employeeId: data0.employeeId,
                        ifhrmsId: data0.ifhrmsId,
                        //photo: data0.photo,
                        imagePath: data0.imagePath,
                        submittedBy: data0.submittedBy,
                        approvedBy: data0.approvedBy,
                        approvedDate: data0.approvedDate,
                        approvalStatus: data0.approvalStatus,
                        leaveCredit: await leaveCredit.find(({empProfileId: data0._id}))
                    }
                    resultData.push(dataAll);
                }
            }

                }
                else{
                    dataAll = {
                        fullName: data0.fullName,
                        personalEmail: data0.personalEmail,
                        _id: data0._id,
                        gender: data0.gender,
                        dateOfBirth: data0.dateOfBirth,
                        dateOfJoining: data0.dateOfJoining,
                        dateOfRetirement : data0.dateOfRetirement,
                        state: data0.state,
                        batch: data0.batch,
                        recruitmentType: data0.recruitmentType,
                        serviceStatus: data0.serviceStatus,
                        qualification1: data0.qualification1,
                        qualification2: data0.qualification2,
                        community: data0.community,
                        degreeData: data0.degreeData,
                        caste: data0.caste,
                        religion: data0.religion,
                        promotionGrade: data0.promotionGrade,
                        payscale: data0.payscale,
                        officeEmail: data0.officeEmail,
                        mobileNo1: data0.mobileNo1,
                        mobileNo2: data0.mobileNo2,
                        mobileNo3: data0.mobileNo3,
                        addressLine: data0.addressLine,
                        city: data0.city,
                        pincode: data0.pincode,
                        employeeId: data0.employeeId,
                        ifhrmsId: data0.ifhrmsId,
                        //photo: data0.photo,
                        imagePath: data0.imagePath,
                        submittedBy: data0.submittedBy,
                        approvedBy: data0.approvedBy,
                        approvedDate: data0.approvedDate,
                        approvalStatus: data0.approvalStatus,
                        leaveCredit: await leaveCredit.find(({empProfileId: data0._id}))
                    }
                    resultData.push(dataAll);
                }
            }
            
        }
        else
        {
            resultData = [];
        }
        console.log('Unique by latest date of order:', uniqueArray);
        let resData = {
            empCount : resultData.length,
            empList: resultData
        }
        successRes(res, resData, 'Active Employees listed Successfully');

        //  for(let employee of data){
        //         uniqueArray = await this.getEmployeeUpdateChange(employee._id);
        //         console.log('length ==> ', uniqueArray.length);
        //         if(uniqueArray.length == 1){
        //             let dataAll = {
        //                 toPostingInCategoryCode: uniqueArray[0].transferOrPostingEmployeesList[0].toPostingInCategoryCode,
        //                 toDepartmentId: uniqueArray[0].transferOrPostingEmployeesList[0].toDepartmentId,
        //                 toDesignationId: uniqueArray[0].transferOrPostingEmployeesList[0].toDesignationId,
        //                 postTypeCategoryCode: uniqueArray[0].transferOrPostingEmployeesList[0].postTypeCategoryCode,
        //                 locationChangeCategoryId: uniqueArray[0].transferOrPostingEmployeesList[0].locationChangeCategoryId,
        //                 remarks: uniqueArray[0].remarks,
        //                 updateType: uniqueArray[0].updateType,
        //                 orderTypeCategoryCode: uniqueArray[0].orderTypeCategoryCode,
        //                 orderNumber: uniqueArray[0].orderNumber,
        //                 orderForCategoryCode: uniqueArray[0].orderForCategoryCode,
        //                 dateOfOrder: uniqueArray[0].dateOfOrder,
        //                 personalEmail: employee.personalEmail,
        //                 _id: employee._id,
        //                 fullName: employee.fullName,
        //                 gender: employee.gender,
        //                 dateOfBirth: employee.dateOfBirth,
        //                 dateOfJoining: employee.dateOfJoining,
        //                 dateOfRetirement: employee.dateOfRetirement,
        //                 state: employee.state,
        //                 batch: employee.batch,
        //                 recruitmentType: employee.recruitmentType,
        //                 serviceStatus: employee.serviceStatus,
        //                 qualification1: employee.qualification1,
        //                 qualification2: employee.qualification2,
        //                 community: employee.community,
        //                 degreeData: employee.degreeData,
        //                 caste: employee.caste,
        //                 religion: employee.religion,
        //                 promotionGrade: employee.promotionGrade,
        //                 payscale: employee.payscale,
        //                 officeEmail: employee.officeEmail,
        //                 mobileNo1: employee.mobileNo1,
        //                 mobileNo2: employee.mobileNo2,
        //                 mobileNo3: employee.mobileNo3,
        //                 addressLine: employee.addressLine,
        //                 city: employee.city,
        //                 pincode: employee.pincode,
        //                 employeeId: employee.employeeId,
        //                 ifhrmsId: employee.ifhrmsId,
        //                 //photo: employee.photo
        //             }
        //             console.log('dataAll => ', dataAll);
        //             resultData.push(dataAll);
        //         }else{
        //             resultData.push(employee);
        //             console.log('employee => ', employee);
        //         }
                
                
        //     }
        //     console.log('Unique by latest date of order:', uniqueArray);
        //     let resData = {
        //         empCount : resultData.length,
        //         empList: resultData
        //     }
        // successRes(res, resData, 'Active Employees listed Successfully');
    } catch (error) {
        console.log('error', error);
        errorRes(res, error, "Error on listing Active employees");
    }
}

// Get Retired Employees
exports.getRetiredEmployees = async (req, res) => {
    try {
        let query = {};
        let serviceDetails;
        let data;
        let serviceId;
        let uniqueArray = [];
        let resultData = [];

        serviceDetails = await categories.find({
            "category_name": "Retired"
        })

        console.log('service Details', serviceDetails[0]._id);
        serviceId = serviceDetails[0]._id;
        query = {
            serviceStatus : serviceId
        };
        data = await employeeProfile.find(query).sort({ dateOfJoining: 'asc' }).exec();
        let dataAll = {}
        if(data.length > 0){
            console.log('data.length', data.length)
            for(let data0 of data){
                let updateQueryJson = {
                    empId: data0._id
                }
                uniqueArray = await empProfile.getEmployeeUpdateFilter(updateQueryJson);
                console.log('uniqueArray.length ==> ', uniqueArray.length);
                console.log('uniqueArray ==> ', uniqueArray[0]);
                if(uniqueArray.length > 0 && uniqueArray[0].transferOrPostingEmployeesList){
                    for(let transferOrPostingEmployeesList of uniqueArray[0].transferOrPostingEmployeesList){
                        console.log('Check ', transferOrPostingEmployeesList.fullName);
                        if(transferOrPostingEmployeesList.empProfileId._id.toString() === data0._id.toString()){
                            console.log('Matched ');
                            console.log('posting available')
                    dataAll = {
                        // toPostingInCategoryCode: uniqueArray[0].transferOrPostingEmployeesList[0].toPostingInCategoryCode,
                        // toDepartmentId: uniqueArray[0].transferOrPostingEmployeesList[0].toDepartmentId,
                        // toDesignationId: uniqueArray[0].transferOrPostingEmployeesList[0].toDesignationId,
                        // postTypeCategoryCode: uniqueArray[0].transferOrPostingEmployeesList[0].postTypeCategoryCode,
                        // locationChangeCategoryId: uniqueArray[0].transferOrPostingEmployeesList[0].locationChangeCategoryId,
                        toPostingInCategoryCode: transferOrPostingEmployeesList.toPostingInCategoryCode,
                                toDepartmentId: transferOrPostingEmployeesList.toDepartmentId,
                                toDesignationId: transferOrPostingEmployeesList.toDesignationId,
                                postTypeCategoryCode: transferOrPostingEmployeesList.postTypeCategoryCode,
                                locationChangeCategoryId: transferOrPostingEmployeesList.locationChangeCategoryId,
                        updateType: uniqueArray[0].updateType,
                        orderTypeCategoryCode: uniqueArray[0].orderTypeCategoryCode,
                        orderNumber: uniqueArray[0].orderNumber,
                        orderForCategoryCode: uniqueArray[0].orderForCategoryCode,
                        fullName: data0.fullName,
                        personalEmail: data0.personalEmail,
                        _id: data0._id,
                        gender: data0.gender,
                        dateOfBirth: data0.dateOfBirth,
                        dateOfJoining: data0.dateOfJoining,
                        dateOfRetirement : data0.dateOfRetirement,
                        state: data0.state,
                        batch: data0.batch,
                        recruitmentType: data0.recruitmentType,
                        serviceStatus: data0.serviceStatus,
                        qualification1: data0.qualification1,
                        qualification2: data0.qualification2,
                        community: data0.community,
                        degreeData: data0.degreeData,
                        caste: data0.caste,
                        religion: data0.religion,
                        promotionGrade: data0.promotionGrade,
                        payscale: data0.payscale,
                        officeEmail: data0.officeEmail,
                        mobileNo1: data0.mobileNo1,
                        mobileNo2: data0.mobileNo2,
                        mobileNo3: data0.mobileNo3,
                        addressLine: data0.addressLine,
                        city: data0.city,
                        pincode: data0.pincode,
                        employeeId: data0.employeeId,
                        ifhrmsId: data0.ifhrmsId,
                        //photo: data0.photo,
                        imagePath: data0.imagePath,
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
                        fullName: data0.fullName,
                        personalEmail: data0.personalEmail,
                        _id: data0._id,
                        gender: data0.gender,
                        dateOfBirth: data0.dateOfBirth,
                        dateOfJoining: data0.dateOfJoining,
                        dateOfRetirement : data0.dateOfRetirement,
                        state: data0.state,
                        batch: data0.batch,
                        recruitmentType: data0.recruitmentType,
                        serviceStatus: data0.serviceStatus,
                        qualification1: data0.qualification1,
                        qualification2: data0.qualification2,
                        community: data0.community,
                        degreeData: data0.degreeData,
                        caste: data0.caste,
                        religion: data0.religion,
                        promotionGrade: data0.promotionGrade,
                        payscale: data0.payscale,
                        officeEmail: data0.officeEmail,
                        mobileNo1: data0.mobileNo1,
                        mobileNo2: data0.mobileNo2,
                        mobileNo3: data0.mobileNo3,
                        addressLine: data0.addressLine,
                        city: data0.city,
                        pincode: data0.pincode,
                        employeeId: data0.employeeId,
                        ifhrmsId: data0.ifhrmsId,
                        //photo: data0.photo,
                        imagePath: data0.imagePath,
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
        console.log('Unique by latest date of order:', uniqueArray);
        let resData = {
            empCount : resultData.length,
            empList: resultData
        }
        successRes(res, resData, 'Retired Employees listed Successfully');
    } catch (error) {
        console.log('error', error);
        errorRes(res, error, "Error on listing Retired employees");
    }
}

// Get Employees from chennai / outside chennai
exports.getByLocation = async (req, res) => {
    try {
        let query = {};
        let data;
        let uniqueArray = [];
        let resultData = [];

        if(req.query.chennai == 'yes'){
            query = { 
                city: { $regex: 'chennai', $options: 'i' },
                serviceStatus : "65f43649a4a01c1cbbd6c9d6"
            };
        }
        else if(req.query.chennai == 'no'){
            query = {
                city: { $not: { $regex: 'chennai', $options: 'i' } },
                serviceStatus : "65f43649a4a01c1cbbd6c9d6"
            };
        }
        query.d = 

        data = await employeeProfile.find(query).sort({ dateOfJoining: 'asc' }).exec();
        let dataAll = {}
        if(data.length > 0){
            console.log('data.length', data.length)
            for(let data0 of data){
                let updateQueryJson = {
                    empId: data0._id
                }
                uniqueArray = await empProfile.getEmployeeUpdateFilter(updateQueryJson);
                console.log('uniqueArray.length ==> ', uniqueArray.length);
                console.log('uniqueArray ==> ', uniqueArray[0]);
                if(uniqueArray.length > 0 && uniqueArray[0].transferOrPostingEmployeesList){
                    for(let transferOrPostingEmployeesList of uniqueArray[0].transferOrPostingEmployeesList){
                        console.log('Check ', transferOrPostingEmployeesList.fullName);
                        if(transferOrPostingEmployeesList.empProfileId._id.toString() === data0._id.toString()){
                            console.log('Matched ');
                            console.log('posting available')
                    dataAll = {
                        // toPostingInCategoryCode: uniqueArray[0].transferOrPostingEmployeesList[0].toPostingInCategoryCode,
                        // toDepartmentId: uniqueArray[0].transferOrPostingEmployeesList[0].toDepartmentId,
                        // toDesignationId: uniqueArray[0].transferOrPostingEmployeesList[0].toDesignationId,
                        // postTypeCategoryCode: uniqueArray[0].transferOrPostingEmployeesList[0].postTypeCategoryCode,
                        // locationChangeCategoryId: uniqueArray[0].transferOrPostingEmployeesList[0].locationChangeCategoryId,
                        toPostingInCategoryCode: transferOrPostingEmployeesList.toPostingInCategoryCode,
                                toDepartmentId: transferOrPostingEmployeesList.toDepartmentId,
                                toDesignationId: transferOrPostingEmployeesList.toDesignationId,
                                postTypeCategoryCode: transferOrPostingEmployeesList.postTypeCategoryCode,
                                locationChangeCategoryId: transferOrPostingEmployeesList.locationChangeCategoryId,
                        updateType: uniqueArray[0].updateType,
                        orderTypeCategoryCode: uniqueArray[0].orderTypeCategoryCode,
                        orderNumber: uniqueArray[0].orderNumber,
                        orderForCategoryCode: uniqueArray[0].orderForCategoryCode,
                        fullName: data0.fullName,
                        personalEmail: data0.personalEmail,
                        _id: data0._id,
                        gender: data0.gender,
                        dateOfBirth: data0.dateOfBirth,
                        dateOfJoining: data0.dateOfJoining,
                        dateOfRetirement : data0.dateOfRetirement,
                        state: data0.state,
                        batch: data0.batch,
                        recruitmentType: data0.recruitmentType,
                        serviceStatus: data0.serviceStatus,
                        qualification1: data0.qualification1,
                        qualification2: data0.qualification2,
                        community: data0.community,
                        degreeData: data0.degreeData,
                        caste: data0.caste,
                        religion: data0.religion,
                        promotionGrade: data0.promotionGrade,
                        payscale: data0.payscale,
                        officeEmail: data0.officeEmail,
                        mobileNo1: data0.mobileNo1,
                        mobileNo2: data0.mobileNo2,
                        mobileNo3: data0.mobileNo3,
                        addressLine: data0.addressLine,
                        city: data0.city,
                        pincode: data0.pincode,
                        employeeId: data0.employeeId,
                        ifhrmsId: data0.ifhrmsId,
                        //photo: data0.photo,
                        imagePath: data0.imagePath,
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
                        fullName: data0.fullName,
                        personalEmail: data0.personalEmail,
                        _id: data0._id,
                        gender: data0.gender,
                        dateOfBirth: data0.dateOfBirth,
                        dateOfJoining: data0.dateOfJoining,
                        dateOfRetirement : data0.dateOfRetirement,
                        state: data0.state,
                        batch: data0.batch,
                        recruitmentType: data0.recruitmentType,
                        serviceStatus: data0.serviceStatus,
                        qualification1: data0.qualification1,
                        qualification2: data0.qualification2,
                        community: data0.community,
                        degreeData: data0.degreeData,
                        caste: data0.caste,
                        religion: data0.religion,
                        promotionGrade: data0.promotionGrade,
                        payscale: data0.payscale,
                        officeEmail: data0.officeEmail,
                        mobileNo1: data0.mobileNo1,
                        mobileNo2: data0.mobileNo2,
                        mobileNo3: data0.mobileNo3,
                        addressLine: data0.addressLine,
                        city: data0.city,
                        pincode: data0.pincode,
                        employeeId: data0.employeeId,
                        ifhrmsId: data0.ifhrmsId,
                        //photo: data0.photo,
                        imagePath: data0.imagePath,
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
        console.log('Unique by latest date of order:', uniqueArray);
        let resData = {
            empCount : resultData.length,
            empList: resultData
        }
        successRes(res, resData, 'List employees based on location Success');
        // let dataAll = {}
        // if(data.length > 0){
        //     console.log('data.length', data.length)
        //     for(let data0 of data){
        //         let updateQueryJson = {
        //             empId: data0._id
        //         }
        //         uniqueArray = await empProfile.getEmployeeUpdateFilter(updateQueryJson);
        //         console.log('uniqueArray.length ==> ', uniqueArray.length);
        //         if(uniqueArray.length > 0){
        //             console.log('posting available')
        //             dataAll = {
        //                 toPostingInCategoryCode: uniqueArray[0].transferOrPostingEmployeesList[0].toPostingInCategoryCode,
        //                 toDepartmentId: uniqueArray[0].transferOrPostingEmployeesList[0].toDepartmentId,
        //                 toDesignationId: uniqueArray[0].transferOrPostingEmployeesList[0].toDesignationId,
        //                 postTypeCategoryCode: uniqueArray[0].transferOrPostingEmployeesList[0].postTypeCategoryCode,
        //                 locationChangeCategoryId: uniqueArray[0].transferOrPostingEmployeesList[0].locationChangeCategoryId,
        //                 updateType: uniqueArray[0].updateType,
        //                 orderTypeCategoryCode: uniqueArray[0].orderTypeCategoryCode,
        //                 orderNumber: uniqueArray[0].orderNumber,
        //                 orderForCategoryCode: uniqueArray[0].orderForCategoryCode,
        //                 fullName: data0.fullName,
        //                 personalEmail: data0.personalEmail,
        //                 _id: data0._id,
        //                 gender: data0.gender,
        //                 dateOfBirth: data0.dateOfBirth,
        //                 dateOfJoining: data0.dateOfJoining,
        //                 dateOfRetirement : data0.dateOfRetirement,
        //                 state: data0.state,
        //                 batch: data0.batch,
        //                 recruitmentType: data0.recruitmentType,
        //                 serviceStatus: data0.serviceStatus,
        //                 qualification1: data0.qualification1,
        //                 qualification2: data0.qualification2,
        //                 community: data0.community,
        //                 degreeData: data0.degreeData,
        //                 caste: data0.caste,
        //                 religion: data0.religion,
        //                 promotionGrade: data0.promotionGrade,
        //                 payscale: data0.payscale,
        //                 officeEmail: data0.officeEmail,
        //                 mobileNo1: data0.mobileNo1,
        //                 mobileNo2: data0.mobileNo2,
        //                 mobileNo3: data0.mobileNo3,
        //                 addressLine: data0.addressLine,
        //                 city: data0.city,
        //                 pincode: data0.pincode,
        //                 employeeId: data0.employeeId,
        //                 ifhrmsId: data0.ifhrmsId,
        //                 // photo: data0.photo,
        //                 submittedBy: data0.submittedBy,
        //                 approvedBy: data0.approvedBy,
        //                 approvedDate: data0.approvedDate,
        //                 approvalStatus: data0.approvalStatus,
        //             }
        //         }
        //         else{
        //             dataAll = {
        //                 fullName: data0.fullName,
        //                 personalEmail: data0.personalEmail,
        //                 _id: data0._id,
        //                 gender: data0.gender,
        //                 dateOfBirth: data0.dateOfBirth,
        //                 dateOfJoining: data0.dateOfJoining,
        //                 dateOfRetirement : data0.dateOfRetirement,
        //                 state: data0.state,
        //                 batch: data0.batch,
        //                 recruitmentType: data0.recruitmentType,
        //                 serviceStatus: data0.serviceStatus,
        //                 qualification1: data0.qualification1,
        //                 qualification2: data0.qualification2,
        //                 community: data0.community,
        //                 degreeData: data0.degreeData,
        //                 caste: data0.caste,
        //                 religion: data0.religion,
        //                 promotionGrade: data0.promotionGrade,
        //                 payscale: data0.payscale,
        //                 officeEmail: data0.officeEmail,
        //                 mobileNo1: data0.mobileNo1,
        //                 mobileNo2: data0.mobileNo2,
        //                 mobileNo3: data0.mobileNo3,
        //                 addressLine: data0.addressLine,
        //                 city: data0.city,
        //                 pincode: data0.pincode,
        //                 employeeId: data0.employeeId,
        //                 ifhrmsId: data0.ifhrmsId,
        //                 // photo: data0.photo,
        //                 submittedBy: data0.submittedBy,
        //                 approvedBy: data0.approvedBy,
        //                 approvedDate: data0.approvedDate,
        //                 approvalStatus: data0.approvalStatus,
        //             }
        //         }
        //         resultData.push(dataAll);
        //     }
            
        // }
        // else
        // {
        //     resultData = [];
        // }
        // console.log('Unique by latest date of order:', uniqueArray);
        // let resData = {
        //     empCount : resultData.length,
        //     empList: resultData
        // }

        
        // for(let employee of data){
        //     uniqueArray = await this.getEmployeeUpdateChange(employee._id);
        //     console.log('length ==> ', uniqueArray.length);
        //     if(uniqueArray.length == 1){
        //         let dataAll = {
        //             toPostingInCategoryCode: uniqueArray[0].transferOrPostingEmployeesList[0].toPostingInCategoryCode,
        //             toDepartmentId: uniqueArray[0].transferOrPostingEmployeesList[0].toDepartmentId,
        //             toDesignationId: uniqueArray[0].transferOrPostingEmployeesList[0].toDesignationId,
        //             postTypeCategoryCode: uniqueArray[0].transferOrPostingEmployeesList[0].postTypeCategoryCode,
        //             locationChangeCategoryId: uniqueArray[0].transferOrPostingEmployeesList[0].locationChangeCategoryId,
        //             remarks: uniqueArray[0].remarks,
        //             updateType: uniqueArray[0].updateType,
        //             orderTypeCategoryCode: uniqueArray[0].orderTypeCategoryCode,
        //             orderNumber: uniqueArray[0].orderNumber,
        //             orderForCategoryCode: uniqueArray[0].orderForCategoryCode,
        //             dateOfOrder: uniqueArray[0].dateOfOrder,
        //             personalEmail: employee.personalEmail,
        //             _id: employee._id,
        //             fullName: employee.fullName,
        //             gender: employee.gender,
        //             dateOfBirth: employee.dateOfBirth,
        //             dateOfJoining: employee.dateOfJoining,
        //             dateOfRetirement: employee.dateOfRetirement,
        //             state: employee.state,
        //             batch: employee.batch,
        //             recruitmentType: employee.recruitmentType,
        //             serviceStatus: employee.serviceStatus,
        //             qualification1: employee.qualification1,
        //             qualification2: employee.qualification2,
        //             community: employee.community,
        //             degreeData: employee.degreeData,
        //             caste: employee.caste,
        //             religion: employee.religion,
        //             promotionGrade: employee.promotionGrade,
        //             payscale: employee.payscale,
        //             officeEmail: employee.officeEmail,
        //             mobileNo1: employee.mobileNo1,
        //             mobileNo2: employee.mobileNo2,
        //             mobileNo3: employee.mobileNo3,
        //             addressLine: employee.addressLine,
        //             city: employee.city,
        //             pincode: employee.pincode,
        //             employeeId: employee.employeeId,
        //             ifhrmsId: employee.ifhrmsId,
        //             //photo: employee.photo
        //         }
        //         console.log('dataAll => ', dataAll);
        //         resultData.push(dataAll);
        //     }else{
        //         resultData.push(employee);
        //         console.log('employee => ', employee);
        //     }
            
            
        // }
        // console.log('Unique by latest date of order:', uniqueArray);
        // let resData = {
        //     empCount : resultData.length,
        //     empList: resultData
        // }
        // successRes(res, resData, 'List employees based on location Success');
    } catch (error) {
        console.log('error', error);
        errorRes(res, error, "Error on listing employees based on location");
    }
}

// Get Employees from Secretariat / not from getBySecretariat
exports.getBySecretariat = async (req, res) => {
    try{
        let query = {
                serviceStatus : "65f43649a4a01c1cbbd6c9d6"
        };
        let secretariatDetails;
        let categoryDetails;
        let categoryId;
        let resDataFinal;
        let resJson;
        let data;
        let resultData = [];
        categoryDetails = await categories.find({
            "category_name": "Secretariat"
        })
        console.log('categoryDetails', categoryDetails[0]._id);
        categoryId = categoryDetails[0]._id.toString();

        data = await employeeProfile.find(query).sort({ dateOfJoining: 'asc' }).exec();
        let dataAll = {}
        if(data.length > 0){
            console.log('data.length', data.length)
            for(let data0 of data){
                let updateQueryJson = {
                    empId: data0._id
                }
                console.log('updateQueryJson ', updateQueryJson);
                uniqueArray = await empProfile.getEmployeeUpdateFilter(updateQueryJson);
                console.log('uniqueArray.length ==> ', uniqueArray[0]);
                if(uniqueArray.length > 0 && uniqueArray[0].transferOrPostingEmployeesList){
                    for(let transferOrPostingEmployeesList of uniqueArray[0].transferOrPostingEmployeesList){
                        console.log('Check ', transferOrPostingEmployeesList.fullName);
                        if(transferOrPostingEmployeesList.empProfileId._id.toString() === data0._id.toString()){
                            console.log('Matched ');
                            console.log('posting available')
                    console.log('fullname => ', transferOrPostingEmployeesList.empProfileId.fullName, uniqueArray[0]._id);
                    console.log('toPostingInCategoryCode => ', transferOrPostingEmployeesList.empProfileId.toPostingInCategoryCode);
                    console.log('categoryId => ', categoryId);

                        if(transferOrPostingEmployeesList.toPostingInCategoryCode == categoryId){
                            if(req.query.secretariat == 'yes'){

                            dataAll = {
                                toPostingInCategoryCode: transferOrPostingEmployeesList.toPostingInCategoryCode,
                                toDepartmentId: transferOrPostingEmployeesList.toDepartmentId,
                                toDesignationId: transferOrPostingEmployeesList.toDesignationId,
                                postTypeCategoryCode: transferOrPostingEmployeesList.postTypeCategoryCode,
                                locationChangeCategoryId: transferOrPostingEmployeesList.locationChangeCategoryId,
                                remarks: uniqueArray[0].remarks,
                                updateType: uniqueArray[0].updateType,
                                orderTypeCategoryCode: uniqueArray[0].orderTypeCategoryCode,
                                orderNumber: uniqueArray[0].orderNumber,
                                orderForCategoryCode: uniqueArray[0].orderForCategoryCode,
                                dateOfOrder: uniqueArray[0].dateOfOrder,
                                        fullName: data0.fullName,
                                personalEmail: data0.personalEmail,
                                _id: data0._id,
                                gender: data0.gender,
                                dateOfBirth: data0.dateOfBirth,
                                dateOfJoining: data0.dateOfJoining,
                                dateOfRetirement : data0.dateOfRetirement,
                                state: data0.state,
                                batch: data0.batch,
                                recruitmentType: data0.recruitmentType,
                                serviceStatus: data0.serviceStatus,
                                qualification1: data0.qualification1,
                                qualification2: data0.qualification2,
                                community: data0.community,
                                degreeData: data0.degreeData,
                                caste: data0.caste,
                                religion: data0.religion,
                                promotionGrade: data0.promotionGrade,
                                payscale: data0.payscale,
                                officeEmail: data0.officeEmail,
                                mobileNo1: data0.mobileNo1,
                                mobileNo2: data0.mobileNo2,
                                mobileNo3: data0.mobileNo3,
                                addressLine: data0.addressLine,
                                city: data0.city,
                                pincode: data0.pincode,
                                employeeId: data0.employeeId,
                                ifhrmsId: data0.ifhrmsId,
                                //photo: data0.photo,
                                imagePath: data0.imagePath,
                                submittedBy: data0.submittedBy,
                                approvedBy: data0.approvedBy,
                                approvedDate: data0.approvedDate,
                                approvalStatus: data0.approvalStatus,
                            }
                            resultData.push(dataAll);
                        }
                    }
                    else{
                        if(transferOrPostingEmployeesList.toPostingInCategoryCode != categoryId){
                            if(req.query.secretariat == 'no'){
                            dataAll = {
                                toPostingInCategoryCode: transferOrPostingEmployeesList.toPostingInCategoryCode,
                                toDepartmentId: transferOrPostingEmployeesList.toDepartmentId,
                                toDesignationId: transferOrPostingEmployeesList.toDesignationId,
                                postTypeCategoryCode: transferOrPostingEmployeesList.postTypeCategoryCode,
                                locationChangeCategoryId: transferOrPostingEmployeesList.locationChangeCategoryId,
                                remarks: uniqueArray[0].remarks,
                                updateType: uniqueArray[0].updateType,
                                orderTypeCategoryCode: uniqueArray[0].orderTypeCategoryCode,
                                orderNumber: uniqueArray[0].orderNumber,
                                orderForCategoryCode: uniqueArray[0].orderForCategoryCode,
                                dateOfOrder: uniqueArray[0].dateOfOrder,
                                fullName: data0.fullName,
                                personalEmail: data0.personalEmail,
                                _id: data0._id,
                                gender: data0.gender,
                                dateOfBirth: data0.dateOfBirth,
                                dateOfJoining: data0.dateOfJoining,
                                dateOfRetirement : data0.dateOfRetirement,
                                state: data0.state,
                                batch: data0.batch,
                                recruitmentType: data0.recruitmentType,
                                serviceStatus: data0.serviceStatus,
                                qualification1: data0.qualification1,
                                qualification2: data0.qualification2,
                                community: data0.community,
                                degreeData: data0.degreeData,
                                caste: data0.caste,
                                religion: data0.religion,
                                promotionGrade: data0.promotionGrade,
                                payscale: data0.payscale,
                                officeEmail: data0.officeEmail,
                                mobileNo1: data0.mobileNo1,
                                mobileNo2: data0.mobileNo2,
                                mobileNo3: data0.mobileNo3,
                                addressLine: data0.addressLine,
                                city: data0.city,
                                pincode: data0.pincode,
                                employeeId: data0.employeeId,
                                ifhrmsId: data0.ifhrmsId,
                                //photo: data0.photo,
                                imagePath: data0.imagePath,
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

                }


            }
        }
        else
        {
            resultData = [];
        }
        console.log('Unique by latest date of order:', uniqueArray);
        let resData = {
            empCount : resultData.length,
            empList: resultData
        }
        successRes(res, resData, 'List employees based on Secretariat Success');

    }
    catch(error){
        console.log('error', error);
        errorRes(res, error, "Error on listing employees based on Secretariat");
    }
}

// Get Employees from Secretariat / not from getBySecretariat
exports.getByDeputation = async (req, res) => {
    try{
        let query = {
        };
        let secretariatDetails;
        let categoryDetails;
        let categoryId;
        let resDataFinal;
        let resJson;
        let data;
        let resultData = [];
        categoryDetails = await categories.find({
            "category_name": "Deputation"
        })
        console.log('categoryDetails', categoryDetails[0]._id);
        categoryId = categoryDetails[0]._id.toString();

        data = await employeeProfile.find(query).sort({ dateOfJoining: 'asc' }).exec();
        let dataAll = {}
        if(data.length > 0){
            console.log('data.length', data.length)
            for(let data0 of data){
                let updateQueryJson = {
                    empId: data0._id
                }
                console.log('updateQueryJson ', updateQueryJson);
                uniqueArray = await empProfile.getEmployeeUpdateFilter(updateQueryJson);
                console.log('uniqueArray.length ==> ', uniqueArray[0]);
                if(uniqueArray.length > 0 && uniqueArray[0].transferOrPostingEmployeesList){
                    for(let transferOrPostingEmployeesList of uniqueArray[0].transferOrPostingEmployeesList){
                        console.log('Check ', transferOrPostingEmployeesList.fullName);
                        if(transferOrPostingEmployeesList.empProfileId._id.toString() === data0._id.toString()){
                            console.log('Matched ');
                            console.log('posting available')
                    console.log('categoryId => ', categoryId, uniqueArray[0].orderForCategoryCode);

                        if(uniqueArray[0].orderForCategoryCode == categoryId){
                            console.log('true');
                            dataAll = {
                                toPostingInCategoryCode: transferOrPostingEmployeesList.toPostingInCategoryCode,
                                toDepartmentId: transferOrPostingEmployeesList.toDepartmentId,
                                toDesignationId: transferOrPostingEmployeesList.toDesignationId,
                                postTypeCategoryCode: transferOrPostingEmployeesList.postTypeCategoryCode,
                                locationChangeCategoryId: transferOrPostingEmployeesList.locationChangeCategoryId,
                                remarks: uniqueArray[0].remarks,
                                updateType: uniqueArray[0].updateType,
                                orderTypeCategoryCode: uniqueArray[0].orderTypeCategoryCode,
                                orderNumber: uniqueArray[0].orderNumber,
                                orderForCategoryCode: uniqueArray[0].orderForCategoryCode,
                                dateOfOrder: uniqueArray[0].dateOfOrder,
                                        fullName: data0.fullName,
                                personalEmail: data0.personalEmail,
                                _id: data0._id,
                                gender: data0.gender,
                                dateOfBirth: data0.dateOfBirth,
                                dateOfJoining: data0.dateOfJoining,
                                dateOfRetirement : data0.dateOfRetirement,
                                state: data0.state,
                                batch: data0.batch,
                                recruitmentType: data0.recruitmentType,
                                serviceStatus: data0.serviceStatus,
                                qualification1: data0.qualification1,
                                qualification2: data0.qualification2,
                                community: data0.community,
                                degreeData: data0.degreeData,
                                caste: data0.caste,
                                religion: data0.religion,
                                promotionGrade: data0.promotionGrade,
                                payscale: data0.payscale,
                                officeEmail: data0.officeEmail,
                                mobileNo1: data0.mobileNo1,
                                mobileNo2: data0.mobileNo2,
                                mobileNo3: data0.mobileNo3,
                                addressLine: data0.addressLine,
                                city: data0.city,
                                pincode: data0.pincode,
                                employeeId: data0.employeeId,
                                ifhrmsId: data0.ifhrmsId,
                                //photo: data0.photo,
                                imagePath: data0.imagePath,
                                submittedBy: data0.submittedBy,
                                approvedBy: data0.approvedBy,
                                approvedDate: data0.approvedDate,
                                approvalStatus: data0.approvalStatus,
                            }
                            resultData.push(dataAll);
                        //     if(req.query.secretariat == 'yes'){

                            
                        // }
                    }

                        }
                    }

                }


            }
        }
        else
        {
            console.log('No profile info')
            resultData = [];
        }
        console.log('Unique by latest date of order:', uniqueArray);
        let resData = {
            empCount : resultData.length,
            //empList: resultData
        }
        successRes(res, resData, 'List employees based on');

    }
    catch(error){
        console.log('error', error);
        errorRes(res, error, "Error on listing employees based on Secretariat");
    }
}

exports.getByDesignation = async (req, res) => {
    try{
        let query = {
            serviceStatus : "65f43649a4a01c1cbbd6c9d6"};
        let secretariatDetails;
        let designationDetails;
        let designationDetails2;
        let designationId1;
        let designationId2;
        let resDataFinal;
        let resJson;
        let data;
        let resultData = [];
        if(req.query.designation){
            designationDetails = await designations.find({
                "designation_name": req.query.designation
            })
            if(req.query.designation == "Additional Collector")
            {
                desig1 = "Additional Collector (Revenue)";
                desig2= "Additional Collector (Development)";
                designationDetails = await designations.find({
                    "designation_name": desig1
                })
                console.log('designationDetails1', designationDetails);
                designationDetails2 = await designations.find({
                    "designation_name": desig2
                })
                console.log('designationDetails2', designationDetails2);
            }
        }
        console.log('designationDetails1 outer', designationDetails[0]._id);
        designationId1 = designationDetails[0]._id.toString();
        if(req.query.designation == "Additional Collector"){
            console.log('designationDetails2 outer', designationDetails2[0]._id);
            designationId2 = designationDetails2[0]._id.toString();
        }
        data = await employeeProfile.find(query).sort({ dateOfJoining: 'asc' }).exec();
        let dataAll = {}
        if(data.length > 0){
            console.log('data.length', data.length)
            for(let data0 of data){
                let updateQueryJson = {
                    empId: data0._id
                }
                console.log('updateQueryJson ', updateQueryJson);
                uniqueArray = await empProfile.getEmployeeUpdateFilter(updateQueryJson);
                console.log('uniqueArray.length ==> ', uniqueArray[0]);
                if(uniqueArray.length > 0 && uniqueArray[0].transferOrPostingEmployeesList){
                    for(let transferOrPostingEmployeesList of uniqueArray[0].transferOrPostingEmployeesList){
                        console.log('Check ', transferOrPostingEmployeesList.fullName);
                        if(transferOrPostingEmployeesList.empProfileId._id.toString() === data0._id.toString()){
                            console.log('Matched ');
                            console.log('posting available')
                            console.log('fullname => ', transferOrPostingEmployeesList.empProfileId.fullName, uniqueArray[0]._id);
                            console.log('toPostingInCategoryCode => ', transferOrPostingEmployeesList.empProfileId.toPostingInCategoryCode);
                            console.log('designationId1 => ', designationId1);

                        if(req.query.designation != "Additional Collector" && transferOrPostingEmployeesList.toDesignationId == designationId1){
                            dataAll = {
                                toPostingInCategoryCode: transferOrPostingEmployeesList.toPostingInCategoryCode,
                                toDepartmentId: transferOrPostingEmployeesList.toDepartmentId,
                                toDesignationId: transferOrPostingEmployeesList.toDesignationId,
                                postTypeCategoryCode: transferOrPostingEmployeesList.postTypeCategoryCode,
                                locationChangeCategoryId: transferOrPostingEmployeesList.locationChangeCategoryId,
                                remarks: uniqueArray[0].remarks,
                                updateType: uniqueArray[0].updateType,
                                orderTypeCategoryCode: uniqueArray[0].orderTypeCategoryCode,
                                orderNumber: uniqueArray[0].orderNumber,
                                orderForCategoryCode: uniqueArray[0].orderForCategoryCode,
                                dateOfOrder: uniqueArray[0].dateOfOrder,
                                        fullName: data0.fullName,
                                personalEmail: data0.personalEmail,
                                _id: data0._id,
                                gender: data0.gender,
                                dateOfBirth: data0.dateOfBirth,
                                dateOfJoining: data0.dateOfJoining,
                                dateOfRetirement : data0.dateOfRetirement,
                                state: data0.state,
                                batch: data0.batch,
                                recruitmentType: data0.recruitmentType,
                                serviceStatus: data0.serviceStatus,
                                qualification1: data0.qualification1,
                                qualification2: data0.qualification2,
                                community: data0.community,
                                degreeData: data0.degreeData,
                                caste: data0.caste,
                                religion: data0.religion,
                                promotionGrade: data0.promotionGrade,
                                payscale: data0.payscale,
                                officeEmail: data0.officeEmail,
                                mobileNo1: data0.mobileNo1,
                                mobileNo2: data0.mobileNo2,
                                mobileNo3: data0.mobileNo3,
                                addressLine: data0.addressLine,
                                city: data0.city,
                                pincode: data0.pincode,
                                employeeId: data0.employeeId,
                                ifhrmsId: data0.ifhrmsId,
                                //photo: data0.photo,
                                imagePath: data0.imagePath,
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
        }
        else
        {
            resultData = [];
        }
        console.log('Unique by latest date of order:', uniqueArray);
        let resData = {
            empCount : resultData.length,
            empList: resultData
        }
        successRes(res, resData, 'List employees based on Designation Success');
    }
    catch(error){
        console.log('error', error);
        errorRes(res, error, "Error on listing employees based on Designation");
    }
}
        

// Get Employees by Designation
exports.getByDesignationOld = async (req, res) => {
    try{
        let query = {};
        let secretariatDetails;
        let designationDetails;
        let designationDetails2;
        let resData = [];
        let designationId1;
        let designationId2;
        let resDataFinal;
        let resJson;
        if(req.query.designation){
            designationDetails = await designations.find({
                "designation_name": req.query.designation
            })
            if(req.query.designation == "Additional Collector")
            {
                desig1 = "Additional Collector (Revenue)";
                desig2= "Additional Collector (Development)";
                designationDetails = await designations.find({
                    "designation_name": desig1
                })
                // console.log('designationDetails', designationDetails);
                designationDetails2 = await designations.find({
                    "designation_name": desig2
                })
                // console.log('designationDetails2', designationDetails2);

            }
        }
        console.log('designationDetails', designationDetails[0]._id);
        designationId1 = designationDetails[0]._id.toString();
        if(req.query.designation == "Additional Collector"){
            console.log('designationDetails2', designationDetails2[0]._id);
            designationId2 = designationDetails2[0]._id.toString();
        }
        
        // secretariatDetails =  await employeeUpdate.find({})
        //   const uniqueNamesByLatestDateOfOrder = secretariatDetails
        //     .sort((a, b) => new Date(b.dateOfOrder) - new Date(a.dateOfOrder)) // Sort by latest date first
        //     .reduce((acc, curr) => {
        //       if (!acc[curr.empProfileId]) { // Check if name already exists in accumulator
        //         acc[curr.empProfileId] = curr; // If not, add the current item
        //       }
        //       return acc;
        //     }, {});
          
        //   const uniqueArray = Object.values(uniqueNamesByLatestDateOfOrder);
        //   console.log('Unique by latest date of order:', uniqueArray);

        const uniqueArray  = await employeeUpdate.find()
        .populate({
            path: 'transferOrPostingEmployeesList.empProfileId',
            model: 'employeeProfile', // Ensure the model name matches exactly
            select: 'orderNumber' // Specify the fields you want to include from EmployeeProfile
        })
        .sort({ dateOfOrder: -1 }) // Sort by dateOfOrder in descending order (-1)
        .exec();
        // console.log(uniqueArray);
        // console.log('Unique by latest date of order:', uniqueArray);

            let lastIndex = -1;
            for(let data of uniqueArray){
                
                console.log('toDesignationId => ', data.transferOrPostingEmployeesList[0].toDesignationId);
                console.log('designationId1 => ', designationId1);
                console.log('designationId2 => ', designationId2);
                if(req.query.designation == "Additional Collector"){
                    if(data.transferOrPostingEmployeesList[0].toDesignationId == designationId1 || data.transferOrPostingEmployeesList[0].toDesignationId == designationId2){
                        if(data.transferOrPostingEmployeesList[0].toDesignationId == designationId1)
                        {
                            console.log('true');
                            let getQueryJson = {
                                _id: data.transferOrPostingEmployeesList[0].empProfileId
                            } 
                            console.log(getQueryJson);
                            const profileData = await employeeProfile.find(getQueryJson).exec();
                            console.log('profileData ', profileData);
                            if(profileData.length > 0){
                                resJson = {
                                    employeeId : data.transferOrPostingEmployeesList[0].employeeId,
                                    fullName: data.transferOrPostingEmployeesList[0].fullName,
                                    toPostingInCategoryCode: data.transferOrPostingEmployeesList[0].toPostingInCategoryCode , 
                                    toDepartmentId: data.transferOrPostingEmployeesList[0].toDepartmentId ,
                                    toDesignationId: data.transferOrPostingEmployeesList[0].toDesignationId ,
                                    postTypeCategoryCode: data.transferOrPostingEmployeesList[0].postTypeCategoryCode ,
                                    dateOfOrder: data.dateOfOrder ,
                                    orderForCategoryCode: data.orderForCategoryCode ,
                                    orderTypeCategoryCode: data.orderTypeCategoryCode,
                                    batch: profileData[0].batch,
                                    ifhrmsId: profileData[0].ifhrmsId,
                                    officeEmail: profileData[0].officeEmail,
                                    mobileNo1: profileData[0].mobileNo1,
                                    city: profileData[0].city,
                                    gender: profileData[0].gender,
                                    fullName: profileData[0].fullName,
                                    _id: profileData[0]._id
                                }
                                console.log('resJson ', resJson);
                                resData.push(resJson);
                                console.log('resData ', resData);
                            }
                            lastIndex++;
                        }
                    }
                }
                else {
                    if(data.transferOrPostingEmployeesList[0].toDesignationId == designationId2)
                    {
                        console.log(' else true');
                        let getQueryJson = {
                            _id: data.transferOrPostingEmployeesList[0].empProfileId
                        } 
                        console.log(getQueryJson);
                        const profileData = await employeeProfile.find(getQueryJson).exec();
                        console.log('profileData ', profileData);
                        if(profileData.length > 0){
                            resJson = {
                                employeeId : data.transferOrPostingEmployeesList[0].employeeId,
                                fullName: data.transferOrPostingEmployeesList[0].fullName,
                                toPostingInCategoryCode: data.transferOrPostingEmployeesList[0].toPostingInCategoryCode , 
                                toDepartmentId: data.transferOrPostingEmployeesList[0].toDepartmentId ,
                                toDesignationId: data.transferOrPostingEmployeesList[0].toDesignationId ,
                                postTypeCategoryCode: data.transferOrPostingEmployeesList[0].postTypeCategoryCode ,
                                dateOfOrder: data.dateOfOrder ,
                                orderForCategoryCode: data.orderForCategoryCode ,
                                orderTypeCategoryCode: data.orderTypeCategoryCode,
                                batch: profileData[0].batch,
                                ifhrmsId: profileData[0].ifhrmsId,
                                officeEmail: profileData[0].officeEmail,
                                mobileNo1: profileData[0].mobileNo1,
                                city: profileData[0].city,
                                gender: profileData[0].gender,
                                fullName: profileData[0].fullName,
                                _id: profileData[0]._id
                            }
                            console.log('resJson ', resJson);
                            resData.push(resJson);
                            console.log('resData ', resData);
                        }
                        lastIndex++;
                    }
                }
                
                if (lastIndex === uniqueArray.length - 1) {
                    console.log('Reached the end of the array');
                  }   
            }
          for(let i=0; i< resData.length; i++){
            console.log('resData name==> ', resData[i]);
        }
        let result = {
            empCount: resData.length,
            empList: resData
        }
          successRes(res, result, 'Designation wise Employees listed Successfully');
    }
    catch(error){
        console.log('error', error);
        errorRes(res, error, "Error on listing employees based on Designation");
    }
}

// Get EmployeeHistory
exports.getEmployeeHistory = async (req, res) => {
    console.log('helo from employee profile with history controller', req.query);
    try {
        let query = {};
        if(req.query)
            query = req.query;
        let queryUpdate = {};
        let data;
        let dataUpdate;
        let resJson = {};
        let resArray = [];
        data = await employeeProfile.find(query).exec();
            for(let employee of data){
                queryUpdate = {
                    empProfileId: employee._id
                }
                resJson = {
                    "personalEmail": employee.personalEmail,
                    "_id": employee._id,
                    "fullName": employee.fullName,
                    "gender": employee.gender,
                    "dateOfBirth": employee.dateOfBirth,
                    "dateOfJoining": employee.dateOfJoining,
                    "dateOfRetirement": employee.dateOfRetirement,
                    "state": employee.state,
                    "batch": employee.batch,
                    "recruitmentType": employee.recruitmentType,
                    "serviceStatus": employee.serviceStatus,
                    "qualification1": employee.qualification1,
                    "qualification2": employee.qualification2,
                    "community": employee.community,
                    "degreeData": employee.degreeData,
                    "caste": employee.caste,
                    "religion": employee.religion,
                    "promotionGrade": employee.promotionGrade,
                    "payscale": employee.payscale,
                    "officeEmail": employee.officeEmail,
                    "mobileNo1": employee.mobileNo1,
                    "mobileNo2": employee.mobileNo2,
                    "mobileNo3": employee.mobileNo3,
                    "addressLine": employee.addressLine,
                    "city": employee.city,
                    "pincode": employee.pincode,
                    "employeeId": employee.employeeId,
                    "ifhrmsId": employee.ifhrmsId,
                    //"photo": employee.photo,
                    imagePath: employee.imagePath,
                }
                data.update = queryUpdate;
                /*queryUpdate = {
                        transferOrPostingEmployeesList: {
                            $elemMatch: { empProfileId: { $in: employee._id } }
                        }
                }
                
                dataUpdate = await employeeUpdate.find(queryUpdate).sort({ dateOfOrder: 'asc' }).exec();
                resJson.employeeHistory = dataUpdate;*/

                const dataResArray  = await employeeUpdate.find({
                    'transferOrPostingEmployeesList.empProfileId': employee._id,
                    'updateType': 'Transfer / Posting'
                })
                .populate({
                    path: 'transferOrPostingEmployeesList.empProfileId',
                    model: 'employeeProfile', // Ensure the model name matches exactly
                    select: 'orderNumber' // Specify the fields you want to include from EmployeeProfile
                })
                .sort({ dateOfOrder: -1 }) // Sort by dateOfOrder in descending order (-1)
                .exec();
                console.log(dataResArray);
                let dataArra = [];
                const employeeId = employee._id.toString();
                if (dataResArray && dataResArray.length > 0) {
                    dataResArray.forEach(dataRes => {
                        console.log('dataResArray.dateOfOrder ', dataRes.dateOfOrder);
                        let json = {
                            _id: dataRes._id,
                            updateType: dataRes.updateType,
                            orderTypeCategoryCode: dataRes.orderTypeCategoryCode,
                            orderNumber: dataRes.orderNumber,
                            orderForCategoryCode: dataRes.orderForCategoryCode,
                            dateOfOrder: dataRes.dateOfOrder,
                            remarks: dataRes.remarks,
                            orderFile: dataRes.orderFile,
                        }
                        if (dataRes.transferOrPostingEmployeesList.length > 0) {
                            const matchedItem = dataRes.transferOrPostingEmployeesList.find(item => 
                                item.empProfileId._id.toString() === employeeId
                            );
                
                            if (matchedItem) {
                                const matchedEmpProfileId = {
                                    _id: matchedItem.empProfileId._id,
                                    orderNumber: matchedItem.empProfileId.orderNumber
                                    // Add more fields from employeeProfile as needed
                                };
                
                                //console.log('Matched empProfileId:', matchedItem);
                                //dataArra.push(matchedItem)
                                json.transferOrPostingEmployeesList = matchedItem;
                                dataArra.push(json);
                                
                            } else {
                                console.log('No matching empProfileId object found in transferOrPostingEmployeesList');
                            }
                        } else {
                            console.log('transferOrPostingEmployeesList is empty for this document');
                        }
                    });
                } else {
                    console.log('No matching data found in employeeUpdate');
                }
                resJson.employeeHistory = dataArra;
                //return data;

                resArray.push(resJson);
            }

        successRes(res, resArray, 'Employee profile with history listed Successfully');
    } catch (error) {
        console.log('error', error);
        errorRes(res, error, "Error on listing employee profile with history");
    }
}

// Get Employee with search option
/*exports.getEmployeeSearch = async (req, res) => {
    console.log('helo from getEmployeeSearch controller', req.query);
    try {
            const { name, batch, department, period, postingIn } = req.query;
            let queryProfile = {};
            let queryUpdate = {};
            // Construct the query based on the parameters provided
            if (name) queryProfile.name = name;
            if (batch) queryProfile.batch = batch;
            if (department) queryUpdate.department = department;
            if (postingIn) queryUpdate.postingIn = postingIn;

            successRes(res, resArray, 'Employee profile with history listed Successfully');
        } 
        catch (error) {
        console.log('error', error);
        errorRes(res, error, "Error on listing employee profile with history");
        }
}*/

// Get Employee with search option
exports.getEmployeeSearch = async (req, res) => {
    console.log('helo from getEmployeeSearch controller', req.query);
    try {
            let result = [];
            const count = Object.keys(req.body).length;
            console.log(`Number of parameters: ${count}`);
            if(count == 0){
                successRes(res, result, 'No employee matched');
            }
            else if(count == 1){
                result = await this.oneParameter(req.body);
                console.log('getEmployeeSearch', result)
                successRes(res, result, 'Employee listed -> one param Successfully');
            }
            else if(count == 2){
                result = await this.twoParameter(req.body);
                console.log('getEmployeeSearch', result)
                successRes(res, result, 'Employee listed -> 2 params Successfully');
            }
            else if(count == 3){
                result = await this.threeParameter(req.body);
                console.log('getEmployeeSearch', result)
                successRes(res, result, 'Employee listed -> 3 params Successfully');
            }
            else if(count == 4){
                result = await this.fourParameter(req.body);
                console.log('getEmployeeSearch', result)
                successRes(res, result, 'Employee listed -> 4 params Successfully');
            }
            else if(count == 5){
                result = await this.fiveParameter(req.body);
                console.log('getEmployeeSearch', result)
                successRes(res, result, 'Employee listed -> 5 params Successfully');
            }
            //successRes(res, count, 'Employee profile with history listed Successfully');
        } 
        catch (error) {
        console.log('error', error);
        errorRes(res, error, "Error on listing employee profile with history");
        }
}

exports.oneParameter = async(input) => {
    console.log('inside oneParameter function', input);
    let result;
    if(input.name){
        console.log('name present');
        result = await this.byProfile(input, "name");
        console.log('oneParameter name ', result);
        return result;
    }
    else if(input.batch){
        console.log('batch present');
        result = await this.byProfile(input, "batch");
        console.log('oneParameter batch ', result);
        return result;
    }
    else if(input.department){
        console.log('department present');
        result = await this.byProfile(input, "department");
        console.log('oneParameter department ', result);
        return result;
    }
    else if(input.postingIn){
        console.log('postingIn present');
        result = await this.byProfile(input, "postingIn");
        console.log('oneParameter posting ', result);
        return result;
    }
    else if(input.period){
        console.log('period present');
        result = await this.byProfile(input, "period");
        console.log('oneParameter period ', result);
        return result;
    }
    let oneResult = [];
    return oneResult;
}

exports.twoParameter = async(input) => {
    console.log('inside twoParameter function', input);
    let result;
    if(input.name && input.batch && !input.department && !input.period && !input.postingIn){
        console.log('name and batch present');
        result = await this.byProfile(input, "naBa");
        console.log('twoParameter name batch', result);
        return result;
    }
    else if(input.name && !input.batch && input.department && !input.period && !input.postingIn){
        console.log('name department present');
        result = await this.byProfile(input, "naDe");
        console.log('twoParameter name department', result);
        return result;
    }
    else if(input.name && !input.batch && !input.department && input.period && !input.postingIn){
        console.log('name period present');
        result = await this.byProfile(input, "naPe");
        console.log('twoParameter name department', result);
        return result;
    }
    else if(input.name && !input.batch && !input.department && !input.period && input.postingIn){
        console.log('name postingIn present');
        result = await this.byProfile(input, "naPo");
        console.log('twoParameter name postingIn', result);
        return result;
    }
    else if(!input.name && input.batch && input.department && !input.period && !input.postingIn){
        console.log('batch department present');
        result = await this.byProfile(input, "baDe");
        console.log('twoParameter batch department', result);
        return result;
    }
    else if(!input.name && input.batch && !input.department && input.period && !input.postingIn){
        console.log('batch period present');
        result = await this.byProfile(input, "baPe");
        console.log('twoParameter batch period', result);
        return result;
    }
    else if(!input.name && input.batch && !input.department && !input.period && input.postingIn){
        console.log('batch postingIn present');
        result = await this.byProfile(input, "baPo");
        console.log('twoParameter postingIn department', result);
        return result;
    }
    else if(!input.name && !input.batch && input.department && input.period && !input.postingIn){
        console.log('department period present');
        result = await this.byProfile(input, "dePe");
        console.log('twoParameter department period', result);
        return result;
    }
    else if(!input.name && !input.batch && input.department && !input.period && input.postingIn){
        console.log('department postingIn present');
        result = await this.byProfile(input, "dePo");
        console.log('twoParameter department postingIn', result);
        return result;
    }
    else if(!input.name && !input.batch && !input.department && input.period && input.postingIn){
        console.log('period postingIn present');
        result = await this.byProfile(input, "pePo");
        console.log('twoParameter period postingIn', result);
        return result;
    }
    else {
        let oneResult = [];
        return oneResult;
    }
}

exports.threeParameter = async(input) => {
    console.log('inside 3Parameter function', input);
    let result;
    if(input.name && input.batch && input.department && !input.period && !input.postingIn){
        console.log('name batch department present');
        result = await this.byProfile(input, "naBaDe");
        console.log('threeParameter name batch department', result);
        return result;
    }
    else if(input.name && input.batch && !input.department && input.period && !input.postingIn){
        console.log('name batch period present');
        result = await this.byProfile(input, "naBaPe");
        console.log('threeParameter name batch period', result);
        return result;
    }
    else if(input.name && input.batch && !input.department && !input.period && input.postingIn){
        console.log('name batch postingIn present');
        result = await this.byProfile(input, "naBaPo");
        console.log('threeParameter name batch postingIn', result);
        return result;
    }
    else if(input.name && !input.batch && input.department && input.period && !input.postingIn){
        console.log('name department period present');
        result = await this.byProfile(input, "naDePe");
        console.log('threeParameter name department period', result);
        return result;
    }
    else if(input.name && !input.batch && input.department && !input.period && input.postingIn){
        console.log('name department postingIn present');
        result = await this.byProfile(input, "naDePo");
        console.log('threeParameter name department postingIn', result);
        return result;
    }
    else if(input.name && !input.batch && !input.department && input.period && input.postingIn){
        console.log('name period postingIn present');
        result = await this.byProfile(input, "naPePo");
        console.log('threeParameter name period postingIn', result);
        return result;
    }
    else if(!input.name && input.batch && input.department && input.period && !input.postingIn){
        console.log('batch department period present');
        result = await this.byProfile(input, "baDePe");
        console.log('threeParameter batch department period', result);
        return result;
    }
    else if(!input.name && input.batch && input.department && !input.period && input.postingIn){
        console.log('batch department postingIn present');
        result = await this.byProfile(input, "baDePo");
        console.log('threeParameter batch department postingIn', result);
        return result;
    }
    else if(!input.name && input.batch && !input.department && input.period && input.postingIn){
        console.log('batch period postingIn present');
        result = await this.byProfile(input, "baPePo");
        console.log('threeParameter batch period postingIn', result);
        return result;
    }
    else if(!input.name && !input.batch && input.department && input.period && input.postingIn){
        console.log('department period postingIn present');
        result = await this.byProfile(input, "dePePo");
        console.log('threeParameter department period postingIn', result);
        return result;
    }
    else {
        let oneResult = [];
        return oneResult;
    }
}

exports.fourParameter = async(input) => {
    console.log('inside 4Parameter function', input);
    let result;
    if(input.name && input.batch && input.department && input.period && !input.postingIn){
        result = await this.byProfile(input, "naBaDePe");
        console.log('4Parameter name batch department period', result);
        return result;
    }
    else if(input.name && input.batch && input.department && !input.period && input.postingIn){
        result = await this.byProfile(input, "naBaDePo");
        console.log('4Parameter name batch department postingIn', result);
        return result;
    }
    else if(input.name && input.batch && !input.department && input.period && input.postingIn){
        result = await this.byProfile(input, "naBaPePo");
        console.log('4Parameter name batch period postingIn', result);
        return result;
    }
    else if(input.name && !input.batch && input.department && input.period && input.postingIn){
        result = await this.byProfile(input, "naDePePo");
        console.log('4Parameter name department period postingIn', result);
        return result;
    }
    /*else if(input.name && !input.batch && input.department && input.period && input.postingIn){
        result = await this.byProfile(input, "naDePePo");
        console.log('4Parameter name department period postingIn', result);
        return result;
    }*/
    else if(!input.name && input.batch && input.department && input.period && input.postingIn){
        result = await this.byProfile(input, "baDePePo");
        console.log('4Parameter batch department period postingIn', result);
        return result;
    }
    else {
        let oneResult = [];
        return oneResult;
    }
}

exports.fiveParameter = async(input) => {
    console.log('inside fiveParameter function', input);
    let resultFive = await this.byProfile(input, "all");
    console.log('fiveParameter batch ', resultFive);
    return resultFive;
}

exports.byProfile = async(input, by) =>{
    try{
        //let batch = input;
        let updateQueryJson;
        console.log('input => ', input+' by => ', by);
        let getQueryJson;
        ////, , , , 
        let uniqueArray = [];
        let resultData = [];
        if(by == "name" || by == 'naDePe' || by == 'naDePo' || by == 'naPePo' || by == 'naDePePo'){
            getQueryJson = {
                fullName: input.name
            } 
        }
        else if(by == "batch" || by == 'baDe' || by == 'baPe' || by == "baPo" ||
        by == 'baDePe' || by == 'baDePo' || by == 'baPePo' || by == 'baDePePo'){
            getQueryJson = {
                batch: input.batch
            } 
        }
        else if(by == 'all' || by == 'naBa' || by == 'naBaDe' || by == 'naBaPe' || by == 'naBaPo' || 
        by == 'naBaDePe' || by == 'naBaDePo' || by == 'naBaPePo'){
            getQueryJson = {
                fullName: input.name,
                batch: input.batch
            } 
        }
        /*else if(by == 'naBa'){
            getQueryJson = {
                fullName: input.name,
                batch: input.batch
            }
        }*/
        else if(by == 'naDe' || by == 'naPe' || by == "naPo"){
            console.log('yes dept/ period => ');
            getQueryJson = {
                fullName: input.name
            }
        }

        console.log(getQueryJson);
        if(by == "name" || by == "batch" || by == "all" || 
        by == "naBa" || by == "naDe" || by == "naPe" || by == "naPo" || 
        by == 'baDe' || by == 'baPe' || by == "baPo" || 
        by == 'naBaDe' || by == 'naBaPe' || by == 'naBaPo' || 
        by == 'naDePe' || by == 'naDePo' || 
        by == 'naPePo' ||
        by == 'baDePe' || by == 'baDePo' || by == 'baPePo' || 
        by == 'naBaDePe' || by == 'naBaDePo' || by == 'naBaPePo' || 
        by == 'naDePePo' || by == 'baDePePo')
            data = await employeeProfile.find(getQueryJson).sort({ dateOfJoining: 'asc' }).exec();
        else if(by == "department" || by == "period" || by == "postingIn"
        || by == 'dePe' || by == 'dePo' || by == 'pePo' || by == 'dePePo')
            data = await employeeProfile.find().sort({ dateOfJoining: 'asc' }).exec();
            
        for(let employee of data){
            console.log('for data => ', employee);
            updateQueryJson = {
                empId: employee._id
            }
            uniqueArray = await this.getEmployeeUpdateFilter(updateQueryJson);
            console.log('length ==> ', uniqueArray.length);
            if(uniqueArray.length > 0){
                console.log('len ', uniqueArray.length);
                for(let transferOrPostingEmployeesList of uniqueArray[0].transferOrPostingEmployeesList){
                    console.log('Check ', transferOrPostingEmployeesList.empProfileId._id.toString(), employee._id.toString());
                    if(transferOrPostingEmployeesList.empProfileId._id.toString() === employee._id.toString()){
                        console.log('Matched ');
                        let dataAll = {
                            toPostingInCategoryCode: transferOrPostingEmployeesList.toPostingInCategoryCode,
                            toDepartmentId: transferOrPostingEmployeesList.toDepartmentId,
                            toDesignationId: transferOrPostingEmployeesList.toDesignationId,
                            postTypeCategoryCode: transferOrPostingEmployeesList.postTypeCategoryCode,
                            locationChangeCategoryId: transferOrPostingEmployeesList.locationChangeCategoryId,
                            remarks: uniqueArray[0].remarks,
                            updateType: uniqueArray[0].updateType,
                            orderTypeCategoryCode: uniqueArray[0].orderTypeCategoryCode,
                            orderNumber: uniqueArray[0].orderNumber,
                            orderForCategoryCode: uniqueArray[0].orderForCategoryCode,
                            dateOfOrder: uniqueArray[0].dateOfOrder,
                            personalEmail: employee.personalEmail,
                            _id: employee._id,
                            fullName: employee.fullName,
                            gender: employee.gender,
                            dateOfBirth: employee.dateOfBirth,
                            dateOfJoining: employee.dateOfJoining,
                            dateOfRetirement: employee.dateOfRetirement,
                            state: employee.state,
                            batch: employee.batch,
                            recruitmentType: employee.recruitmentType,
                            serviceStatus: employee.serviceStatus,
                            qualification1: employee.qualification1,
                            qualification2: employee.qualification2,
                            community: employee.community,
                            degreeData: employee.degreeData,
                            caste: employee.caste,
                            religion: employee.religion,
                            promotionGrade: employee.promotionGrade,
                            payscale: employee.payscale,
                            officeEmail: employee.officeEmail,
                            mobileNo1: employee.mobileNo1,
                            mobileNo2: employee.mobileNo2,
                            mobileNo3: employee.mobileNo3,
                            addressLine: employee.addressLine,
                            city: employee.city,
                            pincode: employee.pincode,
                            employeeId: employee.employeeId,
                            ifhrmsId: employee.ifhrmsId,
                            //photo: employee.photo,
                            imagePath: employee.imagePath,
                        }
                        if(by == 'department' || by == 'naDe' || by == "baDe" || by == 'naBaDe'){
                            console.log('yes dept ');
                            if(transferOrPostingEmployeesList.toDepartmentId == input.department){
                                resultData.push(dataAll);
                            }
                        }
                        if( by == "period" || by == 'naPe' || by == 'baPe' || by == 'naBaPe'){
                            console.log('yes period ');
                            let per = input.period;
                            console.log('input.period', input.period);
                            console.log('per', per);
                            console.log('per.fromDate ', per.fromDate);
                            console.log('per.toDate', per.toDate);
                            //dateToCheck >= fromDate && dateToCheck <= toDate
                            let from = new Date(per.fromDate)
                            let to = new Date(per.toDate)
                            console.log('from',from);
                            console.log('to',to);
                            if(uniqueArray[0].dateOfOrder >= from &&
                            uniqueArray[0].dateOfOrder <= to){
                                // && uniqueArray[0].dateOfOrder < input.period.toDate){
                                console.log('date matched')
                                resultData.push(dataAll);
                            }else console.log('date not matched');
                        }
                        if(by == 'postingIn' || by == 'naPo' || by == "baPo" || by == 'naBaPo'){
                            console.log('yes posting ');
                            if(transferOrPostingEmployeesList.toPostingInCategoryCode){
                                {console.log('yes toposting avail')
                                if(transferOrPostingEmployeesList.toPostingInCategoryCode == input.postingIn)
                                    {
                                        console.log('yes posting matched')
                                        resultData.push(dataAll);
                                    }
                            }
                            }
                        }
                        else if(by == 'dePe' || by == 'naDePe' || by == 'baDePe' || by == 'naBaDePe'){
                            console.log('yes period ');
                            let per = input.period;
                            console.log('input.period', input.period);
                            console.log('per', per);
                            console.log('per.fromDate ', per.fromDate);
                            console.log('per.toDate', per.toDate);
                            //dateToCheck >= fromDate && dateToCheck <= toDate
                            let from = new Date(per.fromDate)
                            let to = new Date(per.toDate)
                            console.log('from',from);
                            console.log('to',to);
                            if(uniqueArray[0].dateOfOrder >= from &&
                            uniqueArray[0].dateOfOrder <= to && 
                            transferOrPostingEmployeesList.toDepartmentId == input.department){
                                resultData.push(dataAll);
                            }
                        }
                        else if(by == 'dePo' || by == 'naDePo' || by == 'baDePo' || by == 'naBaDePo'){
                            if(transferOrPostingEmployeesList.toDepartmentId == input.department){
                                if(transferOrPostingEmployeesList.toPostingInCategoryCode){
                                    console.log('yes toposting avail')
                                    if(transferOrPostingEmployeesList.toPostingInCategoryCode == input.postingIn)
                                    {
                                        console.log('yes posting matched')
                                        resultData.push(dataAll);
                                    }
                                }
                            }
                        }
                        else if(by == 'pePo' || by == 'naPePo' || by == 'baPePo' || by == 'naBaPePo'){
                            console.log('yes period ');
                            let per = input.period;
                            console.log('input.period', input.period);
                            console.log('per', per);
                            console.log('per.fromDate ', per.fromDate);
                            console.log('per.toDate', per.toDate);
                            //dateToCheck >= fromDate && dateToCheck <= toDate
                            let from = new Date(per.fromDate)
                            let to = new Date(per.toDate)
                            console.log('from',from);
                            console.log('to',to);
                            if(uniqueArray[0].dateOfOrder >= from &&
                            uniqueArray[0].dateOfOrder <= to){
                                if(transferOrPostingEmployeesList.toPostingInCategoryCode){
                                    console.log('yes toposting avail')
                                    if(transferOrPostingEmployeesList.toPostingInCategoryCode == input.postingIn)
                                    {
                                        console.log('yes posting matched')
                                        resultData.push(dataAll);
                                    }
                                }
                            }
                        }
                        else if(by == "all" || by == 'dePePo' || by == 'naDePePo' || by == 'baDePePo'){
                            if(transferOrPostingEmployeesList.toDepartmentId == input.department){
                                console.log('yes period ');
                            let per = input.period;
                            console.log('input.period', input.period);
                            console.log('per', per);
                            console.log('per.fromDate ', per.fromDate);
                            console.log('per.toDate', per.toDate);
                            //dateToCheck >= fromDate && dateToCheck <= toDate
                            let from = new Date(per.fromDate)
                            let to = new Date(per.toDate)
                            console.log('from',from);
                            console.log('to',to);
                            if(uniqueArray[0].dateOfOrder >= from &&
                            uniqueArray[0].dateOfOrder <= to){
                                if(transferOrPostingEmployeesList.toPostingInCategoryCode){
                                    console.log('yes toposting avail')
                                    if(transferOrPostingEmployeesList.toPostingInCategoryCode == input.postingIn)
                                    {
                                        console.log('yes posting matched')
                                        resultData.push(dataAll);
                                    }
                                }
                            }
                            }
                        }
                        else if(by == 'name' || by == 'batch' || by == 'naBa'){
                            console.log('dataAll => ', dataAll);
                            resultData.push(dataAll);
                        }
                        //else 
                            //resultData = [];
                    }
                }
                
            }
            else{
                console.log('len else ', uniqueArray.length);
            }
            /*else{
                resultData.push(employee);
                console.log('employee => ', employee);
            }  */
        }
        console.log('Unique by latest date of order: 2', uniqueArray);
        let resData = {
            empCount : resultData.length,
            empList: resultData
        }
        console.log('resDate =====> ', resData);
        return resData;
    }
    catch (error) {
        console.log('error', error);
        return [];
        }
}

// Get Employee with search option
exports.getEmployeeSearchOfficer = async (req, res) => {
    console.log('helo from getEmployeeSearch controller', req.query);
    try {
            let result = [];
            const count = Object.keys(req.body).length;
            console.log(`Number of parameters: ${count}`);
            if(count == 0){
                successRes(res, result, 'No employee matched');
            }
            else if(count == 1){
                result = await this.oneParameterOfficer(req.body);
                console.log('getEmployeeSearch', result)
                successRes(res, result, 'Employee listed -> one param Successfully');
            }
            else if(count == 2){
                result = await this.twoParameterOfficer(req.body);
                console.log('getEmployeeSearch', result)
                successRes(res, result, 'Employee listed -> 2 params Successfully');
            }
            else if(count == 3){
                result = await this.threeParameterOfficer(req.body);
                console.log('getEmployeeSearch', result)
                successRes(res, result, 'Employee listed -> 3 params Successfully');
            }
            else if(count == 4){
                result = await this.fourParameterOfficer(req.body);
                console.log('getEmployeeSearch', result)
                successRes(res, result, 'Employee listed -> 4 params Successfully');
            }
            else if(count == 5){
                result = await this.fiveParameterOfficer(req.body);
                console.log('getEmployeeSearch', result)
                successRes(res, result, 'Employee listed -> 5 params Successfully');
            }
            //successRes(res, count, 'Employee profile with history listed Successfully');
        } 
        catch (error) {
        console.log('error', error);
        errorRes(res, error, "Error on listing employee profile with history");
        }
}

exports.oneParameterOfficer = async(input) => {
    console.log('inside oneParameter function', input);
    let result;
    if(input.name){
        console.log('name present');
        result = await this.byProfileOfficer(input, "name");
        console.log('oneParameter name ', result);
        return result;
    }
    else if(input.batch){
        console.log('batch present');
        result = await this.byProfileOfficer(input, "batch");
        console.log('oneParameter batch ', result);
        return result;
    }
    else if(input.department){
        console.log('department present');
        result = await this.byProfileOfficer(input, "department");
        console.log('oneParameter department ', result);
        return result;
    }
    else if(input.postingIn){
        console.log('postingIn present');
        result = await this.byProfileOfficer(input, "postingIn");
        console.log('oneParameter posting ', result);
        return result;
    }
    else if(input.designation){
        console.log('designation present');
        result = await this.byProfileOfficer(input, "designation");
        console.log('oneParameter designation ', result);
        return result;
    }
    let oneResult = [];
    return oneResult;
}

exports.twoParameterOfficer = async(input) => {
    console.log('inside twoParameter function', input);
    let result;
    if(input.name && input.batch && !input.department && !input.designation && !input.postingIn){
        console.log('name and batch present');
        result = await this.byProfileOfficer(input, "naBa");
        console.log('twoParameter name batch', result);
        return result;
    }
    else if(input.name && !input.batch && input.department && !input.designation && !input.postingIn){
        console.log('name department present');
        result = await this.byProfileOfficer(input, "naDe");
        console.log('twoParameter name department', result);
        return result;
    }
    else if(input.name && !input.batch && !input.department && input.designation && !input.postingIn){
        console.log('name designation present');
        result = await this.byProfileOfficer(input, "naDes");
        console.log('twoParameter name designation', result);
        return result;
    }
    else if(input.name && !input.batch && !input.department && !input.designation && input.postingIn){
        console.log('name postingIn present');
        result = await this.byProfileOfficer(input, "naPo");
        console.log('twoParameter name postingIn', result);
        return result;
    }
    else if(!input.name && input.batch && input.department && !input.designation && !input.postingIn){
        console.log('batch department present');
        result = await this.byProfileOfficer(input, "baDe");
        console.log('twoParameter batch department', result);
        return result;
    }
    else if(!input.name && input.batch && !input.department && input.designation && !input.postingIn){
        console.log('batch period present');
        result = await this.byProfileOfficer(input, "baPe");
        console.log('twoParameter batch period', result);
        return result;
    }
    else if(!input.name && input.batch && !input.department && !input.designation && input.postingIn){
        console.log('batch postingIn present');
        result = await this.byProfileOfficer(input, "baPo");
        console.log('twoParameter postingIn department', result);
        return result;
    }
    else if(!input.name && !input.batch && input.department && input.designation && !input.postingIn){
        console.log('department designation present');
        result = await this.byProfileOfficer(input, "deDes");
        console.log('twoParameter department designation', result);
        return result;
    }
    else if(!input.name && !input.batch && input.department && !input.designation && input.postingIn){
        console.log('department postingIn present');
        result = await this.byProfileOfficer(input, "dePo");
        console.log('twoParameter department postingIn', result);
        return result;
    }
    else if(!input.name && !input.batch && !input.department && input.designation && input.postingIn){
        console.log('designation postingIn present');
        result = await this.byProfileOfficer(input, "desPo");
        console.log('twoParameter designation postingIn', result);
        return result;
    }
    else {
        let oneResult = [];
        return oneResult;
    }
}

exports.threeParameterOfficer = async(input) => {
    console.log('inside 3Parameter function', input);
    let result;
    if(input.name && input.batch && input.department && !input.designation && !input.postingIn){
        console.log('name batch department present');
        result = await this.byProfileOfficer(input, "naBaDe");
        console.log('threeParameter name batch department', result);
        return result;
    }
    else if(input.name && input.batch && !input.department && input.designation && !input.postingIn){
        console.log('name batch designation present');
        result = await this.byProfileOfficer(input, "naBaDes");
        console.log('threeParameter name batch designation', result);
        return result;
    }
    else if(input.name && input.batch && !input.department && !input.designation && input.postingIn){
        console.log('name batch postingIn present');
        result = await this.byProfileOfficer(input, "naBaPo");
        console.log('threeParameter name batch postingIn', result);
        return result;
    }
    else if(input.name && !input.batch && input.department && input.designation && !input.postingIn){
        console.log('name department designation present');
        result = await this.byProfileOfficer(input, "naDeDes");
        console.log('threeParameter name department designation', result);
        return result;
    }
    else if(input.name && !input.batch && input.department && !input.designation && input.postingIn){
        console.log('name department postingIn present');
        result = await this.byProfileOfficer(input, "naDePo");
        console.log('threeParameter name department postingIn', result);
        return result;
    }
    else if(input.name && !input.batch && !input.department && input.designation && input.postingIn){
        console.log('name period postingIn present');
        result = await this.byProfileOfficer(input, "naPePo");
        console.log('threeParameter name period postingIn', result);
        return result;
    }
    else if(!input.name && input.batch && input.department && input.designation && !input.postingIn){
        console.log('batch department designation present');
        result = await this.byProfileOfficer(input, "baDeDes");
        console.log('threeParameter batch department designation', result);
        return result;
    }
    else if(!input.name && input.batch && input.department && !input.designation && input.postingIn){
        console.log('batch department postingIn present');
        result = await this.byProfileOfficer(input, "baDePo");
        console.log('threeParameter batch department postingIn', result);
        return result;
    }
    else if(!input.name && input.batch && !input.department && input.designation && input.postingIn){
        console.log('batch designation postingIn present');
        result = await this.byProfileOfficer(input, "baDesPo");
        console.log('threeParameter batch designation postingIn', result);
        return result;
    }
    else if(!input.name && !input.batch && input.department && input.designation && input.postingIn){
        console.log('department designation postingIn present');
        result = await this.byProfileOfficer(input, "deDesPo");
        console.log('threeParameter department designation postingIn', result);
        return result;
    }
    else {
        let oneResult = [];
        return oneResult;
    }
}

exports.fourParameterOfficer = async(input) => {
    console.log('inside 4Parameter function', input);
    let result;
    if(input.name && input.batch && input.department && input.designation && !input.postingIn){
        result = await this.byProfileOfficer(input, "naBaDeDes");
        console.log('4Parameter name batch department designation', result);
        return result;
    }
    else if(input.name && input.batch && input.department && !input.designation && input.postingIn){
        result = await this.byProfileOfficer(input, "naBaDePo");
        console.log('4Parameter name batch department postingIn', result);
        return result;
    }
    else if(input.name && input.batch && !input.department && input.designation && input.postingIn){
        result = await this.byProfileOfficer(input, "naBaDesPo");
        console.log('4Parameter name batch designation postingIn', result);
        return result;
    }
    else if(input.name && !input.batch && input.department && input.designation && input.postingIn){
        result = await this.byProfileOfficer(input, "naDeDesPo");
        console.log('4Parameter name department designation postingIn', result);
        return result;
    }
    else if(!input.name && input.batch && input.department && input.designation && input.postingIn){
        result = await this.byProfileOfficer(input, "baDeDesPo");
        console.log('4Parameter batch department designation postingIn', result);
        return result;
    }
    else {
        let oneResult = [];
        return oneResult;
    }
}

exports.fiveParameterOfficer = async(input) => {
    console.log('inside fiveParameter function', input);
    let resultFive = await this.byProfileOfficer(input, "all");
    console.log('fiveParameter batch ', resultFive);
    return resultFive;
}

exports.byProfileOfficer = async(input, by) =>{
    try{
        //let batch = input;
        let updateQueryJson;
        console.log('input => ', input+' by => ', by);
        let getQueryJson;
        ////, , , , 
        let uniqueArray = [];
        let resultData = [];
        if(by == "name" || by == 'naDePe' || by == 'naDePo' || by == 'naPePo' || by == 'naDePePo'){
            getQueryJson = {
                fullName: input.name
            } 
        }
        else if(by == "batch" || by == 'baDe' || by == 'baDes' || by == "baPo" ||
        by == 'baDeDes' || by == 'baDePo' || by == 'baDesPo' || by == 'baDeDesPo'){
            getQueryJson = {
                batch: input.batch
            } 
        }
        else if(by == 'all' || by == 'naBa' || by == 'naBaDe' || by == 'naBaDes' || by == 'naBaPo' || 
        by == 'naBaDeDes' || by == 'naBaDePo' || by == 'naBaDesPo'){
            getQueryJson = {
                fullName: input.name,
                batch: input.batch
            } 
        }
        /*else if(by == 'naBa'){
            getQueryJson = {
                fullName: input.name,
                batch: input.batch
            }
        }*/
        else if(by == 'naDe' || by == 'naDes' || by == "naPo"){
            console.log('yes dept/ des => ');
            getQueryJson = {
                fullName: input.name
            }
        }

        console.log(getQueryJson);
        if(by == "name" || by == "batch" || by == "all" || 
        by == "naBa" || by == "naDe" || by == "naDes" || by == "naPo" || 
        by == 'baDe' || by == 'baDes' || by == "baPo" || 
        by == 'naBaDe' || by == 'naBaDes' || by == 'naBaPo' || 
        by == 'naDeDes' || by == 'naDePo' || 
        by == 'naDesPo' ||
        by == 'baDeDes' || by == 'baDePo' || by == 'baDesPo' || 
        by == 'naBaDeDes' || by == 'naBaDePo' || by == 'naBaDesPo' || 
        by == 'naDeDesPo' || by == 'baDeDesPo')
            data = await employeeProfile.find(getQueryJson).sort({ dateOfJoining: 'asc' }).exec();
        else if(by == "department" || by == "designation" || by == "postingIn"
        || by == 'deDes' || by == 'dePo' || by == 'desPo' || by == 'deDesPo')
            data = await employeeProfile.find().sort({ dateOfJoining: 'asc' }).exec();
            
        for(let employee of data){
            console.log('for data => ', employee);
            updateQueryJson = {
                empId: employee._id
            }
            uniqueArray = await this.getEmployeeUpdateFilter(updateQueryJson);
            console.log('length ==> ', uniqueArray.length);
            if(uniqueArray.length > 0){
                console.log('len ', uniqueArray.length);
                for(let transferOrPostingEmployeesList of uniqueArray[0].transferOrPostingEmployeesList){
                    console.log('Check ', transferOrPostingEmployeesList.empProfileId._id.toString(), employee._id.toString());
                    if(transferOrPostingEmployeesList.empProfileId._id.toString() === employee._id.toString()){
                        console.log('Matched ');
                        let dataAll = {
                            toPostingInCategoryCode: transferOrPostingEmployeesList.toPostingInCategoryCode,
                            toDepartmentId: transferOrPostingEmployeesList.toDepartmentId,
                            toDesignationId: transferOrPostingEmployeesList.toDesignationId,
                            postTypeCategoryCode: transferOrPostingEmployeesList.postTypeCategoryCode,
                            locationChangeCategoryId: transferOrPostingEmployeesList.locationChangeCategoryId,
                            remarks: uniqueArray[0].remarks,
                            updateType: uniqueArray[0].updateType,
                            orderTypeCategoryCode: uniqueArray[0].orderTypeCategoryCode,
                            orderNumber: uniqueArray[0].orderNumber,
                            orderForCategoryCode: uniqueArray[0].orderForCategoryCode,
                            dateOfOrder: uniqueArray[0].dateOfOrder,
                            personalEmail: employee.personalEmail,
                            _id: employee._id,
                            fullName: employee.fullName,
                            gender: employee.gender,
                            dateOfBirth: employee.dateOfBirth,
                            dateOfJoining: employee.dateOfJoining,
                            dateOfRetirement: employee.dateOfRetirement,
                            state: employee.state,
                            batch: employee.batch,
                            recruitmentType: employee.recruitmentType,
                            serviceStatus: employee.serviceStatus,
                            qualification1: employee.qualification1,
                            qualification2: employee.qualification2,
                            community: employee.community,
                            degreeData: employee.degreeData,
                            caste: employee.caste,
                            religion: employee.religion,
                            promotionGrade: employee.promotionGrade,
                            payscale: employee.payscale,
                            officeEmail: employee.officeEmail,
                            mobileNo1: employee.mobileNo1,
                            mobileNo2: employee.mobileNo2,
                            mobileNo3: employee.mobileNo3,
                            addressLine: employee.addressLine,
                            city: employee.city,
                            pincode: employee.pincode,
                            employeeId: employee.employeeId,
                            ifhrmsId: employee.ifhrmsId,
                            //photo: employee.photo,
                            imagePath: employee.imagePath,
                        }
                        if(by == 'department' || by == 'naDe' || by == "baDe" || by == 'naBaDe'){
                            console.log('yes dept ');
                            if(transferOrPostingEmployeesList.toDepartmentId == input.department){
                                resultData.push(dataAll);
                            }
                        }
                        if( by == "designation" || by == 'naDes' || by == 'baDes' || by == 'naBaDes'){
                            console.log('yes designation ');
                            if(transferOrPostingEmployeesList.toDesignationId == input.designation){
                                resultData.push(dataAll);
                            }
                        }
                        if(by == 'postingIn' || by == 'naPo' || by == "baPo" || by == 'naBaPo'){
                            console.log('yes posting ');
                            if(transferOrPostingEmployeesList.toPostingInCategoryCode){
                                {console.log('yes toposting avail')
                                if(transferOrPostingEmployeesList.toPostingInCategoryCode == input.postingIn)
                                    {
                                        console.log('yes posting matched')
                                        resultData.push(dataAll);
                                    }
                            }
                            }
                        }
                        else if(by == 'deDes' || by == 'naDeDes' || by == 'baDeDes' || by == 'naBaDeDes'){
                            console.log('yes designation ');
                            if(transferOrPostingEmployeesList.toDepartmentId == input.department){
                                if(transferOrPostingEmployeesList.toDesignationId == input.designation){
                                    resultData.push(dataAll);
                                }
                            }
                        }
                        else if(by == 'dePo' || by == 'naDePo' || by == 'baDePo' || by == 'naBaDePo'){
                            if(transferOrPostingEmployeesList.toDepartmentId == input.department){
                                if(transferOrPostingEmployeesList.toPostingInCategoryCode){
                                    console.log('yes toposting avail')
                                    if(transferOrPostingEmployeesList.toPostingInCategoryCode == input.postingIn)
                                    {
                                        console.log('yes posting matched')
                                        resultData.push(dataAll);
                                    }
                                }
                            }
                        }
                        else if(by == 'desPo' || by == 'naDesPo' || by == 'baDesPo' || by == 'naBaDesPo'){
                            console.log('yes designation ');
                            if(transferOrPostingEmployeesList.toDesignationId == input.designation){
                                if(transferOrPostingEmployeesList.toPostingInCategoryCode){
                                    console.log('yes toposting avail')
                                    if(transferOrPostingEmployeesList.toPostingInCategoryCode == input.postingIn)
                                    {
                                        console.log('yes posting matched')
                                        resultData.push(dataAll);
                                    }
                                }
                            }
                        }
                        else if(by == "all" || by == 'deDesPo' || by == 'naDeDesPo' || by == 'baDeDesPo'){
                            if(transferOrPostingEmployeesList.toDepartmentId == input.department){
                            if(transferOrPostingEmployeesList.toDesignationId == input.designation){
                                if(transferOrPostingEmployeesList.toPostingInCategoryCode){
                                    console.log('yes toposting avail')
                                    if(transferOrPostingEmployeesList.toPostingInCategoryCode == input.postingIn)
                                    {
                                        console.log('yes posting matched')
                                        resultData.push(dataAll);
                                    }
                                }
                            }
                            }
                        }
                        else if(by == 'name' || by == 'batch' || by == 'naBa'){
                            console.log('dataAll => ', dataAll);
                            resultData.push(dataAll);
                        }
                        //else 
                            //resultData = [];
                    }
                }
                
            }
            else{
                console.log('len else ', uniqueArray.length);
            }
            /*else{
                resultData.push(employee);
                console.log('employee => ', employee);
            }  */
        }
        console.log('Unique by latest date of order: 2', uniqueArray);
        let resData = {
            empCount : resultData.length,
            empList: resultData
        }
        console.log('resDate =====> ', resData);
        return resData;
    }
    catch (error) {
        console.log('error', error);
        return [];
        }
}

exports.getEmployeeUpdateFilter = async(input) => {
    //console.log('inside getEmployeeUpdate function', input)
    let secretariatDetails;
    // secretariatDetails =  await employeeUpdate.find({
    //     empProfileId: input.empId
    // })
    // const uniqueNamesByLatestDateOfOrder = secretariatDetails
    //   .sort((a, b) => new Date(b.dateOfOrder) - new Date(a.dateOfOrder)) // Sort by latest date first
    //   .reduce((acc, curr) => {
    //     if (!acc[curr.empProfileId]) { // Check if name already exists in accumulator
    //       acc[curr.empProfileId] = curr; // If not, add the current item
    //     }
    //     return acc;
    //   }, {});
    
    // const uniqueArray = Object.values(uniqueNamesByLatestDateOfOrder);
    // console.log('Unique by latest date of order:', uniqueArray);
    // return uniqueArray;

    const dataResArray  = await employeeUpdate.find({
        'transferOrPostingEmployeesList.empProfileId': input.empId,
        'updateType': 'Transfer / Posting'
    })
    .populate({
        path: 'transferOrPostingEmployeesList.empProfileId',
        model: 'employeeProfile', // Ensure the model name matches exactly
        select: 'orderNumber' // Specify the fields you want to include from EmployeeProfile
    })
    .sort({ dateOfOrder: -1 }) // Sort by dateOfOrder in descending order (-1)
    .exec();
    // console.log('dataResArray ==> ', dataResArray);
    // console.log('Unique by latest date of order:', dataResArray);
    return dataResArray;
}

// Get EmployeeCurrentPosting
exports.getEmployeeCurrentPosting = async (req, res) => {
    console.log('helo from getEmployeeCurrentPosting', req.query);
    try {
        let query = {};
        if(req.query)
            query = req.query;
        let queryUpdate = {};
        let data;
        let dataUpdate;
        let resJson = {};
        let resArray = [];
        data = await employeeProfile.find(query).exec();
        console.log('data ', data);
            for(let employee of data){
                queryUpdate = {
                    empProfileId: employee._id
                }
                resJson = {
                    "personalEmail": employee.personalEmail,
                    "_id": employee._id,
                    "fullName": employee.fullName,
                }
                data.update = queryUpdate;
                const dataResArray  = await employeeUpdate.find({
                    'transferOrPostingEmployeesList.empProfileId': employee._id,
                    'updateType': 'Transfer / Posting'
                })
                .populate({
                    path: 'transferOrPostingEmployeesList.empProfileId',
                    model: 'employeeProfile', // Ensure the model name matches exactly
                    select: 'orderNumber' // Specify the fields you want to include from EmployeeProfile
                })
                .sort({ dateOfOrder: -1 }) // Sort by dateOfOrder in descending order (-1)
                .exec();
                console.log(dataResArray);
                let dataArra = [];
                const employeeId = employee._id.toString();
                if (dataResArray && dataResArray.length > 0) {
                    dataResArray.forEach(dataRes => {
                        console.log('dataResArray.dateOfOrder ', dataRes.dateOfOrder);
                        let json = {
                            _id: dataRes._id,
                            updateType: dataRes.updateType,
                            orderTypeCategoryCode: dataRes.orderTypeCategoryCode,
                            orderNumber: dataRes.orderNumber,
                            orderForCategoryCode: dataRes.orderForCategoryCode,
                            dateOfOrder: dataRes.dateOfOrder,
                            remarks: dataRes.remarks,
                            orderFile: dataRes.orderFile,
                        }
                        if (dataRes.transferOrPostingEmployeesList.length > 0) {
                            const matchedItem = dataRes.transferOrPostingEmployeesList.find(item => 
                                item.empProfileId._id.toString() === employeeId
                            );
                
                            if (matchedItem) {
                                const matchedEmpProfileId = {
                                    _id: matchedItem.empProfileId._id,
                                    orderNumber: matchedItem.empProfileId.orderNumber
                                };
                                json.transferOrPostingEmployeesList = matchedItem;
                                dataArra.push(json);
                                
                            } else {
                                console.log('No matching empProfileId object found in transferOrPostingEmployeesList');
                            }
                        } else {
                            console.log('transferOrPostingEmployeesList is empty for this document');
                        }
                    });
                } else {
                    console.log('No matching data found in employeeUpdate');
                }
                resJson.employeeHistory = dataArra[0];
                resArray.push(resJson);
            }

        successRes(res, resArray, 'Employee profile with history listed Successfully');
    } catch (error) {
        console.log('error', error);
        errorRes(res, error, "Error on listing employee profile with history");
    }
}

exports.getEmployeeAdvancedSearch = async (req, res) => {
    console.log('helo from getEmployeeAdvancedSearch controller', req.query);
    try {
            let result = [];
            const count = Object.keys(req.body).length;
            console.log(`Number of parameters: ${count}`);
            if(count == 0){
                successRes(res, result, 'No employee matched');
            }
            else if(count == 1){
                result = await this.oneParameterAdvanced(req.body);
                console.log('getEmployeeAdvancedSearch', result)
                successRes(res, result, 'Employee listed -> one param Successfully');
            }
            else if(count == 2){
                result = await this.twoParameterAdvanced(req.body);
                console.log('getEmployeeAdvancedSearch', result)
                successRes(res, result, 'Employee listed -> 2 params Successfully');
            }
            else if(count == 3){
                result = await this.threeParameterAdvanced(req.body);
                console.log('getEmployeeAdvancedSearch ', result)
                successRes(res, result, 'Employee listed -> 3 params Successfully');
            }
            else if(count == 4){
                result = await this.fourParameterAdvanced(req.body);
                console.log('getEmployeeAdvancedSearch ', result)
                successRes(res, result, 'Employee listed -> 4 params Successfully');
            }
            else if(count == 5){
                result = await this.fiveParameterAdvanced(req.body);
                console.log('getEmployeeAdvancedSearch ', result)
                successRes(res, result, 'Employee listed -> 5 params Successfully');
            }
            else if(count == 6){
                result = await this.sixParameterAdvanced(req.body);
                console.log('getEmployeeAdvancedSearch ', result)
                successRes(res, result, 'Employee listed -> 6 params Successfully');
            } 
            else if(count == 9){
                result = await this.nineParameterAdvanced(req.body);
                console.log('getEmployeeAdvancedSearch ', result)
                successRes(res, result, 'Employee listed -> 9 params Successfully');
            } 
            else if(count == 10){
                result = await this.tenParameterAdvanced(req.body);
                console.log('getEmployeeAdvancedSearch ', result)
                successRes(res, result, 'Employee listed -> 10 params Successfully');
            }
        } 
        catch (error) {
        console.log('error', error);
        errorRes(res, error, "Error on listing employee profile with history");
        }
}

exports.sixParameterAdvanced = async(input) => {
    console.log('inside sixParameterAdvanced function', input); 
}

exports.oneParameterAdvanced = async(input) => {
    console.log('inside oneParameterAdvanced function', input);
    let result;
    if(input.dateOfBirth){
        console.log('dateOfBirth present');
        result = await this.byProfileAdvanced(input, "dateOfBirth");
        console.log('oneParameter dateOfBirth ', result);
        return result;
    }
    else if(input.state){
        console.log('state present');
        result = await this.byProfileAdvanced(input, "state");
        console.log('oneParameter state ', result);
        return result;
    }
    else if(input.community){
        console.log('community present');
        result = await this.byProfileAdvanced(input, "community");
        console.log('oneParameter community ', result);
        return result;
    }
    else if(input.degree){
        console.log('degree present');
        result = await this.byProfileAdvanced(input, "degree");
        console.log('oneParameter degree ', result);
        return result;
    }
    else if(input.dateOfJoining){
        console.log('dateOfJoining present');
        result = await this.byProfileAdvanced(input, "dateOfJoining");
        console.log('oneParameter dateOfJoining ', result);
        return result;
    }
    else if(input.dateOfRetirement){
        console.log('dateOfRetirement present');
        result = await this.byProfileAdvanced(input, "dateOfRetirement");
        console.log('oneParameter dateOfRetirement ', result);
        return result;
    }
    else if(input.recruitmentType){
        console.log('recruitmentType present');
        result = await this.byProfileAdvanced(input, "recruitmentType");
        console.log('oneParameter recruitmentType ', result);
        return result;
    }
    else if(input.postingIn){
        console.log('postingIn present');
        result = await this.byProfileAdvanced(input, "postingIn");
        console.log('oneParameter posting ', result);
        return result;
    }
    else if(input.department){
        console.log('department present');
        result = await this.byProfileAdvanced(input, "department");
        console.log('oneParameter department ', result);
        return result;
    }
    else if(input.designation){
        console.log('designation present');
        result = await this.byProfileAdvanced(input, "designation");
        console.log('oneParameter designation ', result);
        return result;
    }
    // let oneResult = [];
    // return oneResult;
}

exports.twoParameterAdvanced = async(input) => {
    console.log('inside twoParameterAdvanced function', input);
    let result;
    if(input.dateOfBirth && input.state 
        && !input.community && !input.degree && !input.dateOfJoining && !input.dateOfRetirement
        && !input.recruitmentType && !input.postingIn && !input.department && !input.designation){
        console.log('dateOfBirth, state present');
        result = await this.byProfileAdvanced(input, "dobSta");
        console.log('twoParameter dateOfBirth, state ', result);
        return result;
    }
    else if(input.dateOfBirth && input.community
        && !input.state && !input.degree && !input.dateOfJoining && !input.dateOfRetirement
        && !input.recruitmentType && !input.postingIn && !input.department && !input.designation
    ){
        console.log('dateOfBirth, community present');
        result = await this.byProfileAdvanced(input, "dobCom");
        console.log('twoParameter dateOfBirth, community ', result);
        return result;
    }
    else if(input.dateOfBirth && input.degree
        && !input.community && !input.state && !input.dateOfJoining && !input.dateOfRetirement
        && !input.recruitmentType && !input.postingIn && !input.department && !input.designation
    ){
        console.log('dateOfBirth, degree present');
        result = await this.byProfileAdvanced(input, "dobDeg");
        console.log('twoParameter dateOfBirth, degree ', result);
        return result;
    }
    else if(input.dateOfBirth && input.dateOfJoining
        && !input.degree && !input.community && !input.state && !input.dateOfRetirement
        && !input.recruitmentType && !input.postingIn && !input.department && !input.designation
    ){
        console.log('dateOfBirth, dateOfJoining present');
        result = await this.byProfileAdvanced(input, "dobDoj");
        console.log('twoParameter dateOfBirth, dateOfJoining ', result);
        return result;
    }
    else if(input.dateOfBirth && input.dateOfRetirement
        && !input.degree && !input.community && !input.state && !input.dateOfJoining
        && !input.recruitmentType && !input.postingIn && !input.department && !input.designation
    ){
        console.log('dateOfBirth, dateOfRetirement present');
        result = await this.byProfileAdvanced(input, "dobDor");
        console.log('twoParameter dateOfBirth, dateOfRetirement ', result);
        return result;
    }
    else if(input.dateOfBirth && input.recruitmentType
        && !input.degree && !input.community && !input.state && !input.dateOfJoining
        && !input.dateOfRetirement && !input.postingIn && !input.department && !input.designation
    ){
        console.log('dateOfBirth, recruitmentType present');
        result = await this.byProfileAdvanced(input, "dobRec");
        console.log('twoParameter dateOfBirth, recruitmentType ', result);
        return result;
    }

    else if(input.dateOfBirth && input.postingIn
        && !input.recruitmentType && !input.degree && !input.community && !input.state 
        && !input.dateOfJoining && !input.dateOfRetirement && !input.department && !input.designation
    ){
        console.log('dateOfBirth, postingIn present');
        result = await this.byProfileAdvanced(input, "dobPos");
        console.log('twoParameter dateOfBirth, postingIn ', result);
        return result;
    }
    else if(input.dateOfBirth && input.department
        && !input.postingIn && !input.recruitmentType && !input.degree && !input.community  
        && !input.state && !input.dateOfJoining && !input.dateOfRetirement && !input.designation
    ){
        console.log('dateOfBirth, department present');
        result = await this.byProfileAdvanced(input, "dobDep");
        console.log('twoParameter dateOfBirth, department ', result);
        return result;
    }
    else if(input.dateOfBirth && input.designation
        && !input.department && !input.postingIn && !input.recruitmentType && !input.degree 
        && !input.community  && !input.state && !input.dateOfJoining && !input.dateOfRetirement
    ){
        console.log('dateOfBirth, designation present');
        result = await this.byProfileAdvanced(input, "dobDes");
        console.log('twoParameter dateOfBirth, designation ', result);
        return result;
    }
    /////
    else if(input.state && input.community
        && !input.dateOfBirth && !input.designation && !input.department && !input.postingIn 
        && !input.recruitmentType && !input.degree && !input.dateOfJoining && !input.dateOfRetirement
    ){
        console.log('state, community present');
        result = await this.byProfileAdvanced(input, "staCom");
        console.log('twoParameter state, community ', result);
        return result;
    }
    else if(input.state && input.degree
        && !input.community && !input.dateOfBirth && !input.designation && !input.department 
        && !input.postingIn && !input.recruitmentType && !input.dateOfJoining && !input.dateOfRetirement
    ){
        console.log('state, degree present');
        result = await this.byProfileAdvanced(input, "staDeg");
        console.log('twoParameter state, degree ', result);
        return result;
    }
    else if(input.state && input.dateOfJoining
        && !input.degree && !input.community && !input.dateOfBirth && !input.designation 
        && !input.department && !input.postingIn && !input.recruitmentType && !input.dateOfRetirement
    ){
        console.log('state, dateOfJoining present');
        result = await this.byProfileAdvanced(input, "staDoj");
        console.log('twoParameter state, dateOfJoining ', result);
        return result;
    }

    else if(input.state && input.dateOfRetirement
        && input.dateOfJoining && !input.degree && !input.community && !input.dateOfBirth 
        && !input.designation && !input.department && !input.postingIn && !input.recruitmentType
    ){
        console.log('state, dateOfRetirement present');
        result = await this.byProfileAdvanced(input, "staDor");
        console.log('twoParameter state, dateOfRetirement ', result);
        return result;
    }
    else if(input.state && input.recruitmentType
        && !input.dateOfJoining
        && !input.degree && !input.community && !input.dateOfBirth && !input.designation 
        && !input.department && !input.postingIn && !input.dateOfRetirement
    ){
        console.log('state, recruitmentType present');
        result = await this.byProfileAdvanced(input, "staRec");
        console.log('twoParameter state, recruitmentType ', result);
        return result;
    }
    else if(input.state && input.postingIn
        && !input.dateOfJoining
        && !input.degree && !input.community && !input.dateOfBirth && !input.designation 
        && !input.department && !input.recruitmentType && !input.dateOfRetirement
    ){
        console.log('state, postingIn present');
        result = await this.byProfileAdvanced(input, "staPos");
        console.log('twoParameter state, postingIn ', result);
        return result;
    }
    else if(input.state && input.department
        && !input.dateOfJoining
        && !input.degree && !input.community && !input.dateOfBirth && !input.designation 
        && !input.postingIn && !input.recruitmentType && !input.dateOfRetirement
    ){
        console.log('state, department present');
        result = await this.byProfileAdvanced(input, "staDep");
        console.log('twoParameter state, department ', result);
        return result;
    }
 
    else if(input.state && input.designation
        && !input.dateOfJoining
        && !input.degree && !input.community && !input.dateOfBirth 
        && !input.department && !input.postingIn && !input.recruitmentType && !input.dateOfRetirement
    ){
        console.log('state, designation present');
        result = await this.byProfileAdvanced(input, "staDes");
        console.log('twoParameter state, designation ', result);
        return result;
    }
    ////
    else if(input.community && input.degree
        && !input.state && !input.dateOfJoining
        && !input.dateOfBirth && !input.designation 
        && !input.department && !input.postingIn && !input.recruitmentType && !input.dateOfRetirement
    ){
        console.log('community, degree present');
        result = await this.byProfileAdvanced(input, "comDeg");
        console.log('twoParameter community, degree ', result);
        return result;
    }
    else if(input.community && input.dateOfJoining
        && !input.state
        && !input.degree && !input.dateOfBirth && !input.designation 
        && !input.department && !input.postingIn && !input.recruitmentType && !input.dateOfRetirement
    ){
        console.log('community, dateOfJoining present');
        result = await this.byProfileAdvanced(input, "comDoj");
        console.log('twoParameter community, dateOfJoining ', result);
        return result;
    }
    else if(input.community && input.dateOfRetirement
        && !input.state && !input.dateOfJoining
        && !input.degree && !input.dateOfBirth && !input.designation 
        && !input.department && !input.postingIn && !input.recruitmentType
    ){
        console.log('community, dateOfRetirement present');
        result = await this.byProfileAdvanced(input, "comDor");
        console.log('twoParameter community, dateOfRetirement ', result);
        return result;
    }
    else if(input.community && input.recruitmentType
        && !input.state && !input.dateOfJoining
        && !input.degree && !input.dateOfBirth && !input.designation 
        && !input.department && !input.postingIn && !input.dateOfRetirement
    ){
        console.log('community, recruitmentType present');
        result = await this.byProfileAdvanced(input, "comRec");
        console.log('twoParameter community, recruitmentType ', result);
        return result;
    }
    else if(input.community && input.postingIn
        && !input.state && !input.dateOfJoining
        && !input.degree && !input.dateOfBirth && !input.designation 
        && !input.department && !input.recruitmentType && !input.dateOfRetirement
    ){
        console.log('community, postingIn present');
        result = await this.byProfileAdvanced(input, "comPos");
        console.log('twoParameter community, postingIn ', result);
        return result;
    }

    else if(input.community && input.department
        && !input.state && !input.dateOfJoining
        && !input.degree && !input.dateOfBirth && !input.designation 
        && !input.postingIn && !input.recruitmentType && !input.dateOfRetirement
    ){
        console.log('community, department present');
        result = await this.byProfileAdvanced(input, "comDep");
        console.log('twoParameter community, department ', result);
        return result;
    }
    else if(input.community && input.designation
        && !input.state && !input.dateOfJoining
        && !input.degree && !input.dateOfBirth 
        && !input.department && !input.postingIn && !input.recruitmentType && !input.dateOfRetirement
    ){
        console.log('community, designation present');
        result = await this.byProfileAdvanced(input, "comDes");
        console.log('twoParameter community, designation ', result);
        return result;
    }

    ////
    else if(input.degree && input.dateOfJoining
        && !input.state
        && !input.community && !input.dateOfBirth && !input.designation 
        && !input.department && !input.postingIn && !input.recruitmentType && !input.dateOfRetirement
    ){
        console.log('degree, dateOfJoining present');
        result = await this.byProfileAdvanced(input, "degDoj");
        console.log('twoParameter degree, dateOfJoining ', result);
        return result;
    }
    else if(input.degree && input.dateOfRetirement
        && !input.state && !input.dateOfJoining
        && !input.community && !input.dateOfBirth && !input.designation 
        && !input.department && !input.postingIn && !input.recruitmentType
    ){
        console.log('degree, dateOfRetirement present');
        result = await this.byProfileAdvanced(input, "degDor");
        console.log('twoParameter degree, dateOfRetirement ', result);
        return result;
    }
    else if(input.degree && input.recruitmentType
        && !input.state && !input.dateOfJoining
        && !input.community && !input.dateOfBirth && !input.designation 
        && !input.department && !input.postingIn && !input.dateOfRetirement
    ){
        console.log('degree, recruitmentType present');
        result = await this.byProfileAdvanced(input, "degRec");
        console.log('twoParameter degree, recruitmentType ', result);
        return result;
    }
    else if(input.degree && input.postingIn
        && !input.state && !input.dateOfJoining
        && !input.community && !input.dateOfBirth && !input.designation 
        && !input.department && !input.recruitmentType && !input.dateOfRetirement
    ){
        console.log('degree, postingIn present');
        result = await this.byProfileAdvanced(input, "degPos");
        console.log('twoParameter degree, postingIn ', result);
        return result;
    }
    else if(input.degree && input.department
        && !input.state && !input.dateOfJoining
        && !input.community && !input.dateOfBirth && !input.designation 
        && !input.postingIn && !input.recruitmentType && !input.dateOfRetirement
    ){
        console.log('degree, department present');
        result = await this.byProfileAdvanced(input, "degDep");
        console.log('twoParameter degree, department ', result);
        return result;
    }
    else if(input.degree && input.designation
        && !input.state && !input.dateOfJoining
        && !input.community && !input.dateOfBirth 
        && !input.department && !input.postingIn && !input.recruitmentType && !input.dateOfRetirement
    ){
        console.log('degree, designation present');
        result = await this.byProfileAdvanced(input, "degDes");
        console.log('twoParameter degree, designation ', result);
        return result;
    }

    //////
    else if(input.dateOfJoining && input.dateOfRetirement
        && !input.state
        && !input.degree && !input.community && !input.dateOfBirth && !input.designation 
        && !input.department && !input.postingIn && !input.recruitmentType
    ){
        console.log('dateOfJoining, dateOfRetirement present');
        result = await this.byProfileAdvanced(input, "dojDor");
        console.log('twoParameter dateOfJoining, dateOfRetirement ', result);
        return result;
    }
    else if(input.dateOfJoining && input.recruitmentType
        && !input.state
        && !input.degree && !input.community && !input.dateOfBirth && !input.designation 
        && !input.department && !input.postingIn && !input.dateOfRetirement
    ){
        console.log('dateOfJoining, recruitmentType present');
        result = await this.byProfileAdvanced(input, "dojRec");
        console.log('twoParameter dateOfJoining, recruitmentType ', result);
        return result;
    }
    else if(input.dateOfJoining && input.postingIn
        && !input.state
        && !input.degree && !input.community && !input.dateOfBirth && !input.designation 
        && !input.department && !input.recruitmentType && !input.dateOfRetirement
    ){
        console.log('dateOfJoining, postingIn present');
        result = await this.byProfileAdvanced(input, "dojPos");
        console.log('twoParameter dateOfJoining, postingIn ', result);
        return result;
    }
    else if(input.dateOfJoining && input.department
        && !input.state
        && !input.degree && !input.community && !input.dateOfBirth && !input.designation 
        && !input.postingIn && !input.recruitmentType && !input.dateOfRetirement
    ){
        console.log('dateOfJoining, department present');
        result = await this.byProfileAdvanced(input, "dojDep");
        console.log('twoParameter dateOfJoining, department ', result);
        return result;
    }
    else if(input.dateOfJoining && input.designation
        && !input.state
        && !input.degree && !input.community && !input.dateOfBirth
        && !input.department && !input.postingIn && !input.recruitmentType && !input.dateOfRetirement
    ){
        console.log('dateOfJoining, designation present');
        result = await this.byProfileAdvanced(input, "dojDes");
        console.log('twoParameter dateOfJoining, recruitmentType ', result);
        return result;
    }

    /////////
else if(input.dateOfRetirement && input.recruitmentType
    && !input.state && !input.dateOfJoining
        && !input.degree && !input.community && !input.dateOfBirth && !input.designation 
        && !input.department && !input.postingIn
){
    console.log('dateOfRetirement, recruitmentType present');
    result = await this.byProfileAdvanced(input, "dorRec");
    console.log('twoParameter dateOfRetirement, recruitmentType ', result);
    return result;
}
else if(input.dateOfRetirement && input.postingIn
    && !input.state && !input.dateOfJoining
        && !input.degree && !input.community && !input.dateOfBirth && !input.designation 
        && !input.department && !input.recruitmentType
){
    console.log('dateOfRetirement, postingIn present');
    result = await this.byProfileAdvanced(input, "dorPos");
    console.log('twoParameter dateOfRetirement, postingIn ', result);
    return result;
}
else if(input.dateOfRetirement && input.department
    && !input.state && !input.dateOfJoining
        && !input.degree && !input.community && !input.dateOfBirth && !input.designation 
        && !input.postingIn && !input.recruitmentType
){
    console.log('dateOfRetirement, department present');
    result = await this.byProfileAdvanced(input, "dorDep");
    console.log('twoParameter dateOfRetirement, department ', result);
    return result;
}
else if(input.dateOfRetirement && input.designation
    && !input.state && !input.dateOfJoining
        && !input.degree && !input.community && !input.dateOfBirth 
        && !input.department && !input.postingIn && !input.recruitmentType
){
    console.log('dateOfRetirement, designation present');
    result = await this.byProfileAdvanced(input, "dorDes");
    console.log('twoParameter dateOfRetirement, designation ', result);
    return result;
}

else if(input.recruitmentType && input.postingIn
    && !input.state && !input.dateOfJoining
        && !input.degree && !input.community && !input.dateOfBirth && !input.designation 
        && !input.department && !input.dateOfRetirement
){
    console.log('recruitmentType, postingIn present');
    result = await this.byProfileAdvanced(input, "recPos");
    console.log('twoParameter recruitmentType, postingIn ', result);
    return result;
}
else if(input.recruitmentType && input.department
    && !input.state && !input.dateOfJoining
        && !input.degree && !input.community && !input.dateOfBirth && !input.designation 
        && !input.postingIn && !input.dateOfRetirement
){
    console.log('recruitmentType, department present');
    result = await this.byProfileAdvanced(input, "recDep");
    console.log('twoParameter recruitmentType, department ', result);
    return result;
}
else if(input.recruitmentType && input.designation
    && !input.state && !input.dateOfJoining
    && !input.degree && !input.community && !input.dateOfBirth 
    && !input.department && !input.postingIn && !input.dateOfRetirement
){
    console.log('recruitmentType, designation present');
    result = await this.byProfileAdvanced(input, "recDes");
    console.log('twoParameter recruitmentType, designation ', result);
    return result;
}

/////
else if(input.postingIn && input.department
    && !input.state && !input.dateOfJoining
    && !input.degree && !input.community && !input.dateOfBirth && !input.designation 
    && !input.recruitmentType && !input.dateOfRetirement
){
    console.log('postingIn, department present');
    result = await this.byProfileAdvanced(input, "posDep");
    console.log('twoParameter postingIn, department ', result);
    return result;
}
else if(input.postingIn && input.designation
    && !input.state && !input.dateOfJoining
    && !input.degree && !input.community && !input.dateOfBirth 
    && !input.department && !input.recruitmentType && !input.dateOfRetirement
){
    console.log('postingIn, designation present');
    result = await this.byProfileAdvanced(input, "posDes");
    console.log('twoParameter postingIn, designation ', result);
    return result;
}

/////
else if(input.department && input.designation
    && !input.state && !input.dateOfJoining
    && !input.degree && !input.community && !input.dateOfBirth
    && !input.postingIn && !input.recruitmentType && !input.dateOfRetirement
){
    console.log('department, designation present');
    result = await this.byProfileAdvanced(input, "DepDes");
    console.log('twoParameter department, designation ', result);
    return result;
}


    // let twoResult = [];
    // return twoResult;
}

exports.threeParameterAdvanced = async (input) => {
    try {
        console.log('inside threeParameterAdvanced function', input);

        const combinations = [
            { fields: ['dateOfBirth', 'state', 'community'], action: 'dobStaCom' },
            { fields: ['dateOfBirth', 'state', 'degree'], action: 'dobStaDeg' },
            { fields: ['dateOfBirth', 'state', 'dateOfJoining'], action: 'dobStaDoj' },
            { fields: ['dateOfBirth', 'state', 'dateOfRetirement'], action: 'dobStaDor' },
            { fields: ['dateOfBirth', 'state', 'recruitmentType'], action: 'dobStaRec' },
            { fields: ['dateOfBirth', 'state', 'postingIn'], action: 'dobStaPos' },
            { fields: ['dateOfBirth', 'state', 'department'], action: 'dobStaDep' },
            { fields: ['dateOfBirth', 'state', 'designation'], action: 'dobStaDes' },
            { fields: ['dateOfBirth', 'community', 'degree'], action: 'dobComDeg' },
            { fields: ['dateOfBirth', 'community', 'dateOfJoining'], action: 'dobComDoj' },
            { fields: ['dateOfBirth', 'community', 'dateOfRetirement'], action: 'dobComDor' },
            { fields: ['dateOfBirth', 'community', 'recruitmentType'], action: 'dobComRec' },
            { fields: ['dateOfBirth', 'community', 'postingIn'], action: 'dobComPos' },
            { fields: ['dateOfBirth', 'community', 'department'], action: 'dobComDep' },
            { fields: ['dateOfBirth', 'community', 'designation'], action: 'dobComDes' },
            { fields: ['dateOfBirth', 'degree', 'dateOfJoining'], action: 'dobDegDoj' },
            { fields: ['dateOfBirth', 'degree', 'dateOfRetirement'], action: 'dobDegDor' },
            { fields: ['dateOfBirth', 'degree', 'recruitmentType'], action: 'dobDegRec' },
            { fields: ['dateOfBirth', 'degree', 'postingIn'], action: 'dobDegPos' },
            { fields: ['dateOfBirth', 'degree', 'department'], action: 'dobDegDep' },
            { fields: ['dateOfBirth', 'degree', 'designation'], action: 'dobDegDes' },
            { fields: ['dateOfBirth', 'dateOfJoining', 'dateOfRetirement'], action: 'dobDojDor' },
            { fields: ['dateOfBirth', 'dateOfJoining', 'recruitmentType'], action: 'dobDojRec' },
            { fields: ['dateOfBirth', 'dateOfJoining', 'postingIn'], action: 'dobDojPos' },
            { fields: ['dateOfBirth', 'dateOfJoining', 'department'], action: 'dobDojDep' },
            { fields: ['dateOfBirth', 'dateOfJoining', 'designation'], action: 'dobDojDes' },
            { fields: ['dateOfBirth', 'dateOfRetirement', 'recruitmentType'], action: 'dobDorRec' },
            { fields: ['dateOfBirth', 'dateOfRetirement', 'postingIn'], action: 'dobDorPos' },
            { fields: ['dateOfBirth', 'dateOfRetirement', 'department'], action: 'dobDorDep' },
            { fields: ['dateOfBirth', 'dateOfRetirement', 'designation'], action: 'dobDorDes' },
            { fields: ['dateOfBirth', 'recruitmentType', 'postingIn'], action: 'dobRecPos' },
            { fields: ['dateOfBirth', 'recruitmentType', 'department'], action: 'dobRecDep' },
            { fields: ['dateOfBirth', 'recruitmentType', 'designation'], action: 'dobRecDes' },
            { fields: ['dateOfBirth', 'postingIn', 'department'], action: 'dobPosDep' },
            { fields: ['dateOfBirth', 'postingIn', 'designation'], action: 'dobPosDes' },
            { fields: ['dateOfBirth', 'department', 'designation'], action: 'dobDepDes' },
            { fields: ['state', 'community', 'degree'], action: 'staComDeg' },
            { fields: ['state', 'community', 'dateOfJoining'], action: 'staComDoj' },
            { fields: ['state', 'community', 'dateOfRetirement'], action: 'staComDor' },
            { fields: ['state', 'community', 'recruitmentType'], action: 'staComRec' },
            { fields: ['state', 'community', 'postingIn'], action: 'staComPos' },
            { fields: ['state', 'community', 'department'], action: 'staComDep' },
            { fields: ['state', 'community', 'designation'], action: 'staComDes' },
            { fields: ['state', 'degree', 'dateOfJoining'], action: 'staDegDoj' },
            { fields: ['state', 'degree', 'dateOfRetirement'], action: 'staDegDor' },
            { fields: ['state', 'degree', 'recruitmentType'], action: 'staDegRec' },
            { fields: ['state', 'degree', 'postingIn'], action: 'staDegPos' },
            { fields: ['state', 'degree', 'department'], action: 'staDegDep' },
            { fields: ['state', 'degree', 'designation'], action: 'staDegDes' },
            { fields: ['state', 'dateOfJoining', 'dateOfRetirement'], action: 'staDojDor' },
            { fields: ['state', 'dateOfJoining', 'recruitmentType'], action: 'staDojRec' },
            { fields: ['state', 'dateOfJoining', 'postingIn'], action: 'staDojPos' },
            { fields: ['state', 'dateOfJoining', 'department'], action: 'staDojDep' },
            { fields: ['state', 'dateOfJoining', 'designation'], action: 'staDojDes' },
            { fields: ['state', 'dateOfRetirement', 'recruitmentType'], action: 'staDorRec' },
            { fields: ['state', 'dateOfRetirement', 'postingIn'], action: 'staDorPos' },
            { fields: ['state', 'dateOfRetirement', 'department'], action: 'staDorDep' },
            { fields: ['state', 'dateOfRetirement', 'designation'], action: 'staDorDes' },
            { fields: ['state', 'recruitmentType', 'postingIn'], action: 'staRecPos' },
            { fields: ['state', 'recruitmentType', 'department'], action: 'staRecDep' },
            { fields: ['state', 'recruitmentType', 'designation'], action: 'staRecDes' },
            { fields: ['state', 'postingIn', 'department'], action: 'staPosDep' },
            { fields: ['state', 'postingIn', 'designation'], action: 'staPosDes' },
            { fields: ['state', 'department', 'designation'], action: 'staDepDes' },
            { fields: ['community', 'degree', 'dateOfJoining'], action: 'comDegDoj' },
            { fields: ['community', 'degree', 'dateOfRetirement'], action: 'comDegDor' },
            { fields: ['community', 'degree', 'recruitmentType'], action: 'comDegRec' },
            { fields: ['community', 'degree', 'postingIn'], action: 'comDegPos' },
            { fields: ['community', 'degree', 'department'], action: 'comDegDep' },
            { fields: ['community', 'degree', 'designation'], action: 'comDegDes' },
            { fields: ['community', 'dateOfJoining', 'dateOfRetirement'], action: 'comDojDor' },
            { fields: ['community', 'dateOfJoining', 'recruitmentType'], action: 'comDojRec' },
            { fields: ['community', 'dateOfJoining', 'postingIn'], action: 'comDojPos' },
            { fields: ['community', 'dateOfJoining', 'department'], action: 'comDojDep' },
            { fields: ['community', 'dateOfJoining', 'designation'], action: 'comDojDes' },
            { fields: ['community', 'dateOfRetirement', 'recruitmentType'], action: 'comDorRec' },
            { fields: ['community', 'dateOfRetirement', 'postingIn'], action: 'comDorPos' },
            { fields: ['community', 'dateOfRetirement', 'department'], action: 'comDorDep' },
            { fields: ['community', 'dateOfRetirement', 'designation'], action: 'comDorDes' },
            { fields: ['community', 'recruitmentType', 'postingIn'], action: 'comRecPos' },
            { fields: ['community', 'recruitmentType', 'department'], action: 'comRecDep' },
            { fields: ['community', 'recruitmentType', 'designation'], action: 'comRecDes' },
            { fields: ['community', 'postingIn', 'department'], action: 'comPosDep' },
            { fields: ['community', 'postingIn', 'designation'], action: 'comPosDes' },
            { fields: ['community', 'department', 'designation'], action: 'comDepDes' },
            { fields: ['degree', 'dateOfJoining', 'dateOfRetirement'], action: 'degDojDor' },
            { fields: ['degree', 'dateOfJoining', 'recruitmentType'], action: 'degDojRec' },
            { fields: ['degree', 'dateOfJoining', 'postingIn'], action: 'degDojPos' },
            { fields: ['degree', 'dateOfJoining', 'department'], action: 'degDojDep' },
            { fields: ['degree', 'dateOfJoining', 'designation'], action: 'degDojDes' },
            { fields: ['degree', 'dateOfRetirement', 'recruitmentType'], action: 'degDorRec' },
            { fields: ['degree', 'dateOfRetirement', 'postingIn'], action: 'degDorPos' },
            { fields: ['degree', 'dateOfRetirement', 'department'], action: 'degDorDep' },
            { fields: ['degree', 'dateOfRetirement', 'designation'], action: 'degDorDes' },
            { fields: ['degree', 'recruitmentType', 'postingIn'], action: 'degRecPos' },
            { fields: ['degree', 'recruitmentType', 'department'], action: 'degRecDep' },
            { fields: ['degree', 'recruitmentType', 'designation'], action: 'degRecDes' },
            { fields: ['degree', 'postingIn', 'department'], action: 'degPosDep' },
            { fields: ['degree', 'postingIn', 'designation'], action: 'degPosDes' },
            { fields: ['degree', 'department', 'designation'], action: 'degDepDes' },
            { fields: ['dateOfJoining', 'dateOfRetirement', 'recruitmentType'], action: 'dojDorRec' },
            { fields: ['dateOfJoining', 'dateOfRetirement', 'postingIn'], action: 'dojDorPos' },
            { fields: ['dateOfJoining', 'dateOfRetirement', 'department'], action: 'dojDorDep' },
            { fields: ['dateOfJoining', 'dateOfRetirement', 'designation'], action: 'dojDorDes' },
            { fields: ['dateOfJoining', 'recruitmentType', 'postingIn'], action: 'dojRecPos' },
            { fields: ['dateOfJoining', 'recruitmentType', 'department'], action: 'dojRecDep' },
            { fields: ['dateOfJoining', 'recruitmentType', 'designation'], action: 'dojRecDes' },
            { fields: ['dateOfJoining', 'postingIn', 'department'], action: 'dojPosDep' },
            { fields: ['dateOfJoining', 'postingIn', 'designation'], action: 'dojPosDes' },
            { fields: ['dateOfJoining', 'department', 'designation'], action: 'dojDepDes' },
            { fields: ['dateOfRetirement', 'recruitmentType', 'postingIn'], action: 'dorRecPos' },
            { fields: ['dateOfRetirement', 'recruitmentType', 'department'], action: 'dorRecDep' },
            { fields: ['dateOfRetirement', 'recruitmentType', 'designation'], action: 'dorRecDes' },
            { fields: ['dateOfRetirement', 'postingIn', 'department'], action: 'dorPosDep' },
            { fields: ['dateOfRetirement', 'postingIn', 'designation'], action: 'dorPosDes' },
            { fields: ['dateOfRetirement', 'department', 'designation'], action: 'dorDepDes' },
            { fields: ['recruitmentType', 'postingIn', 'department'], action: 'recPosDep' },
            { fields: ['recruitmentType', 'postingIn', 'designation'], action: 'recPosDes' },
            { fields: ['recruitmentType', 'department', 'designation'], action: 'recDepDes' },
            { fields: ['postingIn', 'department', 'designation'], action: 'posDepDes' }

        ];

        // Function to check combinations
        async function checkCombinations(input) {
            for (const combo of combinations) {
                const { fields, action } = combo;
                const match = fields.every(field => input[field] !== undefined); // Check if all fields in combo are present

                if (match) {
                    console.log(`${fields.join(', ')} present, by ${action}`);
                    return action; // Return action once found
                }
            }

            console.log('No matching combination found');
            return null; // Return null if no matching combination found
        }

        // Call the function to determine action
        const action = await checkCombinations(input);

        if (action) {
            console.log('Final Action:', action);
            const result = await this.byProfileAdvanced(input, action);
            console.log('Result:', result);
            return result; // Return result
        } else {
            console.log('No valid action found');
            return null; // Return null if no valid action found
        }
    } catch (error) {
        console.error('Error in threeParameterAdvanced:', error);
        throw error;
    }
};

exports.fourParameterAdvanced = async (input) => {
    try {
        console.log('inside fourParameterAdvanced function', input);

        const combinations = [
            { fields: ['dateOfBirth', 'state', 'community', 'degree'], action: 'dobStaComDeg' },
            { fields: ['dateOfBirth', 'state', 'community', 'dateOfJoining'], action: 'dobStaComDoj' },
            { fields: ['dateOfBirth', 'state', 'community', 'dateOfRetirement'], action: 'dobStaComDor' },
            { fields: ['dateOfBirth', 'state', 'community', 'recruitmentType'], action: 'dobStaComRec' },
            { fields: ['dateOfBirth', 'state', 'community', 'postingIn'], action: 'dobStaComPos' },
            { fields: ['dateOfBirth', 'state', 'community', 'department'], action: 'dobStaComDep' },
            { fields: ['dateOfBirth', 'state', 'community', 'designation'], action: 'dobStaComDes' },
            { fields: ['dateOfBirth', 'state', 'degree', 'dateOfJoining'], action: 'dobStaDegDoj' },
            { fields: ['dateOfBirth', 'state', 'degree', 'dateOfRetirement'], action: 'dobStaDegDor' },
            { fields: ['dateOfBirth', 'state', 'degree', 'recruitmentType'], action: 'dobStaDegRec' },
            { fields: ['dateOfBirth', 'state', 'degree', 'postingIn'], action: 'dobStaDegPos' },
            { fields: ['dateOfBirth', 'state', 'degree', 'department'], action: 'dobStaDegDep' },
            { fields: ['dateOfBirth', 'state', 'degree', 'designation'], action: 'dobStaDegDes' },
            { fields: ['dateOfBirth', 'state', 'dateOfJoining', 'dateOfRetirement'], action: 'dobStaDojDor' },
            { fields: ['dateOfBirth', 'state', 'dateOfJoining', 'recruitmentType'], action: 'dobStaDojRec' },
            { fields: ['dateOfBirth', 'state', 'dateOfJoining', 'postingIn'], action: 'dobStaDojPos' },
            { fields: ['dateOfBirth', 'state', 'dateOfJoining', 'department'], action: 'dobStaDojDep' },
            { fields: ['dateOfBirth', 'state', 'dateOfJoining', 'designation'], action: 'dobStaDojDes' },
            { fields: ['dateOfBirth', 'state', 'dateOfRetirement', 'recruitmentType'], action: 'dobStaDorRec' },
            { fields: ['dateOfBirth', 'state', 'dateOfRetirement', 'postingIn'], action: 'dobStaDorPos' },
            { fields: ['dateOfBirth', 'state', 'dateOfRetirement', 'department'], action: 'dobStaDorDep' },
            { fields: ['dateOfBirth', 'state', 'dateOfRetirement', 'designation'], action: 'dobStaDorDes' },
            { fields: ['dateOfBirth', 'state', 'recruitmentType', 'postingIn'], action: 'dobStaRecPos' },
            { fields: ['dateOfBirth', 'state', 'recruitmentType', 'department'], action: 'dobStaRecDep' },
            { fields: ['dateOfBirth', 'state', 'recruitmentType', 'designation'], action: 'dobStaRecDes' },
            { fields: ['dateOfBirth', 'state', 'postingIn', 'department'], action: 'dobStaPosDep' },
            { fields: ['dateOfBirth', 'state', 'postingIn', 'designation'], action: 'dobStaPosDes' },
            { fields: ['dateOfBirth', 'state', 'department', 'designation'], action: 'dobStaDepDes' },
            { fields: ['dateOfBirth', 'community', 'degree', 'dateOfJoining'], action: 'dobComDegDoj' },
            { fields: ['dateOfBirth', 'community', 'degree', 'dateOfRetirement'], action: 'dobComDegDor' },
            { fields: ['dateOfBirth', 'community', 'degree', 'recruitmentType'], action: 'dobComDegRec' },
            { fields: ['dateOfBirth', 'community', 'degree', 'postingIn'], action: 'dobComDegPos' },
            { fields: ['dateOfBirth', 'community', 'degree', 'department'], action: 'dobComDegDep' },
            { fields: ['dateOfBirth', 'community', 'degree', 'designation'], action: 'dobComDegDes' },
            { fields: ['dateOfBirth', 'community', 'dateOfJoining', 'dateOfRetirement'], action: 'dobComDojDor' },
            { fields: ['dateOfBirth', 'community', 'dateOfJoining', 'recruitmentType'], action: 'dobComDojRec' },
            { fields: ['dateOfBirth', 'community', 'dateOfJoining', 'postingIn'], action: 'dobComDojPos' },
            { fields: ['dateOfBirth', 'community', 'dateOfJoining', 'department'], action: 'dobComDojDep' },
            { fields: ['dateOfBirth', 'community', 'dateOfJoining', 'designation'], action: 'dobComDojDes' },
            { fields: ['dateOfBirth', 'community', 'dateOfRetirement', 'recruitmentType'], action: 'dobComDorRec' },
            { fields: ['dateOfBirth', 'community', 'dateOfRetirement', 'postingIn'], action: 'dobComDorPos' },
            { fields: ['dateOfBirth', 'community', 'dateOfRetirement', 'department'], action: 'dobComDorDep' },
            { fields: ['dateOfBirth', 'community', 'dateOfRetirement', 'designation'], action: 'dobComDorDes' },
            { fields: ['dateOfBirth', 'community', 'recruitmentType', 'postingIn'], action: 'dobComRecPos' },
            { fields: ['dateOfBirth', 'community', 'recruitmentType', 'department'], action: 'dobComRecDep' },
            { fields: ['dateOfBirth', 'community', 'recruitmentType', 'designation'], action: 'dobComRecDes' },
            { fields: ['dateOfBirth', 'community', 'postingIn', 'department'], action: 'dobComPosDep' },
            { fields: ['dateOfBirth', 'community', 'postingIn', 'designation'], action: 'dobComPosDes' },
            { fields: ['dateOfBirth', 'community', 'department', 'designation'], action: 'dobComDepDes' },
            { fields: ['dateOfBirth', 'degree', 'dateOfJoining', 'dateOfRetirement'], action: 'dobDegDojDor' },
            { fields: ['dateOfBirth', 'degree', 'dateOfJoining', 'recruitmentType'], action: 'dobDegDojRec' },
            { fields: ['dateOfBirth', 'degree', 'dateOfJoining', 'postingIn'], action: 'dobDegDojPos' },
            { fields: ['dateOfBirth', 'degree', 'dateOfJoining', 'department'], action: 'dobDegDojDep' },
            { fields: ['dateOfBirth', 'degree', 'dateOfJoining', 'designation'], action: 'dobDegDojDes' },
            { fields: ['dateOfBirth', 'degree', 'dateOfRetirement', 'recruitmentType'], action: 'dobDegDorRec' },
            { fields: ['dateOfBirth', 'degree', 'dateOfRetirement', 'postingIn'], action: 'dobDegDorPos' },
            { fields: ['dateOfBirth', 'degree', 'dateOfRetirement', 'department'], action: 'dobDegDorDep' },
            { fields: ['dateOfBirth', 'degree', 'dateOfRetirement', 'designation'], action: 'dobDegDorDes' },
            { fields: ['dateOfBirth', 'degree', 'recruitmentType', 'postingIn'], action: 'dobDegRecPos' },
            { fields: ['dateOfBirth', 'degree', 'recruitmentType', 'department'], action: 'dobDegRecDep' },
            { fields: ['dateOfBirth', 'degree', 'recruitmentType', 'designation'], action: 'dobDegRecDes' },
            { fields: ['dateOfBirth', 'degree', 'postingIn', 'department'], action: 'dobDegPosDep' },
            { fields: ['dateOfBirth', 'degree', 'postingIn', 'designation'], action: 'dobDegPosDes' },
            { fields: ['dateOfBirth', 'degree', 'department', 'designation'], action: 'dobDegDepDes' },
            { fields: ['dateOfBirth', 'dateOfJoining', 'dateOfRetirement', 'recruitmentType'], action: 'dobDojDorRec' },
            { fields: ['dateOfBirth', 'dateOfJoining', 'dateOfRetirement', 'postingIn'], action: 'dobDojDorPos' },
            { fields: ['dateOfBirth', 'dateOfJoining', 'dateOfRetirement', 'department'], action: 'dobDojDorDep' },
            { fields: ['dateOfBirth', 'dateOfJoining', 'dateOfRetirement', 'designation'], action: 'dobDojDorDes' },
            { fields: ['dateOfBirth', 'dateOfJoining', 'recruitmentType', 'postingIn'], action: 'dobDojRecPos' },
            { fields: ['dateOfBirth', 'dateOfJoining', 'recruitmentType', 'department'], action: 'dobDojRecDep' },
            { fields: ['dateOfBirth', 'dateOfJoining', 'recruitmentType', 'designation'], action: 'dobDojRecDes' },
            { fields: ['dateOfBirth', 'dateOfJoining', 'postingIn', 'department'], action: 'dobDojPosDep' },
            { fields: ['dateOfBirth', 'dateOfJoining', 'postingIn', 'designation'], action: 'dobDojPosDes' },
            { fields: ['dateOfBirth', 'dateOfJoining', 'department', 'designation'], action: 'dobDojDepDes' },
            { fields: ['dateOfBirth', 'dateOfRetirement', 'recruitmentType', 'postingIn'], action: 'dobDorRecPos' },
            { fields: ['dateOfBirth', 'dateOfRetirement', 'recruitmentType', 'department'], action: 'dobDorRecDep' },
            { fields: ['dateOfBirth', 'dateOfRetirement', 'recruitmentType', 'designation'], action: 'dobDorRecDes' },
            { fields: ['dateOfBirth', 'dateOfRetirement', 'postingIn', 'department'], action: 'dobDorPosDep' },
            { fields: ['dateOfBirth', 'dateOfRetirement', 'postingIn', 'designation'], action: 'dobDorPosDes' },
            { fields: ['dateOfBirth', 'dateOfRetirement', 'department', 'designation'], action: 'dobDorDepDes' },
            { fields: ['dateOfBirth', 'recruitmentType', 'postingIn', 'department'], action: 'dobRecPosDep' },
            { fields: ['dateOfBirth', 'recruitmentType', 'postingIn', 'designation'], action: 'dobRecPosDes' },
            { fields: ['dateOfBirth', 'recruitmentType', 'department', 'designation'], action: 'dobRecDepDes' },
            { fields: ['dateOfBirth', 'postingIn', 'department', 'designation'], action: 'dobPosDepDes' },
            { fields: ['state', 'community', 'degree', 'dateOfJoining'], action: 'staComDegDoj' },
            { fields: ['state', 'community', 'degree', 'dateOfRetirement'], action: 'staComDegDor' },
            { fields: ['state', 'community', 'degree', 'recruitmentType'], action: 'staComDegRec' },
            { fields: ['state', 'community', 'degree', 'postingIn'], action: 'staComDegPos' },
            { fields: ['state', 'community', 'degree', 'department'], action: 'staComDegDep' },
            { fields: ['state', 'community', 'degree', 'designation'], action: 'staComDegDes' },
            { fields: ['state', 'community', 'dateOfJoining', 'dateOfRetirement'], action: 'staComDojDor' },
            { fields: ['state', 'community', 'dateOfJoining', 'recruitmentType'], action: 'staComDojRec' },
            { fields: ['state', 'community', 'dateOfJoining', 'postingIn'], action: 'staComDojPos' },
            { fields: ['state', 'community', 'dateOfJoining', 'department'], action: 'staComDojDep' },
            { fields: ['state', 'community', 'dateOfJoining', 'designation'], action: 'staComDojDes' },
            { fields: ['state', 'community', 'dateOfRetirement', 'recruitmentType'], action: 'staComDorRec' },
            { fields: ['state', 'community', 'dateOfRetirement', 'postingIn'], action: 'staComDorPos' },
            { fields: ['state', 'community', 'dateOfRetirement', 'department'], action: 'staComDorDep' },
            { fields: ['state', 'community', 'dateOfRetirement', 'designation'], action: 'staComDorDes' },
            { fields: ['state', 'community', 'recruitmentType', 'postingIn'], action: 'staComRecPos' },
            { fields: ['state', 'community', 'recruitmentType', 'department'], action: 'staComRecDep' },
            { fields: ['state', 'community', 'recruitmentType', 'designation'], action: 'staComRecDes' },
            { fields: ['state', 'community', 'postingIn', 'department'], action: 'staComPosDep' },
            { fields: ['state', 'community', 'postingIn', 'designation'], action: 'staComPosDes' },
            { fields: ['state', 'community', 'department', 'designation'], action: 'staComDepDes' },
            { fields: ['state', 'degree', 'dateOfJoining', 'dateOfRetirement'], action: 'staDegDojDor' },
            { fields: ['state', 'degree', 'dateOfJoining', 'recruitmentType'], action: 'staDegDojRec' },
            { fields: ['state', 'degree', 'dateOfJoining', 'postingIn'], action: 'staDegDojPos' },
            { fields: ['state', 'degree', 'dateOfJoining', 'department'], action: 'staDegDojDep' },
            { fields: ['state', 'degree', 'dateOfJoining', 'designation'], action: 'staDegDojDes' },
            { fields: ['state', 'degree', 'dateOfRetirement', 'recruitmentType'], action: 'staDegDorRec' },
            { fields: ['state', 'degree', 'dateOfRetirement', 'postingIn'], action: 'staDegDorPos' },
            { fields: ['state', 'degree', 'dateOfRetirement', 'department'], action: 'staDegDorDep' },
            { fields: ['state', 'degree', 'dateOfRetirement', 'designation'], action: 'staDegDorDes' },
            { fields: ['state', 'degree', 'recruitmentType', 'postingIn'], action: 'staDegRecPos' },
            { fields: ['state', 'degree', 'recruitmentType', 'department'], action: 'staDegRecDep' },
            { fields: ['state', 'degree', 'recruitmentType', 'designation'], action: 'staDegRecDes' },
            { fields: ['state', 'degree', 'postingIn', 'department'], action: 'staDegPosDep' },
            { fields: ['state', 'degree', 'postingIn', 'designation'], action: 'staDegPosDes' },
            { fields: ['state', 'degree', 'department', 'designation'], action: 'staDegDepDes' },
            { fields: ['state', 'dateOfJoining', 'dateOfRetirement', 'recruitmentType'], action: 'staDojDorRec' },
            { fields: ['state', 'dateOfJoining', 'dateOfRetirement', 'postingIn'], action: 'staDojDorPos' },
            { fields: ['state', 'dateOfJoining', 'dateOfRetirement', 'department'], action: 'staDojDorDep' },
            { fields: ['state', 'dateOfJoining', 'dateOfRetirement', 'designation'], action: 'staDojDorDes' },
            { fields: ['state', 'dateOfJoining', 'recruitmentType', 'postingIn'], action: 'staDojRecPos' },
            { fields: ['state', 'dateOfJoining', 'recruitmentType', 'department'], action: 'staDojRecDep' },
            { fields: ['state', 'dateOfJoining', 'recruitmentType', 'designation'], action: 'staDojRecDes' },
            { fields: ['state', 'dateOfJoining', 'postingIn', 'department'], action: 'staDojPosDep' },
            { fields: ['state', 'dateOfJoining', 'postingIn', 'designation'], action: 'staDojPosDes' },
            { fields: ['state', 'dateOfJoining', 'department', 'designation'], action: 'staDojDepDes' },
            { fields: ['state', 'dateOfRetirement', 'recruitmentType', 'postingIn'], action: 'staDorRecPos' },
            { fields: ['state', 'dateOfRetirement', 'recruitmentType', 'department'], action: 'staDorRecDep' },
            { fields: ['state', 'dateOfRetirement', 'recruitmentType', 'designation'], action: 'staDorRecDes' },
            { fields: ['state', 'dateOfRetirement', 'postingIn', 'department'], action: 'staDorPosDep' },
            { fields: ['state', 'dateOfRetirement', 'postingIn', 'designation'], action: 'staDorPosDes' },
            { fields: ['state', 'dateOfRetirement', 'department', 'designation'], action: 'staDorDepDes' },
            { fields: ['state', 'recruitmentType', 'postingIn', 'department'], action: 'staRecPosDep' },
            { fields: ['state', 'recruitmentType', 'postingIn', 'designation'], action: 'staRecPosDes' },
            { fields: ['state', 'recruitmentType', 'department', 'designation'], action: 'staRecDepDes' },
            { fields: ['state', 'postingIn', 'department', 'designation'], action: 'staPosDepDes' },
            { fields: ['community', 'degree', 'dateOfJoining', 'dateOfRetirement'], action: 'comDegDojDor' },
            { fields: ['community', 'degree', 'dateOfJoining', 'recruitmentType'], action: 'comDegDojRec' },
            { fields: ['community', 'degree', 'dateOfJoining', 'postingIn'], action: 'comDegDojPos' },
            { fields: ['community', 'degree', 'dateOfJoining', 'department'], action: 'comDegDojDep' },
            { fields: ['community', 'degree', 'dateOfJoining', 'designation'], action: 'comDegDojDes' },
            { fields: ['community', 'degree', 'dateOfRetirement', 'recruitmentType'], action: 'comDegDorRec' },
            { fields: ['community', 'degree', 'dateOfRetirement', 'postingIn'], action: 'comDegDorPos' },
            { fields: ['community', 'degree', 'dateOfRetirement', 'department'], action: 'comDegDorDep' },
            { fields: ['community', 'degree', 'dateOfRetirement', 'designation'], action: 'comDegDorDes' },
            { fields: ['community', 'degree', 'recruitmentType', 'postingIn'], action: 'comDegRecPos' },
            { fields: ['community', 'degree', 'recruitmentType', 'department'], action: 'comDegRecDep' },
            { fields: ['community', 'degree', 'recruitmentType', 'designation'], action: 'comDegRecDes' },
            { fields: ['community', 'degree', 'postingIn', 'department'], action: 'comDegPosDep' },
            { fields: ['community', 'degree', 'postingIn', 'designation'], action: 'comDegPosDes' },
            { fields: ['community', 'degree', 'department', 'designation'], action: 'comDegDepDes' },
            { fields: ['community', 'dateOfJoining', 'dateOfRetirement', 'recruitmentType'], action: 'comDojDorRec' },
            { fields: ['community', 'dateOfJoining', 'dateOfRetirement', 'postingIn'], action: 'comDojDorPos' },
            { fields: ['community', 'dateOfJoining', 'dateOfRetirement', 'department'], action: 'comDojDorDep' },
            { fields: ['community', 'dateOfJoining', 'dateOfRetirement', 'designation'], action: 'comDojDorDes' },
            { fields: ['community', 'dateOfJoining', 'recruitmentType', 'postingIn'], action: 'comDojRecPos' },
            { fields: ['community', 'dateOfJoining', 'recruitmentType', 'department'], action: 'comDojRecDep' },
            { fields: ['community', 'dateOfJoining', 'recruitmentType', 'designation'], action: 'comDojRecDes' },
            { fields: ['community', 'dateOfJoining', 'postingIn', 'department'], action: 'comDojPosDep' },
            { fields: ['community', 'dateOfJoining', 'postingIn', 'designation'], action: 'comDojPosDes' },
            { fields: ['community', 'dateOfJoining', 'department', 'designation'], action: 'comDojDepDes' },
            { fields: ['community', 'dateOfRetirement', 'recruitmentType', 'postingIn'], action: 'comDorRecPos' },
            { fields: ['community', 'dateOfRetirement', 'recruitmentType', 'department'], action: 'comDorRecDep' },
            { fields: ['community', 'dateOfRetirement', 'recruitmentType', 'designation'], action: 'comDorRecDes' },
            { fields: ['community', 'dateOfRetirement', 'postingIn', 'department'], action: 'comDorPosDep' },
            { fields: ['community', 'dateOfRetirement', 'postingIn', 'designation'], action: 'comDorPosDes' },
            { fields: ['community', 'dateOfRetirement', 'department', 'designation'], action: 'comDorDepDes' },
            { fields: ['community', 'recruitmentType', 'postingIn', 'department'], action: 'comRecPosDep' },
            { fields: ['community', 'recruitmentType', 'postingIn', 'designation'], action: 'comRecPosDes' },
            { fields: ['community', 'recruitmentType', 'department', 'designation'], action: 'comRecDepDes' },
            { fields: ['community', 'postingIn', 'department', 'designation'], action: 'comPosDepDes' },
            { fields: ['degree', 'dateOfJoining', 'dateOfRetirement', 'recruitmentType'], action: 'degDojDorRec' },
            { fields: ['degree', 'dateOfJoining', 'dateOfRetirement', 'postingIn'], action: 'degDojDorPos' },
            { fields: ['degree', 'dateOfJoining', 'dateOfRetirement', 'department'], action: 'degDojDorDep' },
            { fields: ['degree', 'dateOfJoining', 'dateOfRetirement', 'designation'], action: 'degDojDorDes' },
            { fields: ['degree', 'dateOfJoining', 'recruitmentType', 'postingIn'], action: 'degDojRecPos' },
            { fields: ['degree', 'dateOfJoining', 'recruitmentType', 'department'], action: 'degDojRecDep' },
            { fields: ['degree', 'dateOfJoining', 'recruitmentType', 'designation'], action: 'degDojRecDes' },
            { fields: ['degree', 'dateOfJoining', 'postingIn', 'department'], action: 'degDojPosDep' },
            { fields: ['degree', 'dateOfJoining', 'postingIn', 'designation'], action: 'degDojPosDes' },
            { fields: ['degree', 'dateOfJoining', 'department', 'designation'], action: 'degDojDepDes' },
            { fields: ['degree', 'dateOfRetirement', 'recruitmentType', 'postingIn'], action: 'degDorRecPos' },
            { fields: ['degree', 'dateOfRetirement', 'recruitmentType', 'department'], action: 'degDorRecDep' },
            { fields: ['degree', 'dateOfRetirement', 'recruitmentType', 'designation'], action: 'degDorRecDes' },
            { fields: ['degree', 'dateOfRetirement', 'postingIn', 'department'], action: 'degDorPosDep' },
            { fields: ['degree', 'dateOfRetirement', 'postingIn', 'designation'], action: 'degDorPosDes' },
            { fields: ['degree', 'dateOfRetirement', 'department', 'designation'], action: 'degDorDepDes' },
            { fields: ['degree', 'recruitmentType', 'postingIn', 'department'], action: 'degRecPosDep' },
            { fields: ['degree', 'recruitmentType', 'postingIn', 'designation'], action: 'degRecPosDes' },
            { fields: ['degree', 'recruitmentType', 'department', 'designation'], action: 'degRecDepDes' },
            { fields: ['degree', 'postingIn', 'department', 'designation'], action: 'degPosDepDes' },
            { fields: ['dateOfJoining', 'dateOfRetirement', 'recruitmentType', 'postingIn'], action: 'dojDorRecPos' },
            { fields: ['dateOfJoining', 'dateOfRetirement', 'recruitmentType', 'department'], action: 'dojDorRecDep' },
            { fields: ['dateOfJoining', 'dateOfRetirement', 'recruitmentType', 'designation'], action: 'dojDorRecDes' },
            { fields: ['dateOfJoining', 'dateOfRetirement', 'postingIn', 'department'], action: 'dojDorPosDep' },
            { fields: ['dateOfJoining', 'dateOfRetirement', 'postingIn', 'designation'], action: 'dojDorPosDes' },
            { fields: ['dateOfJoining', 'dateOfRetirement', 'department', 'designation'], action: 'dojDorDepDes' },
            { fields: ['dateOfJoining', 'recruitmentType', 'postingIn', 'department'], action: 'dojRecPosDep' },
            { fields: ['dateOfJoining', 'recruitmentType', 'postingIn', 'designation'], action: 'dojRecPosDes' },
            { fields: ['dateOfJoining', 'recruitmentType', 'department', 'designation'], action: 'dojRecDepDes' },
            { fields: ['dateOfJoining', 'postingIn', 'department', 'designation'], action: 'dojPosDepDes' },
            { fields: ['dateOfRetirement', 'recruitmentType', 'postingIn', 'department'], action: 'dorRecPosDep' },
            { fields: ['dateOfRetirement', 'recruitmentType', 'postingIn', 'designation'], action: 'dorRecPosDes' },
            { fields: ['dateOfRetirement', 'recruitmentType', 'department', 'designation'], action: 'dorRecDepDes' },
            { fields: ['dateOfRetirement', 'postingIn', 'department', 'designation'], action: 'dorPosDepDes' },
            { fields: ['recruitmentType', 'postingIn', 'department', 'designation'], action: 'recPosDepDes' },
        ]

        // Function to check combinations
        async function checkCombinations(input) {
            for (const combo of combinations) {
                const { fields, action } = combo;
                const match = fields.every(field => input[field] !== undefined); // Check if all fields in combo are present

                if (match) {
                    console.log(`${fields.join(', ')} present, by ${action}`);
                    return action; // Return action once found
                }
            }

            console.log('No matching combination found');
            return null; // Return null if no matching combination found
        }

        // Call the function to determine action
        const action = await checkCombinations(input);

        if (action) {
            console.log('Final Action:', action);
            const result = await this.byProfileAdvanced(input, action);
            console.log('Result:', result);
            return result; // Return result
        } else {
            console.log('No valid action found');
            return null; // Return null if no valid action found
        }
    } catch (error) {
        console.error('Error in fourParameterAdvanced:', error);
        throw error;
    }
};

exports.fiveParameterAdvanced = async (input) => {
    try {
        console.log('inside fiveParameterAdvanced function', input);

        const combinations = [
            { "fields": ["dateOfBirth", "state", "community", "degree", "dateOfJoining"], "action": "dobStaComDegDoj" },
            { "fields": ["dateOfBirth", "state", "community", "degree", "dateOfRetirement"], "action": "dobStaComDegDor" },
            { "fields": ["dateOfBirth", "state", "community", "degree", "recruitmentType"], "action": "dobStaComDegRec" },
            { "fields": ["dateOfBirth", "state", "community", "degree", "postingIn"], "action": "dobStaComDegPos" },
            { "fields": ["dateOfBirth", "state", "community", "degree", "department"], "action": "dobStaComDegDep" },
            { "fields": ["dateOfBirth", "state", "community", "degree", "designation"], "action": "dobStaComDegDes" },
            { "fields": ["dateOfBirth", "state", "community", "dateOfJoining", "dateOfRetirement"], "action": "dobStaComDojDor" },
            { "fields": ["dateOfBirth", "state", "community", "dateOfJoining", "recruitmentType"], "action": "dobStaComDojRec" },
            { "fields": ["dateOfBirth", "state", "community", "dateOfJoining", "postingIn"], "action": "dobStaComDojPos" },
            { "fields": ["dateOfBirth", "state", "community", "dateOfJoining", "department"], "action": "dobStaComDojDep" },
            { "fields": ["dateOfBirth", "state", "community", "dateOfJoining", "designation"], "action": "dobStaComDojDes" },
            { "fields": ["dateOfBirth", "state", "community", "dateOfRetirement", "recruitmentType"], "action": "dobStaComDorRec" },
            { "fields": ["dateOfBirth", "state", "community", "dateOfRetirement", "postingIn"], "action": "dobStaComDorPos" },
            { "fields": ["dateOfBirth", "state", "community", "dateOfRetirement", "department"], "action": "dobStaComDorDep" },
            { "fields": ["dateOfBirth", "state", "community", "dateOfRetirement", "designation"], "action": "dobStaComDorDes" },
            { "fields": ["dateOfBirth", "state", "community", "recruitmentType", "postingIn"], "action": "dobStaComRecPos" },
            { "fields": ["dateOfBirth", "state", "community", "recruitmentType", "department"], "action": "dobStaComRecDep" },
            { "fields": ["dateOfBirth", "state", "community", "recruitmentType", "designation"], "action": "dobStaComRecDes" },
            { "fields": ["dateOfBirth", "state", "community", "postingIn", "department"], "action": "dobStaComPosDep" },
            { "fields": ["dateOfBirth", "state", "community", "postingIn", "designation"], "action": "dobStaComPosDes" },
            { "fields": ["dateOfBirth", "state", "community", "department", "designation"], "action": "dobStaComDepDes" },
            { "fields": ["dateOfBirth", "state", "degree", "dateOfJoining", "dateOfRetirement"], "action": "dobStaDegDojDor" },
            { "fields": ["dateOfBirth", "state", "degree", "dateOfJoining", "recruitmentType"], "action": "dobStaDegDojRec" },
            { "fields": ["dateOfBirth", "state", "degree", "dateOfJoining", "postingIn"], "action": "dobStaDegDojPos" },
            { "fields": ["dateOfBirth", "state", "degree", "dateOfJoining", "department"], "action": "dobStaDegDojDep" },
            { "fields": ["dateOfBirth", "state", "degree", "dateOfJoining", "designation"], "action": "dobStaDegDojDes" },
            { "fields": ["dateOfBirth", "state", "degree", "dateOfRetirement", "recruitmentType"], "action": "dobStaDegDorRec" },
            { "fields": ["dateOfBirth", "state", "degree", "dateOfRetirement", "postingIn"], "action": "dobStaDegDorPos" },
            { "fields": ["dateOfBirth", "state", "degree", "dateOfRetirement", "department"], "action": "dobStaDegDorDep" },
            { "fields": ["dateOfBirth", "state", "degree", "dateOfRetirement", "designation"], "action": "dobStaDegDorDes" },
            { "fields": ["dateOfBirth", "state", "degree", "recruitmentType", "postingIn"], "action": "dobStaDegRecPos" },
            { "fields": ["dateOfBirth", "state", "degree", "recruitmentType", "department"], "action": "dobStaDegRecDep" },
            { "fields": ["dateOfBirth", "state", "degree", "recruitmentType", "designation"], "action": "dobStaDegRecDes" },
            { "fields": ["dateOfBirth", "state", "degree", "postingIn", "department"], "action": "dobStaDegPosDep" },
            { "fields": ["dateOfBirth", "state", "degree", "postingIn", "designation"], "action": "dobStaDegPosDes" },
            { "fields": ["dateOfBirth", "state", "degree", "department", "designation"], "action": "dobStaDegDepDes" },
            { "fields": ["dateOfBirth", "state", "dateOfJoining", "dateOfRetirement", "recruitmentType"], "action": "dobStaDojDorRec" },
            { "fields": ["dateOfBirth", "state", "dateOfJoining", "dateOfRetirement", "postingIn"], "action": "dobStaDojDorPos" },
            { "fields": ["dateOfBirth", "state", "dateOfJoining", "dateOfRetirement", "department"], "action": "dobStaDojDorDep" },
            { "fields": ["dateOfBirth", "state", "dateOfJoining", "dateOfRetirement", "designation"], "action": "dobStaDojDorDes" },
            { "fields": ["dateOfBirth", "state", "dateOfJoining", "recruitmentType", "postingIn"], "action": "dobStaDojRecPos" },
            { "fields": ["dateOfBirth", "state", "dateOfJoining", "recruitmentType", "department"], "action": "dobStaDojRecDep" },
            { "fields": ["dateOfBirth", "state", "dateOfJoining", "recruitmentType", "designation"], "action": "dobStaDojRecDes" },
            { "fields": ["dateOfBirth", "state", "dateOfJoining", "postingIn", "department"], "action": "dobStaDojPosDep" },
            { "fields": ["dateOfBirth", "state", "dateOfJoining", "postingIn", "designation"], "action": "dobStaDojPosDes" },
            { "fields": ["dateOfBirth", "state", "dateOfJoining", "department", "designation"], "action": "dobStaDojDepDes" },
            { "fields": ["dateOfBirth", "state", "dateOfRetirement", "recruitmentType", "postingIn"], "action": "dobStaDorRecPos" },
            { "fields": ["dateOfBirth", "state", "dateOfRetirement", "recruitmentType", "department"], "action": "dobStaDorRecDep" },
            { "fields": ["dateOfBirth", "state", "dateOfRetirement", "recruitmentType", "designation"], "action": "dobStaDorRecDes" },
            { "fields": ["dateOfBirth", "state", "dateOfRetirement", "postingIn", "department"], "action": "dobStaDorPosDep" },
            { "fields": ["dateOfBirth", "state", "dateOfRetirement", "postingIn", "designation"], "action": "dobStaDorPosDes" },
            { "fields": ["dateOfBirth", "state", "dateOfRetirement", "department", "designation"], "action": "dobStaDorDepDes" },
            { "fields": ["dateOfBirth", "state", "recruitmentType", "postingIn", "department"], "action": "dobStaRecPosDep" },
            { "fields": ["dateOfBirth", "state", "recruitmentType", "postingIn", "designation"], "action": "dobStaRecPosDes" },
            { "fields": ["dateOfBirth", "state", "recruitmentType", "department", "designation"], "action": "dobStaRecDepDes" },
            { "fields": ["dateOfBirth", "state", "postingIn", "department", "designation"], "action": "dobStaPosDepDes" },
            { "fields": ["dateOfBirth", "community", "degree", "dateOfJoining", "dateOfRetirement"], "action": "dobComDegDojDor" },
            { "fields": ["dateOfBirth", "community", "degree", "dateOfJoining", "recruitmentType"], "action": "dobComDegDojRec" },
            { "fields": ["dateOfBirth", "community", "degree", "dateOfJoining", "postingIn"], "action": "dobComDegDojPos" },
            { "fields": ["dateOfBirth", "community", "degree", "dateOfJoining", "department"], "action": "dobComDegDojDep" },
            { "fields": ["dateOfBirth", "community", "degree", "dateOfJoining", "designation"], "action": "dobComDegDojDes" },
            { "fields": ["dateOfBirth", "community", "degree", "dateOfRetirement", "recruitmentType"], "action": "dobComDegDorRec" },
            { "fields": ["dateOfBirth", "community", "degree", "dateOfRetirement", "postingIn"], "action": "dobComDegDorPos" },
            { "fields": ["dateOfBirth", "community", "degree", "dateOfRetirement", "department"], "action": "dobComDegDorDep" },
            { "fields": ["dateOfBirth", "community", "degree", "dateOfRetirement", "designation"], "action": "dobComDegDorDes" },
            { "fields": ["dateOfBirth", "community", "degree", "recruitmentType", "postingIn"], "action": "dobComDegRecPos" },
            { "fields": ["dateOfBirth", "community", "degree", "recruitmentType", "department"], "action": "dobComDegRecDep" },
            { "fields": ["dateOfBirth", "community", "degree", "recruitmentType", "designation"], "action": "dobComDegRecDes" },
            { "fields": ["dateOfBirth", "community", "degree", "postingIn", "department"], "action": "dobComDegPosDep" },
            { "fields": ["dateOfBirth", "community", "degree", "postingIn", "designation"], "action": "dobComDegPosDes" },
            { "fields": ["dateOfBirth", "community", "degree", "department", "designation"], "action": "dobComDegDepDes" },
            { "fields": ["dateOfBirth", "community", "dateOfJoining", "dateOfRetirement", "recruitmentType"], "action": "dobComDojDorRec" },
            { "fields": ["dateOfBirth", "community", "dateOfJoining", "dateOfRetirement", "postingIn"], "action": "dobComDojDorPos" },
            { "fields": ["dateOfBirth", "community", "dateOfJoining", "dateOfRetirement", "department"], "action": "dobComDojDorDep" },
            { "fields": ["dateOfBirth", "community", "dateOfJoining", "dateOfRetirement", "designation"], "action": "dobComDojDorDes" },
            { "fields": ["dateOfBirth", "community", "dateOfJoining", "recruitmentType", "postingIn"], "action": "dobComDojRecPos" },
            { "fields": ["dateOfBirth", "community", "dateOfJoining", "recruitmentType", "department"], "action": "dobComDojRecDep" },
            { "fields": ["dateOfBirth", "community", "dateOfJoining", "recruitmentType", "designation"], "action": "dobComDojRecDes" },
            { "fields": ["dateOfBirth", "community", "dateOfJoining", "postingIn", "department"], "action": "dobComDojPosDep" },
            { "fields": ["dateOfBirth", "community", "dateOfJoining", "postingIn", "designation"], "action": "dobComDojPosDes" },
            { "fields": ["dateOfBirth", "community", "dateOfJoining", "department", "designation"], "action": "dobComDojDepDes" },
            { "fields": ["dateOfBirth", "community", "dateOfRetirement", "recruitmentType", "postingIn"], "action": "dobComDorRecPos" },
            { "fields": ["dateOfBirth", "community", "dateOfRetirement", "recruitmentType", "department"], "action": "dobComDorRecDep" },
            { "fields": ["dateOfBirth", "community", "dateOfRetirement", "recruitmentType", "designation"], "action": "dobComDorRecDes" },
            { "fields": ["dateOfBirth", "community", "dateOfRetirement", "postingIn", "department"], "action": "dobComDorPosDep" },
            { "fields": ["dateOfBirth", "community", "dateOfRetirement", "postingIn", "designation"], "action": "dobComDorPosDes" },
            { "fields": ["dateOfBirth", "community", "dateOfRetirement", "department", "designation"], "action": "dobComDorDepDes" },
            { "fields": ["dateOfBirth", "community", "recruitmentType", "postingIn", "department"], "action": "dobComRecPosDep" },
            { "fields": ["dateOfBirth", "community", "recruitmentType", "postingIn", "designation"], "action": "dobComRecPosDes" },
            { "fields": ["dateOfBirth", "community", "recruitmentType", "department", "designation"], "action": "dobComRecDepDes" },
            { "fields": ["dateOfBirth", "community", "postingIn", "department", "designation"], "action": "dobComPosDepDes" },
            { "fields": ["dateOfBirth", "degree", "dateOfJoining", "dateOfRetirement", "recruitmentType"], "action": "dobDegDojDorRec" },
            { "fields": ["dateOfBirth", "degree", "dateOfJoining", "dateOfRetirement", "postingIn"], "action": "dobDegDojDorPos" },
            { "fields": ["dateOfBirth", "degree", "dateOfJoining", "dateOfRetirement", "department"], "action": "dobDegDojDorDep" },
            { "fields": ["dateOfBirth", "degree", "dateOfJoining", "dateOfRetirement", "designation"], "action": "dobDegDojDorDes" },
            { "fields": ["dateOfBirth", "degree", "dateOfJoining", "recruitmentType", "postingIn"], "action": "dobDegDojRecPos" },
            { "fields": ["dateOfBirth", "degree", "dateOfJoining", "recruitmentType", "department"], "action": "dobDegDojRecDep" },
            { "fields": ["dateOfBirth", "degree", "dateOfJoining", "recruitmentType", "designation"], "action": "dobDegDojRecDes" },
            { "fields": ["dateOfBirth", "degree", "dateOfJoining", "postingIn", "department"], "action": "dobDegDojPosDep" },
            { "fields": ["dateOfBirth", "degree", "dateOfJoining", "postingIn", "designation"], "action": "dobDegDojPosDes" },
            { "fields": ["dateOfBirth", "degree", "dateOfJoining", "department", "designation"], "action": "dobDegDojDepDes" },
            { "fields": ["dateOfBirth", "degree", "dateOfRetirement", "recruitmentType", "postingIn"], "action": "dobDegDorRecPos" },
            { "fields": ["dateOfBirth", "degree", "dateOfRetirement", "recruitmentType", "department"], "action": "dobDegDorRecDep" },
            { "fields": ["dateOfBirth", "degree", "dateOfRetirement", "recruitmentType", "designation"], "action": "dobDegDorRecDes" },
            { "fields": ["dateOfBirth", "degree", "dateOfRetirement", "postingIn", "department"], "action": "dobDegDorPosDep" },
            { "fields": ["dateOfBirth", "degree", "dateOfRetirement", "postingIn", "designation"], "action": "dobDegDorPosDes" },
            { "fields": ["dateOfBirth", "degree", "dateOfRetirement", "department", "designation"], "action": "dobDegDorDepDes" },
            { "fields": ["dateOfBirth", "degree", "recruitmentType", "postingIn", "department"], "action": "dobDegRecPosDep" },
            { "fields": ["dateOfBirth", "degree", "recruitmentType", "postingIn", "designation"], "action": "dobDegRecPosDes" },
            { "fields": ["dateOfBirth", "degree", "recruitmentType", "department", "designation"], "action": "dobDegRecDepDes" },
            { "fields": ["dateOfBirth", "degree", "postingIn", "department", "designation"], "action": "dobDegPosDepDes" },
            { "fields": ["dateOfBirth", "dateOfJoining", "dateOfRetirement", "recruitmentType", "postingIn"], "action": "dobDojDorRecPos" },
            { "fields": ["dateOfBirth", "dateOfJoining", "dateOfRetirement", "recruitmentType", "department"], "action": "dobDojDorRecDep" },
            { "fields": ["dateOfBirth", "dateOfJoining", "dateOfRetirement", "recruitmentType", "designation"], "action": "dobDojDorRecDes" },
            { "fields": ["dateOfBirth", "dateOfJoining", "dateOfRetirement", "postingIn", "department"], "action": "dobDojDorPosDep" },
            { "fields": ["dateOfBirth", "dateOfJoining", "dateOfRetirement", "postingIn", "designation"], "action": "dobDojDorPosDes" },
            { "fields": ["dateOfBirth", "dateOfJoining", "dateOfRetirement", "department", "designation"], "action": "dobDojDorDepDes" },
            { "fields": ["dateOfBirth", "dateOfJoining", "recruitmentType", "postingIn", "department"], "action": "dobDojRecPosDep" },
            { "fields": ["dateOfBirth", "dateOfJoining", "recruitmentType", "postingIn", "designation"], "action": "dobDojRecPosDes" },
            { "fields": ["dateOfBirth", "dateOfJoining", "recruitmentType", "department", "designation"], "action": "dobDojRecDepDes" },
            { "fields": ["dateOfBirth", "dateOfJoining", "postingIn", "department", "designation"], "action": "dobDojPosDepDes" },
            { "fields": ["dateOfBirth", "dateOfRetirement", "recruitmentType", "postingIn", "department"], "action": "dobDorRecPosDep" },
            { "fields": ["dateOfBirth", "dateOfRetirement", "recruitmentType", "postingIn", "designation"], "action": "dobDorRecPosDes" },
            { "fields": ["dateOfBirth", "dateOfRetirement", "recruitmentType", "department", "designation"], "action": "dobDorRecDepDes" },
            { "fields": ["dateOfBirth", "dateOfRetirement", "postingIn", "department", "designation"], "action": "dobDorPosDepDes" },
            { "fields": ["dateOfBirth", "recruitmentType", "postingIn", "department", "designation"], "action": "dobRecPosDepDes" },
            { "fields": ["state", "community", "degree", "dateOfJoining", "dateOfRetirement"], "action": "staComDegDojDor" },
            { "fields": ["state", "community", "degree", "dateOfJoining", "recruitmentType"], "action": "staComDegDojRec" },
            { "fields": ["state", "community", "degree", "dateOfJoining", "postingIn"], "action": "staComDegDojPos" },
            { "fields": ["state", "community", "degree", "dateOfJoining", "department"], "action": "staComDegDojDep" },
            { "fields": ["state", "community", "degree", "dateOfJoining", "designation"], "action": "staComDegDojDes" },
            { "fields": ["state", "community", "degree", "dateOfRetirement", "recruitmentType"], "action": "staComDegDorRec" },
            { "fields": ["state", "community", "degree", "dateOfRetirement", "postingIn"], "action": "staComDegDorPos" },
            { "fields": ["state", "community", "degree", "dateOfRetirement", "department"], "action": "staComDegDorDep" },
            { "fields": ["state", "community", "degree", "dateOfRetirement", "designation"], "action": "staComDegDorDes" },
            { "fields": ["state", "community", "degree", "recruitmentType", "postingIn"], "action": "staComDegRecPos" },
            { "fields": ["state", "community", "degree", "recruitmentType", "department"], "action": "staComDegRecDep" },
            { "fields": ["state", "community", "degree", "recruitmentType", "designation"], "action": "staComDegRecDes" },
            { "fields": ["state", "community", "degree", "postingIn", "department"], "action": "staComDegPosDep" },
            { "fields": ["state", "community", "degree", "postingIn", "designation"], "action": "staComDegPosDes" },
            { "fields": ["state", "community", "degree", "department", "designation"], "action": "staComDegDepDes" },
            { "fields": ["state", "community", "dateOfJoining", "dateOfRetirement", "recruitmentType"], "action": "staComDojDorRec" },
            { "fields": ["state", "community", "dateOfJoining", "dateOfRetirement", "postingIn"], "action": "staComDojDorPos" },
            { "fields": ["state", "community", "dateOfJoining", "dateOfRetirement", "department"], "action": "staComDojDorDep" },
            { "fields": ["state", "community", "dateOfJoining", "dateOfRetirement", "designation"], "action": "staComDojDorDes" },
            { "fields": ["state", "community", "dateOfJoining", "recruitmentType", "postingIn"], "action": "staComDojRecPos" },
            { "fields": ["state", "community", "dateOfJoining", "recruitmentType", "department"], "action": "staComDojRecDep" },
            { "fields": ["state", "community", "dateOfJoining", "recruitmentType", "designation"], "action": "staComDojRecDes" },
            { "fields": ["state", "community", "dateOfJoining", "postingIn", "department"], "action": "staComDojPosDep" },
            { "fields": ["state", "community", "dateOfJoining", "postingIn", "designation"], "action": "staComDojPosDes" },
            { "fields": ["state", "community", "dateOfJoining", "department", "designation"], "action": "staComDojDepDes" },
            { "fields": ["state", "community", "dateOfRetirement", "recruitmentType", "postingIn"], "action": "staComDorRecPos" },
            { "fields": ["state", "community", "dateOfRetirement", "recruitmentType", "department"], "action": "staComDorRecDep" },
            { "fields": ["state", "community", "dateOfRetirement", "recruitmentType", "designation"], "action": "staComDorRecDes" },
            { "fields": ["state", "community", "dateOfRetirement", "postingIn", "department"], "action": "staComDorPosDep" },
            { "fields": ["state", "community", "dateOfRetirement", "postingIn", "designation"], "action": "staComDorPosDes" },
            { "fields": ["state", "community", "dateOfRetirement", "department", "designation"], "action": "staComDorDepDes" },
            { "fields": ["state", "community", "recruitmentType", "postingIn", "department"], "action": "staComRecPosDep" },
            { "fields": ["state", "community", "recruitmentType", "postingIn", "designation"], "action": "staComRecPosDes" },
            { "fields": ["state", "community", "recruitmentType", "department", "designation"], "action": "staComRecDepDes" },
            { "fields": ["state", "community", "postingIn", "department", "designation"], "action": "staComPosDepDes" },
            { "fields": ["state", "degree", "dateOfJoining", "dateOfRetirement", "recruitmentType"], "action": "staDegDojDorRec" },
            { "fields": ["state", "degree", "dateOfJoining", "dateOfRetirement", "postingIn"], "action": "staDegDojDorPos" },
            { "fields": ["state", "degree", "dateOfJoining", "dateOfRetirement", "department"], "action": "staDegDojDorDep" },
            { "fields": ["state", "degree", "dateOfJoining", "dateOfRetirement", "designation"], "action": "staDegDojDorDes" },
            { "fields": ["state", "degree", "dateOfJoining", "recruitmentType", "postingIn"], "action": "staDegDojRecPos" },
            { "fields": ["state", "degree", "dateOfJoining", "recruitmentType", "department"], "action": "staDegDojRecDep" },
            { "fields": ["state", "degree", "dateOfJoining", "recruitmentType", "designation"], "action": "staDegDojRecDes" },
            { "fields": ["state", "degree", "dateOfJoining", "postingIn", "department"], "action": "staDegDojPosDep" },
            { "fields": ["state", "degree", "dateOfJoining", "postingIn", "designation"], "action": "staDegDojPosDes" },
            { "fields": ["state", "degree", "dateOfJoining", "department", "designation"], "action": "staDegDojDepDes" },
            { "fields": ["state", "degree", "dateOfRetirement", "recruitmentType", "postingIn"], "action": "staDegDorRecPos" },
            { "fields": ["state", "degree", "dateOfRetirement", "recruitmentType", "department"], "action": "staDegDorRecDep" },
            { "fields": ["state", "degree", "dateOfRetirement", "recruitmentType", "designation"], "action": "staDegDorRecDes" },
            { "fields": ["state", "degree", "dateOfRetirement", "postingIn", "department"], "action": "staDegDorPosDep" },
            { "fields": ["state", "degree", "dateOfRetirement", "postingIn", "designation"], "action": "staDegDorPosDes" },
            { "fields": ["state", "degree", "dateOfRetirement", "department", "designation"], "action": "staDegDorDepDes" },
            { "fields": ["state", "degree", "recruitmentType", "postingIn", "department"], "action": "staDegRecPosDep" },
            { "fields": ["state", "degree", "recruitmentType", "postingIn", "designation"], "action": "staDegRecPosDes" },
            { "fields": ["state", "degree", "recruitmentType", "department", "designation"], "action": "staDegRecDepDes" },
            { "fields": ["state", "degree", "postingIn", "department", "designation"], "action": "staDegPosDepDes" },
            { "fields": ["state", "dateOfJoining", "dateOfRetirement", "recruitmentType", "postingIn"], "action": "staDojDorRecPos" },
            { "fields": ["state", "dateOfJoining", "dateOfRetirement", "recruitmentType", "department"], "action": "staDojDorRecDep" },
            { "fields": ["state", "dateOfJoining", "dateOfRetirement", "recruitmentType", "designation"], "action": "staDojDorRecDes" },
            { "fields": ["state", "dateOfJoining", "dateOfRetirement", "postingIn", "department"], "action": "staDojDorPosDep" },
            { "fields": ["state", "dateOfJoining", "dateOfRetirement", "postingIn", "designation"], "action": "staDojDorPosDes" },
            { "fields": ["state", "dateOfJoining", "dateOfRetirement", "department", "designation"], "action": "staDojDorDepDes" },
            { "fields": ["state", "dateOfJoining", "recruitmentType", "postingIn", "department"], "action": "staDojRecPosDep" },
            { "fields": ["state", "dateOfJoining", "recruitmentType", "postingIn", "designation"], "action": "staDojRecPosDes" },
            { "fields": ["state", "dateOfJoining", "recruitmentType", "department", "designation"], "action": "staDojRecDepDes" },
            { "fields": ["state", "dateOfJoining", "postingIn", "department", "designation"], "action": "staDojPosDepDes" },
            { "fields": ["state", "dateOfRetirement", "recruitmentType", "postingIn", "department"], "action": "staDorRecPosDep" },
            { "fields": ["state", "dateOfRetirement", "recruitmentType", "postingIn", "designation"], "action": "staDorRecPosDes" },
            { "fields": ["state", "dateOfRetirement", "recruitmentType", "department", "designation"], "action": "staDorRecDepDes" },
            { "fields": ["state", "dateOfRetirement", "postingIn", "department", "designation"], "action": "staDorPosDepDes" },
            { "fields": ["state", "recruitmentType", "postingIn", "department", "designation"], "action": "staRecPosDepDes" },
            { "fields": ["community", "degree", "dateOfJoining", "dateOfRetirement", "recruitmentType"], "action": "comDegDojDorRec" },
            { "fields": ["community", "degree", "dateOfJoining", "dateOfRetirement", "postingIn"], "action": "comDegDojDorPos" },
            { "fields": ["community", "degree", "dateOfJoining", "dateOfRetirement", "department"], "action": "comDegDojDorDep" },
            { "fields": ["community", "degree", "dateOfJoining", "dateOfRetirement", "designation"], "action": "comDegDojDorDes" },
            { "fields": ["community", "degree", "dateOfJoining", "recruitmentType", "postingIn"], "action": "comDegDojRecPos" },
            { "fields": ["community", "degree", "dateOfJoining", "recruitmentType", "department"], "action": "comDegDojRecDep" },
            { "fields": ["community", "degree", "dateOfJoining", "recruitmentType", "designation"], "action": "comDegDojRecDes" },
            { "fields": ["community", "degree", "dateOfJoining", "postingIn", "department"], "action": "comDegDojPosDep" },
            { "fields": ["community", "degree", "dateOfJoining", "postingIn", "designation"], "action": "comDegDojPosDes" },
            { "fields": ["community", "degree", "dateOfJoining", "department", "designation"], "action": "comDegDojDepDes" },
            { "fields": ["community", "degree", "dateOfRetirement", "recruitmentType", "postingIn"], "action": "comDegDorRecPos" },
            { "fields": ["community", "degree", "dateOfRetirement", "recruitmentType", "department"], "action": "comDegDorRecDep" },
            { "fields": ["community", "degree", "dateOfRetirement", "recruitmentType", "designation"], "action": "comDegDorRecDes" },
            { "fields": ["community", "degree", "dateOfRetirement", "postingIn", "department"], "action": "comDegDorPosDep" },
            { "fields": ["community", "degree", "dateOfRetirement", "postingIn", "designation"], "action": "comDegDorPosDes" },
            { "fields": ["community", "degree", "dateOfRetirement", "department", "designation"], "action": "comDegDorDepDes" },
            { "fields": ["community", "degree", "recruitmentType", "postingIn", "department"], "action": "comDegRecPosDep" },
            { "fields": ["community", "degree", "recruitmentType", "postingIn", "designation"], "action": "comDegRecPosDes" },
            { "fields": ["community", "degree", "recruitmentType", "department", "designation"], "action": "comDegRecDepDes" },
            { "fields": ["community", "degree", "postingIn", "department", "designation"], "action": "comDegPosDepDes" },
            { "fields": ["community", "dateOfJoining", "dateOfRetirement", "recruitmentType", "postingIn"], "action": "comDojDorRecPos" },
            { "fields": ["community", "dateOfJoining", "dateOfRetirement", "recruitmentType", "department"], "action": "comDojDorRecDep" },
            { "fields": ["community", "dateOfJoining", "dateOfRetirement", "recruitmentType", "designation"], "action": "comDojDorRecDes" },
            { "fields": ["community", "dateOfJoining", "dateOfRetirement", "postingIn", "department"], "action": "comDojDorPosDep" },
            { "fields": ["community", "dateOfJoining", "dateOfRetirement", "postingIn", "designation"], "action": "comDojDorPosDes" },
            { "fields": ["community", "dateOfJoining", "dateOfRetirement", "department", "designation"], "action": "comDojDorDepDes" },
            { "fields": ["community", "dateOfJoining", "recruitmentType", "postingIn", "department"], "action": "comDojRecPosDep" },
            { "fields": ["community", "dateOfJoining", "recruitmentType", "postingIn", "designation"], "action": "comDojRecPosDes" },
            { "fields": ["community", "dateOfJoining", "recruitmentType", "department", "designation"], "action": "comDojRecDepDes" },
            { "fields": ["community", "dateOfJoining", "postingIn", "department", "designation"], "action": "comDojPosDepDes" },
            { "fields": ["community", "dateOfRetirement", "recruitmentType", "postingIn", "department"], "action": "comDorRecPosDep" },
            { "fields": ["community", "dateOfRetirement", "recruitmentType", "postingIn", "designation"], "action": "comDorRecPosDes" },
            { "fields": ["community", "dateOfRetirement", "recruitmentType", "department", "designation"], "action": "comDorRecDepDes" },
            { "fields": ["community", "dateOfRetirement", "postingIn", "department", "designation"], "action": "comDorPosDepDes" },
            { "fields": ["community", "recruitmentType", "postingIn", "department", "designation"], "action": "comRecPosDepDes" },
            { "fields": ["degree", "dateOfJoining", "dateOfRetirement", "recruitmentType", "postingIn"], "action": "degDojDorRecPos" },
            { "fields": ["degree", "dateOfJoining", "dateOfRetirement", "recruitmentType", "department"], "action": "degDojDorRecDep" },
            { "fields": ["degree", "dateOfJoining", "dateOfRetirement", "recruitmentType", "designation"], "action": "degDojDorRecDes" },
            { "fields": ["degree", "dateOfJoining", "dateOfRetirement", "postingIn", "department"], "action": "degDojDorPosDep" },
            { "fields": ["degree", "dateOfJoining", "dateOfRetirement", "postingIn", "designation"], "action": "degDojDorPosDes" },
            { "fields": ["degree", "dateOfJoining", "dateOfRetirement", "department", "designation"], "action": "degDojDorDepDes" },
            { "fields": ["degree", "dateOfJoining", "recruitmentType", "postingIn", "department"], "action": "degDojRecPosDep" },
            { "fields": ["degree", "dateOfJoining", "recruitmentType", "postingIn", "designation"], "action": "degDojRecPosDes" },
            { "fields": ["degree", "dateOfJoining", "recruitmentType", "department", "designation"], "action": "degDojRecDepDes" },
            { "fields": ["degree", "dateOfJoining", "postingIn", "department", "designation"], "action": "degDojPosDepDes" },
            { "fields": ["degree", "dateOfRetirement", "recruitmentType", "postingIn", "department"], "action": "degDorRecPosDep" },
            { "fields": ["degree", "dateOfRetirement", "recruitmentType", "postingIn", "designation"], "action": "degDorRecPosDes" },
            { "fields": ["degree", "dateOfRetirement", "recruitmentType", "department", "designation"], "action": "degDorRecDepDes" },
            { "fields": ["degree", "dateOfRetirement", "postingIn", "department", "designation"], "action": "degDorPosDepDes" },
            { "fields": ["degree", "recruitmentType", "postingIn", "department", "designation"], "action": "degRecPosDepDes" },
            { "fields": ["dateOfJoining", "dateOfRetirement", "recruitmentType", "postingIn", "department"], "action": "dojDorRecPosDep" },
            { "fields": ["dateOfJoining", "dateOfRetirement", "recruitmentType", "postingIn", "designation"], "action": "dojDorRecPosDes" },
            { "fields": ["dateOfJoining", "dateOfRetirement", "recruitmentType", "department", "designation"], "action": "dojDorRecDepDes" },
            { "fields": ["dateOfJoining", "dateOfRetirement", "postingIn", "department", "designation"], "action": "dojDorPosDepDes" },
            { "fields": ["dateOfJoining", "recruitmentType", "postingIn", "department", "designation"], "action": "dojRecPosDepDes" }
        ]

        // Function to check combinations
        async function checkCombinations(input) {
            for (const combo of combinations) {
                const { fields, action } = combo;
                const match = fields.every(field => input[field] !== undefined); // Check if all fields in combo are present

                if (match) {
                    console.log(`${fields.join(', ')} present, by ${action}`);
                    return action; // Return action once found
                }
            }

            console.log('No matching combination found');
            return null; // Return null if no matching combination found
        }

        // Call the function to determine action
        const action = await checkCombinations(input);

        if (action) {
            console.log('Final Action:', action);
            const result = await this.byProfileAdvanced(input, action);
            console.log('Result:', result);
            return result; // Return result
        } else {
            console.log('No valid action found');
            return null; // Return null if no valid action found
        }
    } catch (error) {
        console.error('Error in fiveParameterAdvanced:', error);
        throw error;
    }
};

exports.tenParameterAdvanced = async (input) => {
    try {
        console.log('inside tenParameterAdvanced function', input);

        const combinations = [
            { "fields": ["dateOfBirth", "state", "community", "degree", "dateOfJoining", 
            "dateOfRetirement", "recruitmentType", "postingIn", "department", "designation"], "action": "ten" }
        ]

        // Function to check combinations
        async function checkCombinations(input) {
            for (const combo of combinations) {
                const { fields, action } = combo;
                const match = fields.every(field => input[field] !== undefined); // Check if all fields in combo are present

                if (match) {
                    console.log(`${fields.join(', ')} present, by ${action}`);
                    return action; // Return action once found
                }
            }

            console.log('No matching combination found');
            return null; // Return null if no matching combination found
        }

        // Call the function to determine action
        const action = await checkCombinations(input);

        if (action) {
            console.log('Final Action:', action);
            const result = await this.byProfileAdvanced(input, action);
            console.log('Result:', result);
            return result; // Return result
        } else {
            console.log('No valid action found');
            return null; // Return null if no valid action found
        }
    } catch (error) {
        console.error('Error in tenParameterAdvanced:', error);
        throw error;
    }
};

exports.nineParameterAdvanced = async (input) => {
    try {
        console.log('inside nineParameterAdvanced function', input);
        const combinations = [
            { "fields": ["dateOfBirth", "state", "community", "degree", "dateOfJoining", "dateOfRetirement", "recruitmentType", "postingIn", "department"], "action": "dobStaComDegDojDorRecPosDep" },
            { "fields": ["dateOfBirth", "state", "community", "degree", "dateOfJoining", "dateOfRetirement", "recruitmentType", "postingIn", "designation"], "action": "dobStaComDegDojDorRecPosDes" },
            { "fields": ["dateOfBirth", "state", "community", "degree", "dateOfJoining", "dateOfRetirement", "recruitmentType", "department", "designation"], "action": "dobStaComDegDojDorRecDepDes" },
            { "fields": ["dateOfBirth", "state", "community", "degree", "dateOfJoining", "dateOfRetirement", "postingIn", "department", "designation"], "action": "dobStaComDegDojDorPosDepDes" },
            { "fields": ["dateOfBirth", "state", "community", "degree", "dateOfJoining", "recruitmentType", "postingIn", "department", "designation"], "action": "dobStaComDegDojRecPosDepDes" },
            { "fields": ["dateOfBirth", "state", "community", "degree", "dateOfRetirement", "recruitmentType", "postingIn", "department", "designation"], "action": "dobStaComDegDorRecPosDepDes" },
            { "fields": ["dateOfBirth", "state", "community", "dateOfJoining", "dateOfRetirement", "recruitmentType", "postingIn", "department", "designation"], "action": "dobStaComDojDorRecPosDepDes" },
            { "fields": ["dateOfBirth", "state", "degree", "dateOfJoining", "dateOfRetirement", "recruitmentType", "postingIn", "department", "designation"], "action": "dobStaDegDojDorRecPosDepDes" },
            { "fields": ["dateOfBirth", "community", "degree", "dateOfJoining", "dateOfRetirement", "recruitmentType", "postingIn", "department", "designation"], "action": "dobComDegDojDorRecPosDepDes" },
            { "fields": ["state", "community", "degree", "dateOfJoining", "dateOfRetirement", "recruitmentType", "postingIn", "department", "designation"], "action": "staComDegDojDorRecPosDepDes" }
        ]

        // const combinations = [
        //     { "fields": ["dateOfBirth", "state", "community", "degree", "dateOfJoining", "dateOfRetirement", "recruitmentType", "postingIn", "department"], "action": "dobStaComDegDojDorRecPosDep" },
        //     { "fields": ["dateOfBirth", "state", "community", "degree", "dateOfJoining", "dateOfRetirement", "recruitmentType", "postingIn", "designation"], "action": "dobStaComDegDojDorRecPosDes" },
        //     { "fields": ["dateOfBirth", "state", "community", "degree", "dateOfJoining", "dateOfRetirement", "recruitmentType", "department", "designation"], "action": "dobStaComDegDojDorRecDepDes" },
        //     { "fields": ["dateOfBirth", "state", "community", "degree", "dateOfJoining", "dateOfRetirement", "postingIn", "department", "designation"], "action": "dobStaComDegDojDorPosDepDes" },
        //     { "fields": ["dateOfBirth", "state", "community", "degree", "dateOfJoining", "recruitmentType", "postingIn", "department", "designation"], "action": "dobStaComDegDojRecPosDepDes" },
        //     { "fields": ["dateOfBirth", "state", "community", "degree", "dateOfRetirement", "recruitmentType", "postingIn", "department", "designation"], "action": "dobStaComDegDorRecPosDepDes" },
        //     { "fields": ["dateOfBirth", "state", "community", "degree", "dateOfJoining", "dateOfRetirement", "postingIn", "department", "designation"], "action": "dobStaComDegDojDorPosDepDes" },
        //     { "fields": ["dateOfBirth", "state", "community", "degree", "dateOfJoining", "dateOfRetirement", "recruitmentType", "postingIn", "department"], "action": "dobStaComDegDojDorRecPosDep" },
        //     { "fields": ["dateOfBirth", "state", "community", "degree", "dateOfJoining", "dateOfRetirement", "recruitmentType", "postingIn", "designation"], "action": "dobStaComDegDojDorRecPosDes" },
        //     { "fields": ["dateOfBirth", "state", "community", "degree", "dateOfJoining", "dateOfRetirement", "recruitmentType", "department", "designation"], "action": "dobStaComDegDojDorRecDepDes" },
        //     { "fields": ["dateOfBirth", "state", "community", "degree", "dateOfJoining", "dateOfRetirement", "postingIn", "department", "designation"], "action": "dobStaComDegDojDorPosDepDes" },
        //     { "fields": ["dateOfBirth", "state", "community", "degree", "dateOfJoining", "dateOfRetirement", "postingIn", "department", "designation"], "action": "dobStaComDegDojDorPosDepDes" },
        //     { "fields": ["dateOfBirth", "state", "community", "degree", "dateOfJoining", "dateOfRetirement", "postingIn", "recruitmentType", "designation"], "action": "dobStaComDegDojDorPosRecDes" },
        //     { "fields": ["dateOfBirth", "state", "community", "degree", "dateOfJoining", "dateOfRetirement", "postingIn", "recruitmentType", "department"], "action": "dobStaComDegDojDorPosRecDep" },
        //     { "fields": ["dateOfBirth", "state", "community", "degree", "dateOfJoining", "dateOfRetirement", "recruitmentType", "postingIn", "department"], "action": "dobStaComDegDojDorRecPosDep" },
        //     { "fields": ["dateOfBirth", "state", "community", "degree", "dateOfJoining", "dateOfRetirement", "recruitmentType", "postingIn", "designation"], "action": "dobStaComDegDojDorRecPosDes" },
        //     { "fields": ["dateOfBirth", "state", "community", "degree", "dateOfJoining", "dateOfRetirement", "postingIn", "department", "designation"], "action": "dobStaComDegDojDorPosDepDes" },
        //     { "fields": ["dateOfBirth", "state", "community", "degree", "dateOfJoining", "dateOfRetirement", "postingIn", "recruitmentType", "designation"], "action": "dobStaComDegDojDorPosRecDes" },
        //     { "fields": ["dateOfBirth", "state", "community", "degree", "dateOfJoining", "dateOfRetirement", "postingIn", "recruitmentType", "department"], "action": "dobStaComDegDojDorPosRecDep" },
        //     { "fields": ["dateOfBirth", "state", "community", "degree", "dateOfJoining", "dateOfRetirement", "postingIn", "recruitmentType", "designation"], "action": "dobStaComDegDojDorPosRecDes" }
        // ];

        // Function to check combinations
        async function checkCombinations(input) {
            for (const combo of combinations) {
                const { fields, action } = combo;
                const match = fields.every(field => input[field] !== undefined); // Check if all fields in combo are present

                if (match) {
                    console.log(`${fields.join(', ')} present, by ${action}`);
                    return action; // Return action once found
                }
            }

            console.log('No matching combination found');
            return null; // Return null if no matching combination found
        }

        // Call the function to determine action
        const action = await checkCombinations(input);

        if (action) {
            console.log('Final Action:', action);
            const result = await this.byProfileAdvanced(input, action);
            console.log('Result:', result);
            return result; // Return result
        } else {
            console.log('No valid action found');
            return null; // Return null if no valid action found
        }
    } catch (error) {
        console.error('Error in nineParameterAdvanced:', error);
        throw error;
    }
};


exports.byProfileAdvanced = async(input, by) =>{
    try{
        //let batch = input;
        let updateQueryJson;
        console.log('input => ', input+' by => ', by);
        let getQueryJson;
        let uniqueArray = [];
        let resultData = [];
        let dataAll;

        const startDate = new Date(input.dateOfBirth);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 1);

        const startDateJ = new Date(input.dateOfJoining);
        const endDateJ = new Date(startDateJ);
        endDateJ.setDate(startDateJ.getDate() + 1);

        const startDateR = new Date(input.dateOfRetirement);
        const endDateR = new Date(startDateR);
        endDateR.setDate(startDateR.getDate() + 1);

        if(by == "dateOfBirth"
            || by == 'dobPos' || by == 'dobDep' || by == 'dobDes' ||
            by == 'dobPosDepDes'){
            console.log("if true - by ", by);
            const startDate = new Date(input.dateOfBirth); // Start of the day
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 1);
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                }
            } 
        }
        else if(by == "state"
            || by == "staPos" || by == "staDep" || by == "staDes" || 
            by == 'staPosDepDes'
        ){
                console.log("if true - by ", by);
                getQueryJson = {
                    state: input.state
                }
        }
        else if(by == "community"
            || by == "comPos" || by == "comDep" || by == "comDes" || 
            by == 'comPosDepDes'
        ){
                console.log("if true - by ", by);
                getQueryJson = {
                    community: input.community
                }
        }
        else if(by == "degree"
            || by == "degPos" || by == "degDep" || by == "degDes" || 
            by == 'degPosDepDes'
        ) {
            console.log("if true - by ", by);
            getQueryJson = {
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                }
            }
        }
        else if(by == "dateOfJoining"
            || by == "dojPos" || by == "dojDep" || by == "dojDes" || 
            by == 'dojPosDepDes'
        ){
            console.log("if true - by ", by);
            const startDate = new Date(input.dateOfJoining); // Start of the day
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 1);
            getQueryJson = {
                dateOfJoining: {
                    $gte: startDate,
                    $lt: endDate
                }
            } 
        }
        else if(by == "dateOfRetirement"
            || by == "dorPos" || by == "dorDep" || by == "dorDes" || 
            by == 'dorPosDepDes'
        ){
            console.log("if true - by ", by);
            const startDate = new Date(input.dateOfRetirement); // Start of the day
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 1);
                getQueryJson = {
                    dateOfRetirement: {
                        $gte: startDate,
                        $lt: endDate
                    }
                }
        }
        else if(by == "recruitmentType"
            || by == "recPos" || by == "recDep" || by == "recDes" || 
            by == 'recPosDepDes'
        ){
                console.log("if true - by ", by);
                getQueryJson = {
                    recruitmentType: input.recruitmentType
                }
        }

        else if(by == 'dobSta' ||
            by == 'dobStaPos' || by == 'dobStaDep' || by == 'dobStaDes'||
            by == 'dobStaPosDep' || by == 'dobStaPosDes' || by == 'dobStaDepDes' ||
            by == 'dobStaPosDepDes'){
            const startDate = new Date(input.dateOfBirth); // Start of the day
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 1);
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                    state: input.state
                } 
        }
        else if(by == 'dobCom' ||
        by == 'dobComPos'|| by == 'dobComPosDes' ||
        by == 'dobComPosDepDes'){
            const startDate = new Date(input.dateOfBirth); // Start of the day
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 1);
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                community: input.community
            } 
        }
        else if(by == 'dobComDeg' ||
        // by == 'dobComDegDoj' || by == 'dobComDegDor' || 
        by == 'dobComDegPos' || by == 'dobComDegDep' || by == 'dobComDegDes' ||
        by == 'comDegPosDep' || by == 'comDegPosDes' || by == 'comDegDepDes' ||
        by == 'dobComDegPosDep' || by == 'dobComDegPosDes' || by == 'dobComDegDepDes'
        ){
            const startDate = new Date(input.dateOfBirth); // Start of the day
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 1);
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                community: input.community
            } 
        }
        else if(by == 'dobComDoj' ||
            by == 'dobComDojPosDep' || by == 'dobComDojPosDes' || by == 'dobComDojDepDes'
        ){
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                community: input.community,
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
            } 
        }
        else if(by == 'dobComDegDor' ||
            by == 'dobComDegDorPos' || by == 'dobComDegDorDep' || by == 'dobComDegDorDes'
            ){
                getQueryJson = {
                    dateOfBirth: {
                        $gte: startDate,
                        $lt: endDate
                    },
                    community: input.community,
                    degreeData: {
                        $elemMatch: {
                            degree: input.degree
                        }
                    },
                    dateOfRetirement: {
                        $gte: startDateR,
                        $lt: endDateR
                    },
                } 
            }
            else if(by == 'dobComDegDorRec'
                ){
                    getQueryJson = {
                        dateOfBirth: {
                            $gte: startDate,
                            $lt: endDate
                        },
                        community: input.community,
                        degreeData: {
                            $elemMatch: {
                                degree: input.degree
                            }
                        },
                        dateOfRetirement: {
                            $gte: startDateR,
                            $lt: endDateR
                        },
                        recruitmentType: input.recruitmentType
                    } 
                }
        else if(by == 'dobComDojDor' ||
            by == 'dobComDojDorPos' || by == 'dobComDojDorDep' || by == 'dobComDojDorDes'
        ){
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                community: input.community,
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
            } 
        }
        else if(by == 'dobComDojDorRec'){
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                community: input.community,
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
                recruitmentType: input.recruitmentType
            } 
        }
        else if(by == 'dobComDojRec' || 
            by == 'dobComDojRecPos' || by == 'dobComDojRecDep' || by == 'dobComDojRecDes'
        ){
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                community: input.community,
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
                recruitmentType: input.recruitmentType
            } 
        }
        else if(by == 'dobComDegRec' ||
                by == 'dobComDegRecPos' || by == 'dobComDegRecDep' || by == 'dobComDegRecDes'
        ){
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                community: input.community,
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                recruitmentType: input.recruitmentType
            } 
        }
        else if(by == 'dobComDegDoj' ||
            by == 'dobComDegDojPos' || by == 'dobComDegDojDep'
        ){
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                community: input.community,
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
            } 
        }
        else if(by == 'dobComDegDojDor'){
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                community: input.community,
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
            } 
        }
        else if(by == 'dobComDegDojRec'){
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                community: input.community,
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
                recruitmentType: input.recruitmentType
            } 
        }
        else if(by == 'dobComDor' ||
            by == 'dobComDorPos' || by == 'dobComDorDep' || by == 'dobComDorDes' ||
            by == 'dobComDorPosDep' || by == 'dobComDorPosDes' || by == 'dobComDorDepDes'
        ){
            const startDate = new Date(input.dateOfBirth); // Start of the day
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 1);
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                community: input.community,
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                }
            } 
        }
        else if(by == 'dobComDorRec' || 
            by == 'dobComDorRecPos' || by == 'dobComDorRecDep' || by == 'dobComDorRecDes'
        ){
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                community: input.community,
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
                recruitmentType: input.recruitmentType
            } 
        }
        else if(by == 'dobComRec' ||
            by == 'dobComRecPos' || by == 'dobComRecDep' || by == 'dobComRecDes' ||
            by == 'dobComRecPosDep' || by == 'dobComRecPosDes' || by == 'dobComRecDepDes'
        ){
            const startDate = new Date(input.dateOfBirth); // Start of the day
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 1);
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                community: input.community,
                recruitmentType: input.recruitmentType
            } 
        }
        else if(by == 'dobDeg' ||
            by == 'dobDegPosDep' || by == 'dobDegPosDes' || by == 'dobDegDepDes' ||
            by == 'dobDegPosDepDes'
        ){
            const startDate = new Date(input.dateOfBirth); // Start of the day
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 1);
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
            } 
        }
        else if(by == 'dobDegDor' ||
                by == 'dobDegDorPosDep' || by == 'dobDegDorPosDes' || by == 'dobDegDorDepDes'
        ){
            const startDate = new Date(input.dateOfBirth); // Start of the day
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 1);
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
            } 
        }
        else if(by == 'dobDegDorRec' ||
            by == 'dobDegDorRecPos' || by == 'dobDegDorRecDep' || by == 'dobDegDorRecDes'
        ){
            const startDate = new Date(input.dateOfBirth); // Start of the day
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 1);
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
                recruitmentType: input.recruitmentType 
            } 
        }
        else if(by == 'dobDegDoj' ||
            // by == 'dobDegDojDor' || by == 'dobDegDojRec' || 
            by == 'dobDegDojPos' || by == 'dobDegDojDep' || by == 'dobDegDojDes' ||
            by == 'dobDegDojPosDep' || by == 'dobDegDojPosDes' || by == 'dobDegDojDepDes'
        ){
            const startDate = new Date(input.dateOfBirth); // Start of the day
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 1);
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
            } 
        }
        else if(by == 'dobDegDojDor' ||
            by == 'dobDegDojDorPos' || by == 'dobDegDojDorDep' || by == 'dobDegDojDorDes'
        ){
            const startDate = new Date(input.dateOfBirth); // Start of the day
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 1);
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
            } 
        }
        else if(by == 'dobDegDojDorRec'
        ){
            const startDate = new Date(input.dateOfBirth); // Start of the day
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 1);
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
                recruitmentType: input.recruitmentType
            } 
        }

        else if(by == 'dobDegDojRec' ||
            by == 'dobDegDojRecPos' || by == 'dobDegDojRecDep' || by == 'dobDegDojRecDes'
        ){
            const startDate = new Date(input.dateOfBirth); // Start of the day
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 1);
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
                recruitmentType: input.recruitmentType
            } 
        }
        else if(by == 'dobDegRec' ||
          by == 'dobDegRecPos' || by == 'dobDegRecDep' || by == 'dobDegRecDes' ||
          by == 'dobDegRecPosDep' || by == 'dobDegRecPosDes' || by == 'dobDegRecDepDes'
        ){
            const startDate = new Date(input.dateOfBirth); // Start of the day
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 1);
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                recruitmentType: input.recruitmentType
            } 
        }
        else if(by == 'dobDoj' ||
            by == 'dobDojPosDep' || by == 'dobDojPosDes' || by == 'dobDojDepDes' ||
            by == 'dobDojPosDepDes'
        ){
            const startDate = new Date(input.dateOfBirth); // Start of the day
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 1);
            const startDateJ = new Date(input.dateOfJoining); // Start of the day
            const endDateJ = new Date(startDateJ);
            endDateJ.setDate(startDateJ.getDate() + 1);
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
            } 
        }
        else if(by == 'dobDojDor' ||
            by == 'dobDojDorPos' || by == 'dobDojDorDep' || by == 'dobDojDorDes' ||
            by == 'dobDojDorPosDep' || by == 'dobDojDorPosDes' || by == 'dobDojDorDepDes'
            ){
            
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                }
            } 
        }
        else if(by == 'dobDojDorRec' ||
            by == 'dobDojDorRecPos' || by == 'dobDojDorRecDep' || by == 'dobDojDorRecDes'
        ){
            
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
                recruitmentType: input.recruitmentType
            } 
        }
        else if(by == 'dobDojRec' ||
            // by == 'dobDojDorRec' || 
            by == 'dobDojRecPos' || by == 'dobDojRecDep' || by == 'dobDojRecDes' 
            ){
            
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
                recruitmentType: input.recruitmentType
            } 
        }
        else if(by == 'dobDor' ||
            by == 'dobDorPosDep' || by == 'dobDorPosDes' || by == 'dobDorDepDes' ||
            by == 'dobDorPosDepDes'
        ){
            const startDate = new Date(input.dateOfBirth); // Start of the day
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 1);
            const startDateR = new Date(input.dateOfRetirement); // Start of the day
            const endDateR = new Date(startDateR);
            endDateR.setDate(startDateR.getDate() + 1);
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
            } 
        }
        else if(by == 'dobDorRec' ||
            by == 'dobDorRecPos' || by == 'dobDorRecDep' || by == 'dobDorRecDes' ||
            by == 'dorRecPosDep' || by == 'dorRecPosDes' || by == 'dorRecDepDes' ||
            by == 'dobDorRecPosDep' || by == 'dobDorRecPosDes' || by == 'dobDorRecDepDes'
        ){

            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
                recruitmentType: input.recruitmentType
            } 
        }

        else if(by == 'dobRec' || 
            by == 'dobRecPosDep' || by == 'dobRecPosDes' || by == 'dobRecDepDes' ||
            by == 'dobRecPosDepDes'
        ){
            const startDate = new Date(input.dateOfBirth); // Start of the day
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 1);
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                recruitmentType: input.recruitmentType
            } 
        }
        else if(by == "staCom" || 
            by == 'staComPosDep' || by == 'staComPosDes' || by == 'staComDepDes'
        ){
                console.log("if true - by ", by);
                getQueryJson = {
                    state: input.state,
                    community: input.community
                }
        }
        else if(by == "staDeg" ||
            by == 'staDegPosDep' || by == 'staDegPosDes' || by == 'staDegDepDes' ||
            by == 'staDegPosDepDes'
        ){
            console.log("if true - by ", by);
            getQueryJson = {
                state: input.state,
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                }
            }
        }
        else if(by == "staDoj" ||
            by == 'staDojPosDep' || by == 'staDojPosDes' || by == 'staDojDepDes' ||
            by == 'staDojPosDepDes'
        ){
            console.log("if true - by ", by);
            const startDateJ = new Date(input.dateOfJoining); // Start of the day
            const endDateJ = new Date(startDateJ);
            endDateJ.setDate(startDateJ.getDate() + 1);
            getQueryJson = {
                state: input.state,
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
            }
        }
        else if(by == "staDor" ||
            by == 'staDorPosDep' || by == 'staDorPosDes' || by == 'staDorDepDes' ||
            by == 'staDorPosDepDes'
        ){
            console.log("if true - by ", by);
            const startDateR = new Date(input.dateOfRetirement); // Start of the day
            const endDateR = new Date(startDateR);
            endDateR.setDate(startDateR.getDate() + 1);
            getQueryJson = {
                state: input.state,
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
            }
        }
        else if(by == "staRec" ||
            by == 'staRecPosDep' || by == 'staRecPosDes' || by == 'staRecDepDes' ||
            by == 'staRecPosDepDes'
        ){
            console.log("if true - by ", by);
            getQueryJson = {
                state: input.state,
                recruitmentType: input.recruitmentType
            }
        }
        else if(by == "comDeg" ||
            by == 'comDegPosDepDes'
        ){
                console.log("if true - by ", by);
                getQueryJson = {
                    community: input.community,
                    degreeData: {
                        $elemMatch: {
                            degree: input.degree
                        }
                    }
                }
        }
        else if(by == "comDoj" ||
            by == 'comDojPosDep' || by == 'comDojPosDes' || by == 'comDojDepDes' ||
            by == 'comDojPosDepDes'
        ){
            console.log("if true - by ", by);
            const startDateJ = new Date(input.dateOfJoining); // Start of the day
            const endDateJ = new Date(startDateJ);
            endDateJ.setDate(startDateJ.getDate() + 1);
            getQueryJson = {
                community: input.community,
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
            }
        }
        else if(by == "comDor" ||
            by == 'comDorPosDep' || by == 'comDorPosDes' || by == 'comDorDepDes' ||
            by == 'comDorPosDepDes'
        ){
            console.log("if true - by ", by);
            const startDateR = new Date(input.dateOfRetirement); // Start of the day
            const endDateR = new Date(startDateR);
            endDateR.setDate(startDateR.getDate() + 1);
            getQueryJson = {
                community: input.community,
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
            }
        }
        else if(by == "comRec" ||
            by == 'comRecPosDep' || by == 'comRecPosDes' || by == 'comRecDepDes' ||
            by == 'comRecPosDepDes'
        ){
            console.log("if true - by ", by);
            getQueryJson = {
                community: input.community,
                recruitmentType: input.recruitmentType
            }
        }
        else if(by == "degDoj" ||
            by == 'degDojPosDep' || by == 'degDojPosDes' || by == 'degDojDepDes' ||
            by == 'degDojPosDepDes'
        ){
            console.log("if true - by ", by);
            const startDateJ = new Date(input.dateOfJoining); // Start of the day
            const endDateJ = new Date(startDateJ);
            endDateJ.setDate(startDateJ.getDate() + 1);
            getQueryJson = {
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
            }
        }
        else if(by == "degDor" ||
            by == 'degDorPosDep' || by == 'degDorPosDes' || by == 'degDorDepDes' ||
            by == 'degDorPosDepDes'
        ){
            console.log("if true - by ", by);
            const startDateR = new Date(input.dateOfRetirement); // Start of the day
            const endDateR = new Date(startDateR);
            endDateR.setDate(startDateR.getDate() + 1);
            getQueryJson = {
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
            }
        }
        else if(by == "degRec" ||
            by == 'degRecPosDep' || by == 'degRecPosDes' || by == 'degRecDepDes' ||
            by == 'degRecPosDepDes'
        ){
            console.log("if true - by ", by);
            getQueryJson = {
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                recruitmentType: input.recruitmentType
            }
        }
        else if(by == "dojDor" ||
            by == 'dojDorPosDep' || by == 'dojDorPosDes' || by == 'dojDorDepDes' ||
            by == 'dojDorPosDepDes'
        ){
            console.log("if true - by ", by);
            const startDateJ = new Date(input.dateOfJoining); // Start of the day
            const endDateJ = new Date(startDateJ);
            endDateJ.setDate(startDateJ.getDate() + 1);
            const startDateR = new Date(input.dateOfRetirement); // Start of the day
            const endDateR = new Date(startDateR);
            endDateR.setDate(startDateR.getDate() + 1);
            getQueryJson = {
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
            }
        }
        else if(by == "dojRec" ||
            by == 'dojRecPosDep' || by == 'dojRecPosDes' || by == 'dojRecDepDes' ||
            by == 'dojRecPosDepDes'
        ){
            console.log("if true - by ", by);
            const startDateJ = new Date(input.dateOfJoining); // Start of the day
            const endDateJ = new Date(startDateJ);
            endDateJ.setDate(startDateJ.getDate() + 1);
            getQueryJson = {
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
                recruitmentType: input.recruitmentType
            }
        }
        else if(by == "dorRec"){
            console.log("if true - by ", by);
            const startDateR = new Date(input.dateOfRetirement); // Start of the day
            const endDateR = new Date(startDateR);
            endDateR.setDate(startDateR.getDate() + 1);
            getQueryJson = {
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
                recruitmentType: input.recruitmentType
            }
        }
        else if (by === 'dobStaCom'|| 
            by == 'dobStaComPos' || by == 'dobStaComDep' || by == 'dobStaComDes' ||
            by == 'dobStaComPosDep' || by == 'dobStaComPosDes' || by == 'dobStaComDepDes'
        ) {
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                state: input.state,
                community: input.community
            };
        } 
        else if (by === 'dobStaComDeg' || 
            by == 'dobStaComDegPos' || by == 'dobStaComDegDep' || by == 'dobStaComDegDes'
        ) {
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                state: input.state,
                community: input.community,
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
            };
        } 
        else if (by === 'dobStaComDegDoj'
        ) {
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                state: input.state,
                community: input.community,
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
            };
        }
        else if (by === 'dobStaComDegDor'
        ) {
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                state: input.state,
                community: input.community,
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
            };
        }
        else if (by === 'dobStaComDegRec'
        ) {
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                state: input.state,
                community: input.community,
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                recruitmentType: input.recruitmentType
            };
        }
        else if (by === 'dobStaComDoj' ||
            by == 'dobStaComDojPos' || by == 'dobStaComDojDep' || by == 'dobStaComDojDes' ||
            by == 'staComDojPosDep' || by == 'staComDojPosDes' || by == 'staComDojDepDes'
        ) {
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                state: input.state,
                community: input.community,
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
            };
        } 
        else if (by === 'dobStaComDojDor'
        ) {
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                state: input.state,
                community: input.community,
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
            };
        }
        else if (by === 'dobStaComDojRec'
        ) {
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                state: input.state,
                community: input.community,
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
                recruitmentType: input.recruitmentType
            };
        } 
        else if (by === 'dobStaComDor' ||
            by == 'dobStaComDorPos' || by == 'dobStaComDorDep' || by == 'dobStaComDorDes'
        ) {
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                state: input.state,
                community: input.community,
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
            };
        } 
        else if (by === 'dobStaComDorRec' 
        ) {
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                state: input.state,
                community: input.community,
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
                recruitmentType: input.recruitmentType
            };
        }
        else if (by === 'dobStaComRec' ||
            by == 'dobStaComRecPos' || by == 'dobStaComRecDep' || by == 'dobStaComRecDes'
        ) {
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                state: input.state,
                community: input.community,
                recruitmentType: input.recruitmentType
            };
        } 
        else if (by === 'dobStaDeg'|| 
            by == 'dobStaDegPos' || by == 'dobStaDegDep' || by == 'dobStaDegDes' ||
            by == 'dobStaDegPosDep' || by == 'dobStaDegPosDes' || by == 'dobStaDegDepDes' 
        ) {
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                state: input.state,
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                }
            };
        }
        else if (by === 'dobStaDegDoj' ||
            by == 'dobStaDegDojPos' || by == 'dobStaDegDojDep' || by == 'dobStaDegDojDes'
        ) {
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                state: input.state,
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
            };
        }
        else if (by === 'dobStaDegDojDor'
        ) {
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                state: input.state,
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
            };
        }
        else if (by === 'dobStaDegDojRec'
        ) {
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                state: input.state,
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
                recruitmentType: input.recruitmentType
            };
        }
        else if (by === 'dobStaDegDor' ||
            by == 'dobStaDegDorPos' || by == 'dobStaDegDorDep' || by == 'dobStaDegDorDes'
        ) {
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                state: input.state,
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
            };
        }
        else if (by === 'dobStaDegDorRec'
        ) {
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                state: input.state,
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
                recruitmentType: input.recruitmentType
            };
        }
        else if (by === 'dobStaDegRec' ||
            by == 'dobStaDegRecPos' || by == 'dobStaDegRecDep' || by == 'dobStaDegRecDes'
        ) {
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                state: input.state,
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                recruitmentType: input.recruitmentType
            };
        }
        else if (by === 'dobStaDoj'||
           by == 'dobStaDojPos' || by == 'dobStaDojDep' || by == 'dobStaDojDes' ||
           by == 'dobStaDojPosDep' || by == 'dobStaDojPosDes' || by == 'dobStaDojDepDes'
        ) {
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                state: input.state,
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
            };
        }
        else if (by == 'dobStaDojDor' ||
            by == 'dobStaDojDorPos' || by == 'dobStaDojDorDep' || by == 'dobStaDojDorDes' 
        ) {
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                state: input.state,
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
            };
        }
        else if (by === 'dobStaDojDorRec'
        ) {
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                state: input.state,
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
                recruitmentType: input.recruitmentType
            };
        }
        else if (by === 'dobStaDojRec' ||
            by == 'dobStaDojRecPos' || by == 'dobStaDojRecDep' || by == 'dobStaDojRecDes'
        ) {
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                state: input.state,
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
                recruitmentType: input.recruitmentType
            };
        }
        else if (by === 'dobStaDor'||
           by == 'dobStaDorPos' || by == 'dobStaDorDep' || by == 'dobStaDorDes' ||
           by == 'dobStaDorPosDep' || by == 'dobStaDorPosDes' || by == 'dobStaDorDepDes'
        ) {
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                state: input.state,
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                }
            };
        }
        else if (by === 'dobStaDorRec' ||
            by == 'dobStaDorRecPos' || by == 'dobStaDorRecDep' || by == 'dobStaDorRecDes'
            ) {
                getQueryJson = {
                    dateOfBirth: {
                        $gte: startDate,
                        $lt: endDate
                    },
                    state: input.state,
                    dateOfRetirement: {
                        $gte: startDateR,
                        $lt: endDateR
                    },
                    recruitmentType: input.recruitmentType
                };
            }
        else if (by === 'dobStaRec'|| 
           by == 'dobStaRecPos' || by == 'dobStaRecDep' || by == 'dobStaRecDes' ||
            by == 'dobStaRecPosDep' || by == 'dobStaRecPosDes' || by == 'dobStaRecDepDes'
        ) {
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                state: input.state,
                recruitmentType: input.recruitmentType
            };
        }
        else if (by === 'staComDeg' ||
            by == 'staComDegPos' || by == 'staComDegDep' || by == 'staComDegDes' ||
            by == 'staComDegPosDep' || by == 'staComDegPosDes' || by == 'staComDegDepDes'
        ) {
            getQueryJson = {
                state: input.state,
                community: input.community,
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                }
            };
        } 
        else if (by === 'staComDegDoj' ||
                by == 'staComDegDojPos' || by == 'staComDegDojDep' || by == 'staComDegDojDes'
        ) {
            getQueryJson = {
                state: input.state,
                community: input.community,
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
            };
        }
        else if (by === 'staComDegDojDor'
    ) {
        getQueryJson = {
            state: input.state,
            community: input.community,
            degreeData: {
                $elemMatch: {
                    degree: input.degree
                }
            },
            dateOfJoining: {
                $gte: startDateJ,
                $lt: endDateJ
            },
            dateOfRetirement: {
                $gte: startDateR,
                $lt: endDateR
            },
        };
    }
    else if (by === 'staComDegDojRec'
    ) {
        getQueryJson = {
            state: input.state,
            community: input.community,
            degreeData: {
                $elemMatch: {
                    degree: input.degree
                }
            },
            dateOfJoining: {
                $gte: startDateJ,
                $lt: endDateJ
            },
            recruitmentType: input.recruitmentType
        };
    }
        else if (by === 'staComDegDojDor'
        ) {
            getQueryJson = {
                state: input.state,
                community: input.community,
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
            };
        }
        else if (by === 'staComDegDojRec'
        ) {
            getQueryJson = {
                state: input.state,
                community: input.community,
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
            };
        }
        else if (by === 'staComDegDor' || 
            by == 'staComDegDorPos' || by == 'staComDegDorDep' || by == 'staComDegDorDes'
        ) {
            getQueryJson = {
                state: input.state,
                community: input.community,
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
            };
        }
        else if (by === 'staComDegDorRec'
        ) {
            getQueryJson = {
                state: input.state,
                community: input.community,
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
                recruitmentType: input.recruitmentType
            };
        }
        
        else if (by === 'staComDegRec' ||
            by == 'staComDegRecPos' || by == 'staComDegRecDep' || by == 'staComDegRecDes'
        ) {
            getQueryJson = {
                state: input.state,
                community: input.community,
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                recruitmentType: input.recruitmentType
            };
        }
        
        else if (by === 'staComDoj'||
            by == 'staComDojPos' || by == 'staComDojDep' || by == 'staComDojDes'
        ) {
            getQueryJson = {
                state: input.state,
                community: input.community,
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                }
            };
        } 
        else if (by === 'staComDojDor' ||
            by == 'staComDojDorPos' || by == 'staComDojDorDep' || by == 'staComDojDorDes'
        ) {
            getQueryJson = {
                state: input.state,
                community: input.community,
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
            };
        }
        else if (by === 'staComDojDorRec'
        ) {
            getQueryJson = {
                state: input.state,
                community: input.community,
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
                recruitmentType: input.recruitmentType
            };
        }
        
        else if (by === 'staComDojRec' ||
            by == 'staComDojRecPos' || by == 'staComDojRecDep' || by == 'staComDojRecDes'
        ) {
            getQueryJson = {
                state: input.state,
                community: input.community,
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
                recruitmentType: input.recruitmentType
            };
        }

        else if (by === 'staComDor' ||
            // by == 'staComDorRec' ||
            by == 'staComDorPos' || by == 'staComDorDep' || by == 'staComDorDes' ||
            by == 'staComDorPosDep' || by == 'staComDorPosDes' || by == 'staComDorDepDes'
        ) {
            getQueryJson = {
                state: input.state,
                community: input.community,
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                }
            };
        }
        else if (by === 'staComDorRec' ||
            by == 'staComDorRecPos' || by == 'staComDorRecDep' || by == 'staComDorRecDes'
        ) {
            getQueryJson = {
                state: input.state,
                community: input.community,
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
                recruitmentType: input.recruitmentType
            };
        }
        else if (by === 'staComRec' ||
            by == 'staComRecPos' || by == 'staComRecDep' || by == 'staComRecDes' ||
            by == 'staComRecPosDep' || by == 'staComRecPosDes' || by == 'staComRecDepDes'
        ) {
            getQueryJson = {
                state: input.state,
                community: input.community,
                recruitmentType: input.recruitmentType
            };
        } else if (by === 'staComPos') {
            getQueryJson = {
                state: input.state,
                community: input.community,
            };
        } else if (by === 'staComDep') {
            getQueryJson = {
                state: input.state,
                community: input.community,
            };
        } else if (by === 'staComDes') {
            getQueryJson = {
                state: input.state,
                community: input.community,
            };
        } else if (by === 'staDegDoj' || 
            by == 'staDegDojPos' ||
            by == 'staDegDojPos' || by == 'staDegDojDep' || by == 'staDegDojDes' ||
            by == 'staDegDoj'
        ) {
            getQueryJson = {
                state: input.state,
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                }
            };
        } 
        else if (by === 'staDegDojDor' ||
                by == 'staDegDojDorPos' || by == 'staDegDojDorDep' || by == 'staDegDojDorDes'
        ) {
            getQueryJson = {
                state: input.state,
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
            };
        }
        else if (by === 'staDegDojDorRec'
    ) {
        getQueryJson = {
            state: input.state,
            degreeData: {
                $elemMatch: {
                    degree: input.degree
                }
            },
            dateOfJoining: {
                $gte: startDateJ,
                $lt: endDateJ
            },
            dateOfRetirement: {
                $gte: startDateR,
                $lt: endDateR
            },
            recruitmentType: input.recruitmentType
        };
    }
        
        else if (by === 'staDegDojRec' || 
            by == 'staDegDojRecPos' || by == 'staDegDojRecDep' || by == 'staDegDojRecDes'
        ) {
            getQueryJson = {
                state: input.state,
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
                recruitmentType: input.recruitmentType
            };
        }
        else if (by === 'staDegDor' ||
            // by == 'staDegDorRec' || 
            by == 'staDegDorPos' || by == 'staDegDorDep' || by == 'staDegDorDes' ||
            by == 'staDegDorPosDep' || by == 'staDegDorPosDes' || by == 'staDegDorDepDes'
        ) {
            getQueryJson = {
                state: input.state,
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                }
            };
        } 
        else if (by === 'staDegDorRec' ||
            by == 'staDegDorRecPos' || by == 'staDegDorRecDep' || by == 'staDegDorRecDes'
        ) {
            getQueryJson = {
                state: input.state,
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
                recruitmentType: input.recruitmentType
            };
        }
        else if (by === 'staDegRec' ||
            by == 'staDegRecPos' || by == 'staDegRecDep' || by == 'staDegRecDes' ||
            by == 'staDegRecPosDep' || by == 'staDegRecPosDes' || by == 'staDegRecDepDes'
        ) {
            getQueryJson = {
                state: input.state,
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                recruitmentType: input.recruitmentType
            };
        } else if (by === 'staDegPos' ||
            by == 'staDegPosDep' || by == 'staDegPosDes'
        ) {
            getQueryJson = {
                state: input.state,
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
            };
        } else if (by === 'staDegDep' ||
            by == 'staDegDepDes'
        ) {
            getQueryJson = {
                state: input.state,
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
            };
        } else if (by === 'staDegDes') {
            getQueryJson = {
                state: input.state,
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
            };
        } else if (by === 'staDojDor' ||
            // by == 'staDojDorRec' || 
            by == 'staDojDorPos' || by == 'staDojDorDep' || by == 'staDojDorDes' ||
            by == 'staDojDorPosDep' || by == 'staDojDorPosDes' || by == 'staDojDorDepDes'
        ) {
            getQueryJson = {
                state: input.state,
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                }
            };
        } 
        else if (by === 'staDojDorRec' ||
            by == 'staDojDorRecPos' || by == 'staDojDorRecDep' || by == 'staDojDorRecDes'
        ) {
            getQueryJson = {
                state: input.state,
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
                recruitmentType: input.recruitmentType
            };
        } 
        else if (by === 'staDojRec' || 
            by == 'staDojRecPos' || by == 'staDojRecDep' || by == 'staDojRecDes' ||
            by == 'staDojRecPosDep' || by == 'staDojRecPosDes' || by == 'staDojRecDepDes'
        ) {
            getQueryJson = {
                state: input.state,
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
                recruitmentType: input.recruitmentType
            };
        } else if (by === 'staDojPos') {
            getQueryJson = {
                state: input.state,
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
            };
        } else if (by === 'staDojDep') {
            getQueryJson = {
                state: input.state,
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
                
            };
        } else if (by === 'staDojDes') {
            getQueryJson = {
                state: input.state,
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
            };
        } else if (by === 'staDorRec' ||
            by == 'staDorRecPos' || by == 'staDorRecDep' || by == 'staDorRecDes' ||
            by == 'staDorRecPosDep' || by == 'staDorRecPosDes' || by == 'staDorRecDepDes'
        ) {
            getQueryJson = {
                state: input.state,
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
                recruitmentType: input.recruitmentType
            };
        } else if (by === 'staDorPos') {
            getQueryJson = {
                state: input.state,
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
            };
        } else if (by === 'staDorDep') {
            getQueryJson = {
                state: input.state,
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
            };
        } else if (by === 'staDorDes') {
            getQueryJson = {
                state: input.state,
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
            };
        } else if (by === 'staRecPos') {
            getQueryJson = {
                state: input.state,
                recruitmentType: input.recruitmentType,
            };
        } else if (by === 'staRecDep') {
            getQueryJson = {
                state: input.state,
                recruitmentType: input.recruitmentType,
            };
        } else if (by === 'staRecDes') {
            getQueryJson = {
                state: input.state,
                recruitmentType: input.recruitmentType,
            };
        } else if (by === 'staPosDep') {
            getQueryJson = {
                state: input.state,
            };
        } else if (by === 'staPosDes') {
            getQueryJson = {
                state: input.state,
            };
        } else if (by === 'staDepDes') {
            getQueryJson = {
                state: input.state,
            };
        } else if (by === 'comDegDoj' ||
            by == 'comDegDojPos' || by == 'comDegDojDep' || by == 'comDegDojDes' ||
            by == 'comDegDojPosDep' || by == 'comDegDojPosDes' || by == 'comDegDojDepDes'
        ) {
            getQueryJson = {
                community: input.community,
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                }
            };
        } 
        else if (by === 'comDegDojDor' ||
            by == 'comDegDojDorPos' || by == 'comDegDojDorDep' || by == 'comDegDojDorDes'
        ) {
            getQueryJson = {
                community: input.community,
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
            };
        }
        else if (by === 'comDegDojDorRec'
        ) {
            getQueryJson = {
                community: input.community,
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
                recruitmentType: input.recruitmentType
            };
        }
        else if (by === 'comDegDojRec' ||
                by == 'comDegDojRecPos' || by == 'comDegDojRecDep' || by == 'comDegDojRecDes'
        ) {
            getQueryJson = {
                community: input.community,
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
                recruitmentType: input.recruitmentType
            };
        }
        else if (by === 'comDegDor' ||
            // by == 'comDegDorRec' || 
            by == 'comDegDorPos' || by == 'comDegDorDep' || by == 'comDegDorDes' ||
            by == 'comDegDorPosDep' || by == 'comDegDorPosDes' || by == 'comDegDorDepDes'
        ) {
            getQueryJson = {
                community: input.community,
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                }
            };
        } 
        else if (by === 'comDegDorRec' ||
            by == 'comDegDorRecPos' || by == 'comDegDorRecDep' || by == 'comDegDorRecDes'
        ) {
            getQueryJson = {
                community: input.community,
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
                recruitmentType: input.recruitmentType
            };
        }
        else if (by === 'comDegRec' ||
            by == 'comDegRecPos' || by == 'comDegRecDep' || by == 'comDegRecDes' ||
            by == 'comDegRecPosDep' || by == 'comDegRecPosDes' || by == 'comDegRecDepDes'
        ) {
            getQueryJson = {
                community: input.community,
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                recruitmentType: input.recruitmentType
            };
        } else if (by === 'comDegPos' ||
            by == 'comDegPosDep' || by == 'comDegPosDes'
        ) {
            getQueryJson = {
                community: input.community,
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
            };
        } else if (by === 'comDegDep' ||
            by == 'comDegDepDes'
        ) {
            getQueryJson = {
                community: input.community,
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
            };
        } else if (by === 'comDegDes') {
            getQueryJson = {
                community: input.community,
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
            };
        } else if (by === 'comDojDor' ||
            // by == 'comDojDorRec' ||
            by == 'comDojDorPos' || by == 'comDojDorDep' || by == 'comDojDorDes' ||
            by == 'comDojDorPosDep' || by == 'comDojDorPosDes' || by == 'comDojDorDepDes'
        ) {
            getQueryJson = {
                community: input.community,
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                }
            };
        } 
        else if (by === 'comDojDorRec' ||
            by == 'comDojDorRecPos' || by == 'comDojDorRecDep' || by == 'comDojDorRecDes'
        ) {
            getQueryJson = {
                community: input.community,
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
                recruitmentType: input.recruitmentType
            };
        }
        else if (by === 'comDojRec' ||
            by == 'comDojRecPos' || by == 'comDojRecDep' || by == 'comDojRecDes' ||
            by == 'comDojRecPosDep' || by == 'comDojRecPosDes' || by == 'comDojRecDepDes'
        ) {
            getQueryJson = {
                community: input.community,
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
                recruitmentType: input.recruitmentType
            };
        } else if (by === 'comDojPos' || 
            by == 'comDojPosDep' || by == 'comDojPosDes'
        ) {
            getQueryJson = {
                community: input.community,
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
            };
        } else if (by === 'comDojDep' ||
            by == 'comDojDepDes'
        ) {
            getQueryJson = {
                community: input.community,
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
            };
        } else if (by === 'comDojDes') {
            getQueryJson = {
                community: input.community,
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
            };
        } else if (by === 'comDorRec' ||
            by == 'comDorRecPos' || by == 'comDorRecDep' || by == 'comDorRecDes' ||
            by == 'comDorRecPosDep' || by == 'comDorRecPosDes' || by == 'comDorRecDepDes'
        ) {
            getQueryJson = {
                community: input.community,
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
                recruitmentType: input.recruitmentType
            };
        } else if (by === 'comDorPos') {
            getQueryJson = {
                community: input.community,
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
            };
        } else if (by === 'comDorDep') {
            getQueryJson = {
                community: input.community,
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
            };
        } else if (by === 'comDorDes') {
            getQueryJson = {
                community: input.community,
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
            };
        } else if (by === 'comRecPos') {
            getQueryJson = {
                community: input.community,
                recruitmentType: input.recruitmentType,
            };
        } else if (by === 'comRecDep') {
            getQueryJson = {
                community: input.community,
                recruitmentType: input.recruitmentType,
            };
        } else if (by === 'comRecDes') {
            getQueryJson = {
                community: input.community,
                recruitmentType: input.recruitmentType,
            };
        } else if (by === 'comPosDep') {
            getQueryJson = {
                community: input.community,
            };
        } else if (by === 'comPosDes') {
            getQueryJson = {
                community: input.community,
            };
        } else if (by === 'comDepDes') {
            getQueryJson = {
                community: input.community,
            };
        } else if (by === 'degDojDor' ||
            // by == 'degDojDorRec' || 
            by == 'degDojDorPos' || by == 'degDojDorDep' || by == 'degDojDorDes' ||
            by == 'degDojDorPosDep' || by == 'degDojDorPosDes' || by == 'degDojDorDepDes' 
        ) {
            getQueryJson = {
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                }
            };
        } 
        else if (by === 'degDojDorRec' ||
            by == 'degDojDorRecPos' || by == 'degDojDorRecDep' || by == 'degDojDorRecDes'
        ) {
            getQueryJson = {
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
                recruitmentType: input.recruitmentType
            };
        }
        else if (by === 'degDojRec' ||
            by == 'degDojRecPos' || by == 'degDojRecDep' || by == 'degDojRecDes' ||
            by == 'degDojRecPosDep' || by == 'degDojRecPosDes' || by == 'degDojRecDepDes'
        ) {
            getQueryJson = {
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
                recruitmentType: input.recruitmentType
            };
        } else if (by === 'degDojPos') {
            getQueryJson = {
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
            };
        } else if (by === 'degDojDep') {
            getQueryJson = {
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
            };
        } else if (by === 'degDojDes') {
            getQueryJson = {
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
            };
        } else if (by === 'degDorRec' ||
            by == 'degDorRecPos' || by == 'degDorRecDep' || by == 'degDorRecDes' ||
            by == 'degDorRecPosDep' || by == 'degDorRecPosDes' || by == 'degDorRecDepDes'
        ) {
            getQueryJson = {
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
                recruitmentType: input.recruitmentType
            };
        } else if (by === 'degDorPos') {
            getQueryJson = {
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
            };
        } else if (by === 'degDorDep') {
            getQueryJson = {
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
            };
        } else if (by === 'degDorDes') {
            getQueryJson = {
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
            };
        } else if (by === 'degRecPos') {
            getQueryJson = {
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                recruitmentType: input.recruitmentType,
            };
        } else if (by === 'degRecDep') {
            getQueryJson = {
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                recruitmentType: input.recruitmentType,
            };
        } else if (by === 'degRecDes') {
            getQueryJson = {
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                recruitmentType: input.recruitmentType,
            };
        } else if (by === 'degPosDep') {
            getQueryJson = {
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
            };
        } else if (by === 'degPosDes') {
            getQueryJson = {
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
            };
        } else if (by === 'degDepDes') {
            getQueryJson = {
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
            };
        } else if (by === 'dojDorRec' ||
            by == 'dojDorRecPos' || by == 'dojDorRecDep' || by == 'dojDorRecDes' ||
            by == 'dojDorRecPosDep' || by == 'dojDorRecPosDes' || by == 'dojDorRecDepDes'
        ) {
            getQueryJson = {
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
                recruitmentType: input.recruitmentType
            };
        } else if (by === 'dojDorPos') {
            getQueryJson = {
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
            };
        } else if (by === 'dojDorDep') {
            getQueryJson = {
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
            };
        } else if (by === 'dojDorDes') {
            getQueryJson = {
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
            };
        } else if (by === 'dojRecPos') {
            getQueryJson = {
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
                recruitmentType: input.recruitmentType,
            };
        } else if (by === 'dojRecDep') {
            getQueryJson = {
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
                recruitmentType: input.recruitmentType,
            };
        } else if (by === 'dojRecDes') {
            getQueryJson = {
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
                recruitmentType: input.recruitmentType,
            };
        } else if (by === 'dojPosDep') {
            getQueryJson = {
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
            };
        } else if (by === 'dojPosDes') {
            getQueryJson = {
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
            };
        } else if (by === 'dojDepDes') {
            getQueryJson = {
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
            };
        } else if (by === 'dorRecPos') {
            getQueryJson = {
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
                recruitmentType: input.recruitmentType,
            };
        } else if (by === 'dorRecDep') {
            getQueryJson = {
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
                recruitmentType: input.recruitmentType,
            };
        } else if (by === 'dorRecDes') {
            getQueryJson = {
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
                recruitmentType: input.recruitmentType,
            };
        } else if (by === 'dorPosDep') {
            getQueryJson = {
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
            };
        } else if (by === 'dorPosDes') {
            getQueryJson = {
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
            };
        } else if (by === 'dorDepDes') {
            getQueryJson = {
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
            };
        } else if (by === 'recPosDep') {
            getQueryJson = {
                recruitmentType: input.recruitmentType,
            };
        } else if (by === 'recPosDes') {
            getQueryJson = {
                recruitmentType: input.recruitmentType,
            };
        } else if (by === 'recDepDes') {
            getQueryJson = {
                recruitmentType: input.recruitmentType,
            };
        }
        ////nine params
        else if(by == 'dobStaComDegDojDorRecPosDep' || by == 'dobStaComDegDojDorRecPosDes' || by == 'dobStaComDegDojDorRecDepDes'){
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                state: input.state,
                community: input.community,
                degreeData: {
                $elemMatch: {
                    degree: input.degree
                    }
                },
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
                recruitmentType: input.recruitmentType,
            };
        }
        else if(by == 'dobStaComDegDojDorPosDepDes'){
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                state: input.state,
                community: input.community,
                degreeData: {
                $elemMatch: {
                    degree: input.degree
                    }
                },
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
            };
        }
        else if(by == 'dobStaComDegDojRecPosDepDes'){
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                state: input.state,
                community: input.community,
                degreeData: {
                $elemMatch: {
                    degree: input.degree
                    }
                },
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
                recruitmentType: input.recruitmentType,
            };
        }
        else if(by == 'dobStaComDegDorRecPosDepDes'){
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                state: input.state,
                community: input.community,
                degreeData: {
                $elemMatch: {
                    degree: input.degree
                    }
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
                recruitmentType: input.recruitmentType,
            };
        }
        else if(by == 'dobStaComDojDorRecPosDepDes'){
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                state: input.state,
                community: input.community,
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
                recruitmentType: input.recruitmentType,
            };
        }
        else if(by == 'dobStaDegDojDorRecPosDepDes'){
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                state: input.state,
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                        }
                    },
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
                recruitmentType: input.recruitmentType,
            };
        }
        else if(by == 'dobComDegDojDorRecPosDepDes'){
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                community: input.community,
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                        }
                    },
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
                recruitmentType: input.recruitmentType,
            };
        }
        else if(by == 'staComDegDojDorRecPosDepDes'){
            getQueryJson = {
                state: input.state,
                community: input.community,
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                        }
                    },
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
                recruitmentType: input.recruitmentType,
            };
        }
        else if(by == 'ten'){
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                state: input.state,
                community: input.community,
                degreeData: {
                $elemMatch: {
                    degree: input.degree
                    }
                },
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                },
                recruitmentType: input.recruitmentType,
            };
        }
        console.log(getQueryJson);
        if(by == "dateOfBirth" || by == "dateOfJoining" || by == "dateOfRetirement" ||
        by == "community" || by == "recruitmentType" || by == "state"  || by == "degree" || 
        
        by == "dobSta" || by == "dobCom" || by == "dobDeg"|| 
        by == "dobPos"|| by == "dobDep" || by == "dobDes" || by == "staPos" || by == "staDep" ||
        by == "staDes" || by == "comPos" || by == "comDep" || by == "comDes" || by == "degPos" ||
        by == "degDep"|| by == "degDes" || by == "dojPos" || by == "dojDep" || by == "dojDes" ||
        by == "dorPos" || by == "dorDep" || by == "dorDes" || by == "recPos" || by == "recDep" || 
        by == "recDes" || by == "dobSta" || by == "dobCom" || by == "dobDeg" || by == "dobDoj" ||
        by == "dobDor" || by == "dobRec" || by == "staCom" || by == "staDeg" || by == "staDoj" ||
        by == "staDor" || by == "staRec" || by == "comDeg" || by == "comDoj" || by == "comDor" ||
        by == "comRec" || by == "degDoj" || by == "degDor" || by == "degRec" || by == "dojDor" ||
        by == "dojRec" || by == "dorRec" ||
        by == "dobStaCom" || by == "dobStaDeg" || by == "dobStaDoj" ||by == "dobStaDor" ||
        by == "dobStaRec" || by == "dobStaPos" || by == "dobStaDep" || by == "dobStaDes" || by == "dobComDeg" ||
        by == "dobComDoj" || by == "dobComDor" || by == "dobComRec" || by == "dobComPos" || by == "dobComDep" ||
        by == "dobComDes" || by == "dobDegDoj" || by == "dobDegDor" || by == "dobDegRec" || by == "dobDegPos" ||
        by == "dobDegDep" || by == "dobDegDes" || by == "dobDojDor" || by == "dobDojRec" || by == "dobDojPos" ||
        by == "dobDojDep" || by == "dobDojDes" || by == "dobDorRec" || by == "dobDorPos" || by == "dobDorDep" ||
        by == "dobDorDes" || by == "dobRecPos" || by == "dobRecDep" || by == "dobRecDes" || by == "dobPosDep" ||
        by == "dobPosDes" || by == "dobDepDes" || by == "staComDeg" || by == "staComDoj" || by == "staComDor" ||
        by == "staComRec" || by == "staComPos" || by == "staComDep" || by == "staComDes" || by == "staDegDoj" ||
        by == "staDegDor" || by == "staDegRec" || by == "staDegPos" || by == "staDegDep" || by == "staDegDes" ||
        by == "staDojDor" || by == "staDojRec" || by == "staDojPos" ||
        by == "staDojDep" || by == "staDojDes" || by == "staDorRec" || by == "staDorPos" || 
        by == "staDorDep" || by == "staDorDes" ||
        by == "staRecPos" || by == "staRecDep" || by == "staRecDes" || by == "staPosDep" || 
        by == "staPosDes" || by == "staDepDes" ||
        by == "comDegDoj" || by == "comDegDor" || by == "comDegRec" || by == "comDegPos" ||
        by == "comDegDep" || by == "comDegDes" ||
        by == "comDojDor" || by == "comDojRec" || by == "comDojPos" || by == "comDojDep" ||
        by == "comDojDes" || by == "comDorRec" || by == "comDorPos" || by == "comDorDep" ||
        by == "comDorDes" || by == "comRecPos" || by == "comRecDep" || by == "comRecDes" ||
        by == "comPosDep" || by == "comPosDes" || by == "comDepDes" || by == "degDojDor" || 
        by == "degDojRec" || by == "degDojPos" || by == "degDojDep" || by == "degDojDes" ||
        by == "degDorRec" || by == "degDorPos" ||
        by == "degDorDep" || by == "degDorDes" || by == "degRecPos" ||
        by == "degRecDep" || by == "degRecDes" || by == "degPosDep" || by == "degPosDes" ||
        by == "degDepDes" || by == "dojDorRec" || by == "dojDorPos" || by == "dojDorDep" || 
        by == "dojDorDes" || by == "dojRecPos" || by == "dojRecDep" || by == "dojRecDes" || 
        by == "dojPosDep" || by == "dojPosDes" || by == "dojDepDes" || by == "dorRecPos" || 
        by == "dorRecDep" || by == "dorRecDes" || by == "dorPosDep" || 
        by == "dorPosDes" || by == "dorDepDes" || by == "recPosDep" || by == "recPosDes" || 
        by == "recDepDes" ||
        by == 'dobStaComDeg' || by == 'dobStaComDoj' || by == 'dobStaComDor' || by == 'dobStaComRec' ||
        by == 'dobStaComPos' || by == 'dobStaComDep' || by == 'dobStaComDes' || by == 'dobStaDegDoj' ||
        by == 'Dor' || by == 'dobStaDegRec' || by == 'dobStaDegPos' || by == 'dobStaDegDep' ||
        by == 'dobStaDegDes' || by == 'dobStaDojDor' || by == 'dobStaDojRec' || by == 'dobStaDojPos' ||
        by == 'dobStaDojDep' || by == 'dobStaDojDes' || by == 'dobStaDorRec' || by == 'dobStaDorPos' ||
        by == 'dobStaDorDep' || by == 'dobStaDorDes' || by == 'dobStaRecPos' || by == 'dobStaRecDep' ||
        by == 'dobStaRecDes' || by == 'dobStaPosDep' || by == 'dobStaPosDes' || by == 'dobStaDepDes' ||
        by == 'dobComDegDoj' || by == 'dobComDegDor' || by == 'dobComDegRec' || by == 'dobComDegPos' ||
        by == 'dobComDegDep' || by == 'dobComDegDes' || by == 'dobComDojDor' || by == 'dobComDojRec' ||
        by == 'dobComDojPos' || by == 'dobComDojDep' || by == 'dobComDojDes' || by == 'dobComDorRec' ||
        by == 'dobComDorPos' || by == 'dobComDorDep' || by == 'dobComDorDes' || by == 'dobComRecPos' ||
        by == 'dobComRecDep' || by == 'dobComRecDes' || by == 'dobComPosDep' || by == 'dobComPosDes' ||
        by == 'dobComDepDes' || by == 'dobDegDojDor' || by == 'dobDegDojRec' || by == 'dobDegDojPos' ||
        by == 'dobDegDojDep' || by == 'dobDegDojDes' || by == 'dobDegDorRec' || by == 'dobDegDorPos' ||
        by == 'dobDegDorDep' || by == 'dobDegDorDes' || by == 'dobDegRecPos' || by == 'dobDegRecDep' ||
        by == 'dobDegRecDes' || by == 'dobDegPosDep' || by == 'dobDegPosDes' || by == 'dobDegDepDes' ||
        by == 'dobDojDorRec' || by == 'dobDojDorPos' || by == 'dobDojDorDep' || by == 'dobDojDorDes' ||
        by == 'dobDojRecPos' || by == 'dobDojRecDep' || by == 'dobDojRecDes' || by == 'dobDojPosDep' ||
        by == 'dobDojPosDes' || by == 'dobDojDepDes' || by == 'dobDorRecPos' || by == 'dobDorRecDep' || 
        by == 'dobDorRecDes' || by == 'dobDorPosDep' || by == 'dobDorPosDes' || by == 'dobDorDepDes' ||
        by == 'dobRecPosDep' || by == 'dobRecPosDes' || by == 'dobRecDepDes' || by == 'dobPosDepDes' ||

        by == 'staComDegDoj' || by == 'staComDegDor' || by == 'staComDegRec' || by == 'staComDegPos' ||
        by == 'staComDegDep' || by == 'staComDegDes' || by == 'staComDojDor' || by == 'staComDojRec' ||
        by == 'staComDojPos' || by == 'staComDojDep' || by == 'staComDojDes' || by == 'staComDorRec' ||
        by == 'staComDorPos' || by == 'staComDorDep' || by == 'staComDorDes' || by == 'staComRecPos' ||
        by == 'staComRecDep' || by == 'staComRecDes' || by == 'staComPosDep' || by == 'staComPosDes' ||
        by == 'staComDepDes' || by == 'staDegDojDor' || by == 'staDegDojRec' || by == 'staDegDojPos' ||
        by == 'staDegDojDep' || by == 'staDegDojDes' || by == 'staDegDorRec' || by == 'staDegDorPos' ||
        by == 'staDegDorDep' || by == 'staDegDorDes' || by == 'staDegRecPos' || by == 'staDegRecDep' ||
        by == 'staDegRecDes' || by == 'staDegPosDep' || by == 'staDegPosDes' || by == 'staDegDepDes' ||
        by == 'staDojDorRec' || by == 'staDojDorPos' || by == 'staDojDorDep' || by == 'staDojDorDes' ||
        by == 'staDojRecPos' || by == 'staDojRecDep' || by == 'staDojRecDes' || by == 'staDojPosDep' ||
        by == 'staDojPosDes' || by == 'staDojDepDes' || by == 'staDorRecPos' || by == 'staDorRecDep' ||
        by == 'staDorRecDes' || by == 'staDorPosDep' || by == 'staDorPosDes' || by == 'staDorDepDes' ||
        by == 'staRecPosDep' || by == 'staRecPosDes' || by == 'staRecDepDes' || by == 'staPosDepDes' ||

        by == 'comDegDojDor' || by == 'comDegDojRec' || by == 'comDegDojPos' || by == 'comDegDojDep' ||
        by == 'comDegDojDes' || by == 'comDegDorRec' || by == 'comDegDorPos' || by == 'comDegDorDep' ||
        by == 'comDegDorDes' || by == 'comDegRecPos' || by == 'comDegRecDep' || by == 'comDegRecDes' ||
        by == 'comDegPosDep' || by == 'comDegPosDes' || by == 'comDegDepDes' || by == 'comDojDorRec' ||
        by == 'comDojDorPos' || by == 'comDojDorDep' || by == 'comDojDorDes' || by == 'comDojRecPos' ||
        by == 'comDojRecDep' || by == 'comDojRecDes' || by == 'comDojPosDep' || by == 'comDojPosDes' ||
        by == 'comDojDepDes' || by == 'comDorRecPos' || by == 'comDorRecDep' || by == 'comDorRecDes' ||
        by == 'comDorPosDep' || by == 'comDorPosDes' || by == 'comDorDepDes' || by == 'comRecPosDep' ||
        by == 'comRecPosDes' || by == 'comRecDepDes' || by == 'comPosDepDes' ||

        by == 'degDojDorRec' || by == 'degDojDorPos' || by == 'degDojDorDep' || by == 'degDojDorDes' ||
        by == 'degDojRecPos' || by == 'degDojRecDep' || by == 'degDojRecDes' || by == 'degDojPosDep' || 
        by == 'degDojPosDes' || by == 'degDojDepDes' || by == 'degDorRecPos' || by == 'degDorRecDep' || 
        by == 'degDorRecDes' || by == 'degDorPosDep' || by == 'degDorPosDes' || by == 'degDorDepDes' || 
        by == 'degRecPosDep' || by == 'degRecPosDes' || by == 'degRecDepDes' || by == 'degPosDepDes' || 
        
        by == 'dojDorRecPos' || by == 'dojDorRecDep' || by == 'dojDorRecDes' || by == 'dojDorPosDep' || 
        by == 'dojDorPosDes' || by == 'dojDorDepDes' || by == 'dojRecPosDep' || by == 'dojRecPosDes' || 
        by == 'dojRecDepDes' || by == 'dojPosDepDes' ||
        
        by == 'dorRecPosDep' || by == 'dorRecPosDes' || by == 'dorRecDepDes' || by == 'dorPosDepDes' ||
        
        by == 'recPosDepDes' ||

        ///////nine params
        by == "dobStaComDegDojDorRecPosDep" || by == "dobStaComDegDojDorRecPosDes" || by == "dobStaComDegDojDorRecDepDes" ||
        by == "dobStaComDegDojDorPosDepDes" || by == "dobStaComDegDojRecPosDepDes" || by == "dobStaComDegDorRecPosDepDes" || 
        by == "dobStaComDojDorRecPosDepDes" || by == "dobStaDegDojDorRecPosDepDes" || by == "dobComDegDojDorRecPosDepDes" ||
        by == "staComDegDojDorRecPosDepDes" ||

        by == 'ten'

    )
            data = await employeeProfile.find(getQueryJson).sort({ dateOfJoining: 'asc' }).exec();
        else if(by == "department" || by == "postingIn" || by == "designation" || 
            by == "posDep" || by == "posDes" || by == "DepDes"|| by == "posDepDes")
            data = await employeeProfile.find().sort({ dateOfJoining: 'asc' }).exec();
        // else if(by == "degree")
        //     data = await employeeProfile.find(
                
        // ).sort({ dateOfJoining: 'asc' }).exec();
        console.log("data returned from employeeProfile ", data);
        for(let employee of data){
            console.log('for data => ', employee);
            updateQueryJson = {
                empId: employee._id
            }
            console.log('updateQueryJson ', updateQueryJson);
            if(by == "dateOfBirth" || by == "dateOfJoining" || by == "dateOfRetirement" ||
                by == "community" || by == "recruitmentType" || by == "state"  || by == "degree" ||
                
                ///////two params
                by == "dobSta" || by == "dobCom" || by == "dobDeg"|| 
                by == "dobPos"|| by == "dobDep" || by == "dobDes" || by == "staPos" || by == "staDep" ||
                by == "staDes" || by == "comPos" || by == "comDep" || by == "comDes" || by == "degPos" ||
                by == "degDep"|| by == "degDes" || by == "dojPos" || by == "dojDep" || by == "dojDes" ||
                by == "dorPos" || by == "dorDep" || by == "dorDes" || by == "recPos" || by == "recDep" || 
                by == "recDes" || by == "dobSta" || by == "dobCom" || by == "dobDeg" || by == "dobDoj" ||
                by == "dobDor" || by == "dobRec" || by == "staCom" || by == "staDeg" || by == "staDoj" ||
                by == "staDor" || by == "staRec" || by == "comDeg" || by == "comDoj" || by == "comDor" ||
                by == "comRec" || by == "degDoj" || by == "degDor" || by == "degRec" || by == "dojDor" ||
                by == "dojRec" || by == "dorRec" ||

                ////////three params
                by == "dobStaCom" || by == "dobStaDeg" || by == "dobStaDoj" ||by == "dobStaDor" ||
                by == "dobStaRec" || by == "dobStaPos" || by == "dobStaDep" || by == "dobStaDes" || by == "dobComDeg" ||
                by == "dobComDoj" || by == "dobComDor" || by == "dobComRec" || by == "dobComPos" || by == "dobComDep" ||
                by == "dobComDes" || by == "dobDegDoj" || by == "dobDegDor" || by == "dobDegRec" || by == "dobDegPos" ||
                by == "dobDegDep" || by == "dobDegDes" || by == "dobDojDor" || by == "dobDojRec" || by == "dobDojPos" ||
                by == "dobDojDep" || by == "dobDojDes" || by == "dobDorRec" || by == "dobDorPos" || by == "dobDorDep" ||
                by == "dobDorDes" || by == "dobRecPos" || by == "dobRecDep" || by == "dobRecDes" || by == "dobPosDep" ||
                by == "dobPosDes" || by == "dobDepDes" || by == "staComDeg" || by == "staComDoj" || by == "staComDor" ||
                by == "staComRec" || by == "staComPos" || by == "staComDep" || by == "staComDes" || by == "staDegDoj" ||
                by == "staDegDor" || by == "staDegRec" || by == "staDegPos" || by == "staDegDep" || by == "staDegDes" ||
                by == "staDojDor" || by == "staDojRec" || by == "staDojPos" ||
                by == "staDojDep" || by == "staDojDes" || by == "staDorRec" || by == "staDorPos" || 
                by == "staDorDep" || by == "staDorDes" ||
                by == "staRecPos" || by == "staRecDep" || by == "staRecDes" || by == "staPosDep" || 
                by == "staPosDes" || by == "staDepDes" ||
                by == "comDegDoj" || by == "comDegDor" || by == "comDegRec" || by == "comDegPos" ||
                by == "comDegDep" || by == "comDegDes" ||
                by == "comDojDor" || by == "comDojRec" || by == "comDojPos" || by == "comDojDep" ||
                by == "comDojDes" || by == "comDorRec" || by == "comDorPos" || by == "comDorDep" ||
                by == "comDorDes" || by == "comRecPos" || by == "comRecDep" || by == "comRecDes" ||
                by == "comPosDep" || by == "comPosDes" || by == "comDepDes" || by == "degDojDor" || 
                by == "degDojRec" || by == "degDojPos" || by == "degDojDep" || by == "degDojDes" ||
                by == "degDorRec" || by == "degDorPos" ||
                by == "degDorDep" || by == "degDorDes" || by == "degRecPos" ||
                by == "degRecDep" || by == "degRecDes" || by == "degPosDep" || by == "degPosDes" ||
                by == "degDepDes" || by == "dojDorRec" || by == "dojDorPos" || by == "dojDorDep" || 
                by == "dojDorDes" || by == "dojRecPos" || by == "dojRecDep" || by == "dojRecDes" || 
                by == "dojPosDep" || by == "dojPosDes" || by == "dojDepDes" || by == "dorRecPos" || 
                by == "dorRecDep" || by == "dorRecDes" || by == "dorPosDep" || 
                by == "dorPosDes" || by == "dorDepDes" || by == "recPosDep" || by == "recPosDes" || 
                by == "recDepDes" ||

                /////// four params
                by == 'dobStaComDeg' || by == 'dobStaComDoj' || by == 'dobStaComDor' || by == 'dobStaComRec' ||
                by == 'dobStaComPos' || by == 'dobStaComDep' || by == 'dobStaComDes' || by == 'dobStaDegDoj' ||
                by == 'dobStaDegDor' || by == 'dobStaDegRec' || by == 'dobStaDegPos' || by == 'dobStaDegDep' ||
                by == 'dobStaDegDes' || by == 'dobStaDojDor' || by == 'dobStaDojRec' || by == 'dobStaDojPos' ||
                by == 'dobStaDojDep' || by == 'dobStaDojDes' || by == 'dobStaDorRec' || by == 'dobStaDorPos' ||
                by == 'dobStaDorDep' || by == 'dobStaDorDes' || by == 'dobStaRecPos' || by == 'dobStaRecDep' ||
                by == 'dobStaRecDes' || by == 'dobStaPosDep' || by == 'dobStaPosDes' || by == 'dobStaDepDes' ||
                by == 'dobComDegDoj' || by == 'dobComDegDor' || by == 'dobComDegRec' || by == 'dobComDegPos' ||
                by == 'dobComDegDep' || by == 'dobComDegDes' || by == 'dobComDojDor' || by == 'dobComDojRec' ||
                by == 'dobComDojPos' || by == 'dobComDojDep' || by == 'dobComDojDes' || by == 'dobComDorRec' ||
                by == 'dobComDorPos' || by == 'dobComDorDep' || by == 'dobComDorDes' || by == 'dobComRecPos' ||
                by == 'dobComRecDep' || by == 'dobComRecDes' || by == 'dobComPosDep' || by == 'dobComPosDes' ||
                by == 'dobComDepDes' || by == 'dobDegDojDor' || by == 'dobDegDojRec' || by == 'dobDegDojPos' ||
                by == 'dobDegDojDep' || by == 'dobDegDojDes' || by == 'dobDegDorRec' || by == 'dobDegDorPos' ||
                by == 'dobDegDorDep' || by == 'dobDegDorDes' || by == 'dobDegRecPos' || by == 'dobDegRecDep' ||
                by == 'dobDegRecDes' || by == 'dobDegPosDep' || by == 'dobDegPosDes' || by == 'dobDegDepDes' ||
                by == 'dobDojDorRec' || by == 'dobDojDorPos' || by == 'dobDojDorDep' || by == 'dobDojDorDes' ||
                by == 'dobDojRecPos' || by == 'dobDojRecDep' || by == 'dobDojRecDes' || by == 'dobDojPosDep' ||
                by == 'dobDojPosDes' || by == 'dobDojDepDes' || by == 'dobDorRecPos' || by == 'dobDorRecDep' || 
                by == 'dobDorRecDes' || by == 'dobDorPosDep' || by == 'dobDorPosDes' || by == 'dobDorDepDes' ||
                by == 'dobRecPosDep' || by == 'dobRecPosDes' || by == 'dobRecDepDes' || by == 'dobPosDepDes' ||

                by == 'staComDegDoj' || by == 'staComDegDor' || by == 'staComDegRec' || by == 'staComDegPos' ||
                by == 'staComDegDep' || by == 'staComDegDes' || by == 'staComDojDor' || by == 'staComDojRec' ||
                by == 'staComDojPos' || by == 'staComDojDep' || by == 'staComDojDes' || by == 'staComDorRec' ||
                by == 'staComDorPos' || by == 'staComDorDep' || by == 'staComDorDes' || by == 'staComRecPos' ||
                by == 'staComRecDep' || by == 'staComRecDes' || by == 'staComPosDep' || by == 'staComPosDes' ||
                by == 'staComDepDes' || by == 'staDegDojDor' || by == 'staDegDojRec' || by == 'staDegDojPos' ||
                by == 'staDegDojDep' || by == 'staDegDojDes' || by == 'staDegDorRec' || by == 'staDegDorPos' ||
                by == 'staDegDorDep' || by == 'staDegDorDes' || by == 'staDegRecPos' || by == 'staDegRecDep' ||
                by == 'staDegRecDes' || by == 'staDegPosDep' || by == 'staDegPosDes' || by == 'staDegDepDes' ||
                by == 'staDojDorRec' || by == 'staDojDorPos' || by == 'staDojDorDep' || by == 'staDojDorDes' ||
                by == 'staDojRecPos' || by == 'staDojRecDep' || by == 'staDojRecDes' || by == 'staDojPosDep' ||
                by == 'staDojPosDes' || by == 'staDojDepDes' || by == 'staDorRecPos' || by == 'staDorRecDep' ||
                by == 'staDorRecDes' || by == 'staDorPosDep' || by == 'staDorPosDes' || by == 'staDorDepDes' ||
                by == 'staRecPosDep' || by == 'staRecPosDes' || by == 'staRecDepDes' || by == 'staPosDepDes' ||

                by == 'comDegDojDor' || by == 'comDegDojRec' || by == 'comDegDojPos' || by == 'comDegDojDep' ||
                by == 'comDegDojDes' || by == 'comDegDorRec' || by == 'comDegDorPos' || by == 'comDegDorDep' ||
                by == 'comDegDorDes' || by == 'comDegRecPos' || by == 'comDegRecDep' || by == 'comDegRecDes' ||
                by == 'comDegPosDep' || by == 'comDegPosDes' || by == 'comDegDepDes' || by == 'comDojDorRec' ||
                by == 'comDojDorPos' || by == 'comDojDorDep' || by == 'comDojDorDes' || by == 'comDojRecPos' ||
                by == 'comDojRecDep' || by == 'comDojRecDes' || by == 'comDojPosDep' || by == 'comDojPosDes' ||
                by == 'comDojDepDes' || by == 'comDorRecPos' || by == 'comDorRecDep' || by == 'comDorRecDes' ||
                by == 'comDorPosDep' || by == 'comDorPosDes' || by == 'comDorDepDes' || by == 'comRecPosDep' ||
                by == 'comRecPosDes' || by == 'comRecDepDes' || by == 'comPosDepDes' ||

                by == 'degDojDorRec' || by == 'degDojDorPos' || by == 'degDojDorDep' || by == 'degDojDorDes' ||
                by == 'degDojRecPos' || by == 'degDojRecDep' || by == 'degDojRecDes' || by == 'degDojPosDep' || 
                by == 'degDojPosDes' || by == 'degDojDepDes' || by == 'degDorRecPos' || by == 'degDorRecDep' || 
                by == 'degDorRecDes' || by == 'degDorPosDep' || by == 'degDorPosDes' || by == 'degDorDepDes' || 
                by == 'degRecPosDep' || by == 'degRecPosDes' || by == 'degRecDepDes' || by == 'degPosDepDes' || 
                
                by == 'dojDorRecPos' || by == 'dojDorRecDep' || by == 'dojDorRecDes' || by == 'dojDorPosDep' || 
                by == 'dojDorPosDes' || by == 'dojDorDepDes' || by == 'dojRecPosDep' || by == 'dojRecPosDes' || 
                by == 'dojRecDepDes' || by == 'dojPosDepDes' ||
                
                by == 'dorRecPosDep' || by == 'dorRecPosDes' || by == 'dorRecDepDes' || by == 'dorPosDepDes' ||
                
                by == 'recPosDepDes' ||

                ////five params
                by == 'dobStaComDegDoj' || by == 'dobStaComDegDor' || by == 'dobStaComDegRec' || by == 'dobStaComDegPos' ||
                by == 'dobStaComDegDep' || by == 'dobStaComDegDes' || by == 'dobStaComDojDor' || by == 'dobStaComDojRec' ||
                by == 'dobStaComDojPos' || by == 'dobStaComDojDep' || by == 'dobStaComDojDes' || by == 'dobStaComDorRec' ||
                by == 'dobStaComDorPos' || by == 'dobStaComDorDep' || by == 'dobStaComDorDes' || by == 'dobStaComRecPos' ||
                by == 'dobStaComRecDep' || by == 'dobStaComRecDes' || by == 'dobStaComPosDep' || by == 'dobStaComPosDes' ||
                by == 'dobStaComDepDes' || by == 'dobStaDegDojDor' || by == 'dobStaDegDojRec' || by == 'dobStaDegDojPos' ||
                by == 'dobStaDegDojDep' || by == 'dobStaDegDojDes' || by == 'dobStaDegDorRec' || by == 'dobStaDegDorPos' ||
                by == 'dobStaDegDorDep' || by == 'dobStaDegDorDes' || by == 'dobStaDegRecPos' || by == 'dobStaDegRecDep' ||
                by == 'dobStaDegRecDes' || by == 'dobStaDegPosDep' || by == 'dobStaDegPosDes' || by == 'dobStaDegDepDes' ||
                by == 'dobStaDojDorRec' || by == 'dobStaDojDorPos' || by == 'dobStaDojDorDep' || by == 'dobStaDojDorDes' ||
                by == 'dobStaDojRecPos' || by == 'dobStaDojRecDep' || by == 'dobStaDojRecDes' || by == 'dobStaDojPosDep' ||
                by == 'dobStaDojPosDes' || by == 'dobStaDojDepDes' || by == 'dobStaDorRecPos' || by == 'dobStaDorRecDep' ||
                by == 'dobStaDorRecDes' || by == 'dobStaDorPosDep' || by == 'dobStaDorPosDes' || by == 'dobStaDorDepDes' ||
                by == 'dobStaRecPosDep' || by == 'dobStaRecPosDes' || by == 'dobStaRecDepDes' || by == 'dobStaPosDepDes' ||
                by == 'dobComDegDojDor' || by == 'dobComDegDojRec' || by == 'dobComDegDojPos' || by == 'dobComDegDojDep' ||
                by == 'dobComDegDorRec' || by == 'dobComDegDorPos' || by == 'dobComDegDorDep' || by == 'dobComDegDorDes' ||
                by == 'dobComDegRecPos' || by == 'dobComDegRecDep' || by == 'dobComDegRecDes' || by == 'dobComDegPosDep' ||
                by == 'dobComDegPosDes' || by == 'dobComDegDepDes' || by == 'dobComDojDorRec' || by == 'dobComDojDorPos' ||
                by == 'dobComDojDorDep' || by == 'dobComDojDorDes' || by == 'dobComDojRecPos' || by == 'dobComDojRecDep' ||
                by == 'dobComDojRecDes' || by == 'dobComDojPosDep' || by == 'dobComDojPosDes' || by == 'dobComDojDepDes' ||
                by == 'dobComDorRecPos' || by == 'dobComDorRecDep' || by == 'dobComDorRecDes' || by == 'dobComDorPosDep' ||
                by == 'dobComDorPosDes' || by == 'dobComDorDepDes' || by == 'dobComRecPosDep' || by == 'dobComRecPosDes' ||
                by == 'dobComRecDepDes' || by == 'dobComPosDepDes' || by == 'dobDegDojDorRec' || by == 'dobDegDojDorPos' ||
                by == 'dobDegDojDorDep' || by == 'dobDegDojDorDes' || by == 'dobDegDojRecPos' || by == 'dobDegDojRecDep' ||
                by == 'dobDegDojRecDes' || by == 'dobDegDojPosDep' || by == 'dobDegDojPosDes' || by == 'dobDegDojDepDes' ||
                by == 'dobDegDorRecPos' || by == 'dobDegDorRecDep' || by == 'dobDegDorRecDes' || by == 'dobDegDorPosDep' ||
                by == 'dobDegDorPosDes' || by == 'dobDegDorDepDes' || by == 'dobDegRecPosDep' || by == 'dobDegRecPosDes' ||
                by == 'dobDegRecDepDes' || by == 'dobDegPosDepDes' || by == 'dobDojDorRecPos' || by == 'dobDojDorRecDep' ||
                by == 'dobDojDorRecDes' || by == 'dobDojDorPosDep' || by == 'dobDojDorPosDes' || by == 'dobDojDorDepDes' ||
                by == 'dobDojRecPosDep' || by == 'dobDojRecPosDes' || by == 'dobDojRecDepDes' || by == 'dobDojPosDepDes' ||
                by == 'dobDorRecPosDep' || by == 'dobDorRecPosDes' || by == 'dobDorRecDepDes' || by == 'dobDorPosDepDes' ||
                by == 'dobRecPosDepDes' || by == 'staComDegDojDor' || by == 'staComDegDojRec' || by == 'staComDegDojPos' ||
                by == 'staComDegDojDep' || by == 'staComDegDojDes' || by == 'staComDegDorRec' || by == 'staComDegDorPos' ||
                by == 'staComDegDorDep' || by == 'staComDegDorDes' || by == 'staComDegRecPos' || by == 'staComDegRecDep' ||
                by == 'staComDegRecDes' || by == 'staComDegPosDep' || by == 'staComDegPosDes' || by == 'staComDegDepDes' ||
                by == 'staComDojDorRec' || by == 'staComDojDorPos' || by == 'staComDojDorDep' || by == 'staComDojDorDes' ||
                by == 'staComDojRecPos' || by == 'staComDojRecDep' || by == 'staComDojRecDes' || by == 'staComDojPosDep' ||
                by == 'staComDojPosDes' || by == 'staComDojDepDes' || by == 'staComDorRecPos' || by == 'staComDorRecDep' ||
                by == 'staComDorRecDes' || by == 'staComDorPosDep' || by == 'staComDorPosDes' || by == 'staComDorDepDes' ||
                by == 'staComRecPosDep' || by == 'staComRecPosDes' || by == 'staComRecDepDes' || by == 'staComPosDepDes' ||
                by == 'staDegDojDorRec' || by == 'staDegDojDorPos' || by == 'staDegDojDorDep' || by == 'staDegDojDorDes' ||
                by == 'staDegDojRecPos' || by == 'staDegDojRecDep' || by == 'staDegDojRecDes' || by == 'staDegDojPosDep' ||
                by == 'staDegDojPosDes' || by == 'staDegDojDepDes' || by == 'staDegDorRecPos' || by == 'staDegDorRecDep' ||
                by == 'staDegDorRecDes' || by == 'staDegDorPosDep' || by == 'staDegDorPosDes' || by == 'staDegDorDepDes' ||
                by == 'staDegRecPosDep' || by == 'staDegRecPosDes' || by == 'staDegRecDepDes' || by == 'staDegPosDepDes' ||
                by == 'staDojDorRecPos' || by == 'staDojDorRecDep' || by == 'staDojDorRecDes' || by == 'staDojDorPosDep' ||
                by == 'staDojDorPosDes' || by == 'staDojDorDepDes' || by == 'staDojRecPosDep' || by == 'staDojRecPosDes' ||
                by == 'staDojRecDepDes' || by == 'staDojPosDepDes' || by == 'staDorRecPosDep' || by == 'staDorRecPosDes' ||
                by == 'staDorRecDepDes' || by == 'staDorPosDepDes' || by == 'staRecPosDepDes' || by == 'comDegDojDorRec' ||
                by == 'comDegDojDorPos' || by == 'comDegDojDorDep' || by == 'comDegDojDorDes' || by == 'comDegDojRecPos' ||
                by == 'comDegDojRecDep' || by == 'comDegDojRecDes' || by == 'comDegDojPosDep' || by == 'comDegDojPosDes' ||
                by == 'comDegDojDepDes' || by == 'comDegDorRecPos' || by == 'comDegDorRecDep' || by == 'comDegDorRecDes' ||
                by == 'comDegDorPosDep' || by == 'comDegDorPosDes' || by == 'comDegDorDepDes' || by == 'comDegRecPosDep' ||
                by == 'comDegRecPosDes' || by == 'comDegRecDepDes' || by == 'comDegPosDepDes' || by == 'comDojDorRecPos' ||
                by == 'comDojDorRecDep' || by == 'comDojDorRecDes' || by == 'comDojDorPosDep' || by == 'comDojDorPosDes' ||
                by == 'comDojDorDepDes' || by == 'comDojRecPosDep' || by == 'comDojRecPosDes' || by == 'comDojRecDepDes' ||
                by == 'comDojPosDepDes' || by == 'comDorRecPosDep' || by == 'comDorRecPosDes' || by == 'comDorRecDepDes' ||
                by == 'comDorPosDepDes' || by == 'comRecPosDepDes' || by == 'degDojDorRecPos' || by == 'degDojDorRecDep' ||
                by == 'degDojDorRecDes' || by == 'degDojDorPosDep' || by == 'degDojDorPosDes' || by == 'degDojDorDepDes' ||
                by == 'degDojRecPosDep' || by == 'degDojRecPosDes' || by == 'degDojRecDepDes' || by == 'degDojPosDepDes' ||
                by == 'degDorRecPosDep' || by == 'degDorRecPosDes' || by == 'degDorRecDepDes' || by == 'degDorPosDepDes' ||
                by == 'degRecPosDepDes' || by == 'dojDorRecPosDep' || by == 'dojDorRecPosDes' || by == 'dojDorRecDepDes' ||
                by == 'dojDorPosDepDes' || by == 'dojRecPosDepDes' ||

                ///////nine params
                by == "dobStaComDegDojDorRecPosDep" || by == "dobStaComDegDojDorRecPosDes" || by == "dobStaComDegDojDorRecDepDes" ||
                by == "dobStaComDegDojDorPosDepDes" || by == "dobStaComDegDojRecPosDepDes" || by == "dobStaComDegDorRecPosDepDes" || 
                by == "dobStaComDojDorRecPosDepDes" || by == "dobStaDegDojDorRecPosDepDes" || by == "dobComDegDojDorRecPosDepDes" ||
                by == "staComDegDojDorRecPosDepDes" ||
                
                by == 'ten'

            ){
                    dataAll = {
                        personalEmail: employee.personalEmail,
                        _id: employee._id,
                        fullName: employee.fullName,
                        gender: employee.gender,
                        dateOfBirth: employee.dateOfBirth,
                        dateOfJoining: employee.dateOfJoining,
                        dateOfRetirement: employee.dateOfRetirement,
                        state: employee.state,
                        batch: employee.batch,
                        recruitmentType: employee.recruitmentType,
                        serviceStatus: employee.serviceStatus,
                        qualification1: employee.qualification1,
                        qualification2: employee.qualification2,
                        community: employee.community,
                        degreeData: employee.degreeData,
                        caste: employee.caste,
                        religion: employee.religion,
                        promotionGrade: employee.promotionGrade,
                        payscale: employee.payscale,
                        officeEmail: employee.officeEmail,
                        mobileNo1: employee.mobileNo1,
                        mobileNo2: employee.mobileNo2,
                        mobileNo3: employee.mobileNo3,
                        addressLine: employee.addressLine,
                        city: employee.city,
                        pincode: employee.pincode,
                        employeeId: employee.employeeId,
                        ifhrmsId: employee.ifhrmsId,
                        //photo: employee.photo,
                        imagePath: employee.imagePath,
                    }
                }
            
            console.log('dataAll ', dataAll);
            uniqueArray = await this.getEmployeeUpdateFilter(updateQueryJson);
            console.log('length ==> ', uniqueArray.length);
            if(uniqueArray.length > 0){
                console.log('len ', uniqueArray.length);
                for(let transferOrPostingEmployeesList of uniqueArray[0].transferOrPostingEmployeesList){
                    console.log('Check ', transferOrPostingEmployeesList.empProfileId._id.toString(), employee._id.toString());
                    if(transferOrPostingEmployeesList.empProfileId._id.toString() === employee._id.toString()){
                        console.log('Matched ');
                        dataAll = {
                            toPostingInCategoryCode: transferOrPostingEmployeesList.toPostingInCategoryCode,
                            toDepartmentId: transferOrPostingEmployeesList.toDepartmentId,
                            toDesignationId: transferOrPostingEmployeesList.toDesignationId,
                            postTypeCategoryCode: transferOrPostingEmployeesList.postTypeCategoryCode,
                            locationChangeCategoryId: transferOrPostingEmployeesList.locationChangeCategoryId,
                            remarks: uniqueArray[0].remarks,
                            updateType: uniqueArray[0].updateType,
                            orderTypeCategoryCode: uniqueArray[0].orderTypeCategoryCode,
                            orderNumber: uniqueArray[0].orderNumber,
                            orderForCategoryCode: uniqueArray[0].orderForCategoryCode,
                            dateOfOrder: uniqueArray[0].dateOfOrder,
                            personalEmail: employee.personalEmail,
                            _id: employee._id,
                            fullName: employee.fullName,
                            gender: employee.gender,
                            dateOfBirth: employee.dateOfBirth,
                            dateOfJoining: employee.dateOfJoining,
                            dateOfRetirement: employee.dateOfRetirement,
                            state: employee.state,
                            batch: employee.batch,
                            recruitmentType: employee.recruitmentType,
                            serviceStatus: employee.serviceStatus,
                            qualification1: employee.qualification1,
                            qualification2: employee.qualification2,
                            community: employee.community,
                            degreeData: employee.degreeData,
                            caste: employee.caste,
                            religion: employee.religion,
                            promotionGrade: employee.promotionGrade,
                            payscale: employee.payscale,
                            officeEmail: employee.officeEmail,
                            mobileNo1: employee.mobileNo1,
                            mobileNo2: employee.mobileNo2,
                            mobileNo3: employee.mobileNo3,
                            addressLine: employee.addressLine,
                            city: employee.city,
                            pincode: employee.pincode,
                            employeeId: employee.employeeId,
                            ifhrmsId: employee.ifhrmsId,
                            //photo: employee.photo,
                            imagePath: employee.imagePath,
                        }

                        /////
                        ////
                        if(by == 'postingIn' || 
                            by == 'recPos' || by == "dobPos" || by == "staPos" || by == "comPos" ||
                            by == "degPos" || by == "dojPos" || by == "dorPos" || 
                            by == 'dobStaPos' || by == 'dobComPos'  || by == 'dobDojPos' || by == 'dobDorPos' ||
                            by == 'dobRecPos' || by == 'staComPos' || by == 'staDojPos' || by == 'dobDegPos' ||
                            by == 'staDorPos' || by == 'staRecPos' || by == 'comDojPos' || by == 'staDegPos' ||
                            by == 'comDorPos' || by == 'comRecPos' || by == 'degDojPos' || by == 'degDorPos' ||
                            by == 'degRecPos' || by == 'dojDorPos' || by == 'dojRecPos' || by == 'comDegPos' ||
                            by == 'dorRecPos' || by == 'dorRecPos' || by == 'dojRecPos' || by == 'dojDorPos' ||
                            by == 'dobStaComPos' || by == 'dobStaDegPos' ||
                            by == 'dobStaDojPos' || by == 'dobStaDorPos' || by == 'dobStaRecPos' || by == 'dobComDegPos' ||
                            by == 'dobComDojPos' || by == 'dobComDorPos' || by == 'dobComRecPos' || by == 'dobDegDojPos' ||
                            by == 'dobDegDorPos' || by == 'dobDegRecPos' || by == 'dobDojDorPos' || by == 'dobDojRecPos' || 
                            by == 'dobDorRecPos' || by == 'staComDegPos' || by == 'staComDojPos' || by == 'staComDorPos' ||
                            by == 'staComRecPos' || by == 'staDegDojPos' || by == 'staDegDorPos' || by == 'staDegRecPos' ||
                            by == 'staDojDorPos' || by == 'staDojRecPos' || by == 'staDorRecPos' || by == 'comDegDojPos' ||
                            by == 'comDegDorPos' || by == 'comDegRecPos' || by == 'comDojDorPos' || by == 'comDojRecPos' || 
                            by == 'comDorRecPos' || by == 'degDojDorPos' || by == 'degDojRecPos' || by == 'degDorRecPos' ||
                            by == 'dojDorRecPos'||
                            by == 'dobStaComDegPos' || by == 'dobStaComRecPos' || by == 'dobStaComDojPos' || by == 'dobStaComDorPos' ||
                            by == 'dobStaDegDojPos' || by == 'dobStaDegDorPos' || by == 'dobStaDojDorPos' || by == 'dobStaDojRecPos' ||
                            by == 'dobStaDorRecPos' || by == 'dobComDegDojPos' || by == 'dobComDegDorPos' || by == 'dobComDegRecPos' ||
                            by == 'dobComDorRecPos' || by == 'dobDegDojDorPos' || by == 'dobDegDojRecPos' || by == 'dobDegDorRecPos' ||
                            by == 'dobDojDorRecPos' || by == 'staComDegDojPos' || by == 'staComDegDorPos' || by == 'staComDegRecPos' || 
                            by == 'staComDojDorPos' || by == 'staComDojRecPos' || by == 'staComDorRecPos' || by == 'staDegDojDorPos' ||
                            by == 'staDegDojRecPos' || by == 'staDegDorRecPos' || by == 'staDojDorRecPos' || by == 'comDegDojDorPos' || 
                            by == 'comDegDojRecPos' || by == 'comDegDorRecPos' || by == 'comDojDorRecPos' || by == 'degDojDorRecPos' || 
                            by == 'dobStaDegRecPos' || by == 'dobComDojDorPos' || by == 'dobComDojRecPos' || by == 'staDegDorRecPos'
                            ){
                            console.log('yes posting ');
                            if(transferOrPostingEmployeesList.toPostingInCategoryCode){
                                {console.log('yes toposting avail')
                                if(transferOrPostingEmployeesList.toPostingInCategoryCode == input.postingIn)
                                    {
                                        console.log('yes posting matched')
                                        resultData.push(dataAll);
                                    }
                            }
                            }
                        }
                        if(by == 'department' || 
                            by == "recDep" || by == "dobDep" || by == "staDep" || by == "comDep" ||
                            by == "degDep" || by == "dojDep" || by == "dorDep" || 
                            by == 'dobStaDep' || by == 'dobComDep' || by == 'dobDegDep' || 
                            by == 'dobDojDep' || by == 'dobDorDep' || by == 'dobRecDep' || by == 'staComDep'
                            || by == 'staDegDep' || by == 'staDojDep' || by == 'staDorDep' || by == 'staRecDep'
                            || by == 'comDegDep' || by == 'comDojDep' || by == 'comDorDep' || by == 'comRecDep'
                            || by == 'degDojDep' || by == 'degDorDep' || by == 'degRecDep' || by == 'dojDorDep'
                            || by == 'dojRecDep' || by == 'dorRecDep' ||
                            by == 'dobStaComDep' || by == 'dobStaDegDep' ||
                            by == 'dobStaDojDep' || by == 'dobStaDorDep' || by == 'dobStaRecDep' || by == 'dobComDegDep' ||
                            by == 'dobComDojDep' || by == 'dobComDorDep' || by == 'dobComRecDep' || by == 'dobDegDojDep' ||
                            by == 'dobDegDorDep' || by == 'dobDegRecDep' || by == 'dobDojDorDep' || by == 'dobDojRecDep' || 
                            by == 'dobDorRecDep' || by == 'staComDegDep' || by == 'staComDojDep' || by == 'staComDorDep' ||
                            by == 'staComRecDep' || by == 'staDegDojDep' || by == 'staDegDorDep' || by == 'staDegRecDep' || 
                            by == 'staDojDorDep' || by == 'staDojRecDep' || by == 'staDorRecDep' || by == 'comDegDojDep' || 
                            by == 'comDegDorDep' || by == 'comDegRecDep' || by == 'comDojDorDep' || by == 'comDojRecDep' || 
                            by == 'comDorRecDep' || by == 'degDojDorDep' || by == 'degDojRecDep' || by == 'degDorRecDep' || 
                            by == 'dojDorRecDep'  ||
                            by == 'dobStaComDegDep' || by == 'dobStaComDojDep' || by == 'dobStaComDorDep' || by == 'dobStaComRecDep' ||
                            by == 'dobStaDegDojDep' || by == 'dobStaDegDorDep' || by == 'dobStaDegRecDep' || by == 'dobStaDojDorDep' || 
                            by == 'dobStaDojRecDep' || by == 'dobStaDorRecDep' || by == 'dobComDegDorDep' || by == 'dobComDegRecDep' || 
                            by == 'dobComDojDorDep' || by == 'dobComDojRecDep' || by == 'dobComDorRecDep' || by == 'dobDegDojRecDep' ||
                            by == 'dobDegDojDorDep' || by == 'dobDegDorRecDep' || by == 'dobDojDorRecDep' || by == 'staComDegDojDep' ||
                            by == 'staComDegDorDep' || by == 'staComDegRecDep' || by == 'staComDojDorDep' || by == 'staComDojRecDep' || 
                            by == 'staComDorRecDep' || by == 'staDegDojDorDep' || by == 'staDegDojRecDep' || by == 'staDegDorRecDep' || 
                            by == 'staDojDorRecDep' || by == 'comDegDojDorDep' || by == 'comDegDojRecDep' || by == 'comDegDorRecDep' || 
                            by == 'comDojDorRecDep' || by == 'degDojDorRecDep' || by == 'dobComDegDojDep'
                        ){
                            console.log('yes dept ');
                            if(transferOrPostingEmployeesList.toPostingInCategoryCode){
                                console.log('yes dept avail')
                                if(transferOrPostingEmployeesList.toDepartmentId == input.department){
                                    resultData.push(dataAll);
                                }
                            } 
                        }
                        if(by == 'designation' || 
                            by == "dobDes" || by == "staDes" || by == "comDes" || by == "degDes" ||
                            by == "dojDes" || by == "dorDes" ||
                            by == 'dobStaDes' || by == 'dobComDes' || by == 'dobDegDes' ||
                            by == 'dobDojDes' || by == 'dobDorDes' || by == 'dobRecDes' || by == 'staComDes' ||
                            by == 'staDegDes' || by == 'staDojDes' || by == 'staDorDes' || by == 'staRecDes' ||
                            by == 'comDegDes' || by == 'comDojDes' || by == 'comDorDes' || by == 'comRecDes' ||
                            by == 'degDojDes' || by == 'degDorDes' || by == 'degRecDes' || by == 'dojDorDes' ||
                            by == 'dojRecDes' || by == 'dorRecDes' ||
                            by == 'dobStaComDes' || by == 'dobStaDegDes' ||
                            by == 'dobStaDojDes' || by == 'dobStaDorDes' || by == 'dobStaRecDes' || by == 'dobComDegDes' ||
                            by == 'dobComDojDes' || by == 'dobComDorDes' || by == 'dobComRecDes' || by == 'dobDegDojDes' ||
                            by == 'dobDegDorDes' || by == 'dobDegRecDes' || by == 'dobDojDorDes' || by == 'dobDojRecDes' ||
                            by == 'dobDorRecDes' || by == 'staComDegDes' || by == 'staComDojDes' || by == 'staComDorDes' ||
                            by == 'staComRecDes' || by == 'staDegDojDes' || by == 'staDegDorDes' || by == 'staDegRecDes' || 
                            by == 'staDojDorDes' || by == 'staDojRecDes' || by == 'staDorRecDes' || by == 'comDegDojDes' ||
                            by == 'comDegDorDes' || by == 'comDegRecDes' || by == 'comDojDorDes' || by == 'comDojRecDes' || 
                            by == 'comDorRecDes' || by == 'degDojDorDes' || by == 'degDojRecDes' || by == 'degDorRecDes' ||
                            by == 'dojDorRecDes' ||
                            by == 'dobStaComDegDes' || by == 'dobStaComDojDes' || by == 'dobStaComDorDes' || by == 'dobStaComRecDes' ||
                            by == 'dobStaDegDojDes' || by == 'dobStaDegDorDes' || by == 'dobStaDegRecDes' || by == 'dobStaDojDorDes' ||
                            by == 'dobStaDojRecDes' || by == 'dobStaDorRecDes' || by == 'dobComDegDorDes' || by == 'dobComDegRecDes' || 
                            by == 'dobComDojDorDes' || by == 'dobComDojRecDes' || by == 'dobComDorRecDes' || by == 'dobDegDojDorDes' ||
                            by == 'dobDegDojRecDes' || by == 'dobDegDorRecDes' || by == 'dobDojDorRecDes' || by == 'staComDegDojDes' || 
                            by == 'staComDegDorDes' || by == 'staComDegRecDes' || by == 'staComDojDorDes' || by == 'staComDojRecDes' || 
                            by == 'staComDorRecDes' || by == 'staDegDojRecDes' || by == 'staDojDorRecDes' || by == 'comDegDojDorDes' || 
                            by == 'comDegDojRecDes' || by == 'comDegDorRecDes' || by == 'comDojDorRecDes' || by == 'degDojDorRecDes' || 
                            by == 'staDegDojDorDes' || by == 'staDegDorRecDes' 
                        ){
                            console.log('yes designation ');
                            if(transferOrPostingEmployeesList.toDesignationId){
                                console.log('yes designation avail')
                                if(transferOrPostingEmployeesList.toDesignationId == input.designation){
                                    resultData.push(dataAll);
                                }
                            } 
                        }
                        else if(by == 'posDep' || by == 'dobPosDep' || by == 'staPosDep' || by == 'dorPosDep' ||
                            by == 'comPosDep' || by == 'degPosDep' || by == 'dojPosDep' || by == 'recPosDep' ||
                            by == 'dobStaPosDep' || by == 'dobComPosDep' || by == 'dobDegPosDep' || by == 'dobDojPosDep' || 
                            by == 'dobDorPosDep' || by == 'dobRecPosDep' || by == 'staComPosDep' || by == 'staDegPosDep' || 
                            by == 'staDojPosDep' || by == 'staDorPosDep' || by == 'staRecPosDep' || by == 'comDegPosDep' ||
                            by == 'comDorPosDep' || by == 'comRecPosDep' || by == 'degDojPosDep' || by == 'degDorPosDep' || 
                            by == 'degRecPosDep' || by == 'dojDorPosDep' || by == 'dojRecPosDep' || by == 'dorRecPosDep' ||
                            by == 'dobStaComPosDep' || by == 'dobStaDegPosDep' || by == 'dobStaDojPosDep' || by == 'dobStaDorPosDep' ||
                            by == 'dobStaRecPosDep' || by == 'dobComDegPosDep' || by == 'dobComDojPosDep' || by == 'dobComDorPosDep' || 
                            by == 'dobComRecPosDep' || by == 'dobDegDojPosDep' || by == 'dobDegDorPosDep' || by == 'dobDegRecPosDep' || 
                            by == 'dobDojDorPosDep' || by == 'dobDojRecPosDep' || by == 'dobDorRecPosDep' || by == 'dobDorPosDepDes' || 
                            by == 'staComDegPosDep' || by == 'staComDojPosDep' || by == 'staComDorPosDep' || by == 'staComRecPosDep' || 
                            by == 'staDegDojPosDep' || by == 'staDegDorPosDep' || by == 'staDegRecPosDep' || by == 'staDojDorPosDep' || 
                            by == 'staDojRecPosDep' || by == 'staDorRecPosDep' || by == 'comDegDojPosDep' || by == 'comDegDorPosDep' || 
                            by == 'comDegRecPosDep' || by == 'comDojDorPosDep' || by == 'comDojRecPosDep' || by == 'comDorRecPosDep' || 
                            by == 'degDojDorPosDep' || by == 'degDojRecPosDep' || by == 'degDorRecPosDep' || by == 'dojDorRecPosDep' ||

                            by == 'dobStaComDegDojDorRecPosDep'
                        ){
                            if(transferOrPostingEmployeesList.toDepartmentId == input.department){
                                if(transferOrPostingEmployeesList.toPostingInCategoryCode){
                                    console.log('yes toposting avail')
                                    if(transferOrPostingEmployeesList.toPostingInCategoryCode == input.postingIn)
                                    {
                                        console.log('yes posting matched')
                                        resultData.push(dataAll);
                                    }
                                }
                            }
                        }
                        else if(by == 'posDes' || by == 'dobPosDes' || by == 'staPosDes' || by == 'comPosDes' 
                            || by == 'degPosDes' ||
                            by == 'dojPosDes' || by == 'dorPosDes' || by == 'recPosDes' ||
                            by == 'dobStaPosDes' || by == 'dobComPosDes' || by == 'dobDegPosDes' || by == 'dobDojPosDes' || 
                            by == 'dobDorPosDes' || by == 'dobRecPosDes' || by == 'staComPosDes' || by == 'staDegPosDes' || 
                            by == 'staDojPosDes' || by == 'staDorPosDes' || by == 'staRecPosDes' || by == 'comDegPosDes' || 
                            by == 'comDojPosDep' || by == 'comDojPosDes' || by == 'degDojPosDes' || by == 'comDorPosDes' || 
                            by == 'comRecPosDes' || by == 'degDorPosDes' || by == 'degRecPosDes' || by == 'dojDorPosDes' || 
                            by == 'dojRecPosDes' || by == 'dorRecPosDes' || 
                            by == 'dobStaComPosDes' || by == 'dobStaDegPosDes' || by == 'dobStaDojPosDes' || by == 'dobStaDorPosDes' || 
                            by == 'dobStaRecPosDes' || by == 'dobComDegPosDes' || by == 'dobComDojPosDes' || by == 'dobComDorPosDes' || 
                            by == 'dobComRecPosDes' || by == 'dobDegDojPosDes' || by == 'dobDegDorPosDes' || by == 'dobDegRecPosDes' || 
                            by == 'dobDojDorPosDes' || by == 'dobDojRecPosDes' || by == 'dobDorRecPosDes' || by == 'staComDegPosDes' || 
                            by == 'staComDojPosDes' || by == 'staComDorPosDes' || by == 'staComRecPosDes' || by == 'staDegDojPosDes' || 
                            by == 'staDegDorPosDes' || by == 'staDegRecPosDes' || by == 'staDojDorPosDes' || by == 'staDojRecPosDes' || 
                            by == 'staDorRecPosDes' || by == 'comDegDojPosDes' || by == 'comDegDorPosDes' || by == 'comDegRecPosDes' || 
                            by == 'comDojDorPosDes' || by == 'comDojRecPosDes' || by == 'comDorRecPosDes' || by == 'degDojDorPosDes' || 
                            by == 'degDojRecPosDes' || by == 'degDorRecPosDes' || by == 'dojDorRecPosDes' ||

                            by == 'dobStaComDegDojDorRecPosDes'
                        ){
                            if(transferOrPostingEmployeesList.toDesignationId == input.designation){
                                if(transferOrPostingEmployeesList.toPostingInCategoryCode){
                                    console.log('yes toposting avail')
                                    if(transferOrPostingEmployeesList.toPostingInCategoryCode == input.postingIn)
                                    {
                                        console.log('yes posting matched')
                                        resultData.push(dataAll);
                                    }
                                }
                            }
                        }
                        else if(by == 'DepDes' || by == 'dobDepDes' || by == 'staDepDes' || by == 'comDepDes' ||
                            by == 'degDepDes' || by == 'dojDepDes' || by == 'dorDepDes' || by == 'recDepDes' ||
                            by == 'dobStaDepDes' || by == 'dobComDepDes' || by == 'dobDegDepDes' || by == 'dobDojDepDes' || 
                            by == 'dobDorDepDes' || by == 'dobRecDepDes' || by == 'staComDepDes' || by == 'staDegDepDes' || 
                            by == 'staDojDepDes' || by == 'staDorDepDes' || by == 'staRecDepDes' || by == 'comDegDepDes' || 
                            by == 'comDojDepDes' || by == 'degDojDepDes' || by == 'degDorDepDes' || by == 'degRecDepDes' ||
                            by == 'dojRecDepDes' || by == 'dorRecDepDes' ||
                            by == 'comRecDepDes' || by == 'dojDorDepDes' ||
                            by == 'dobStaComDepDes' || by == 'dobStaDegDepDes' || by == 'dobStaDojDepDes' || by == 'dobStaDorDepDes' || 
                            by == 'dobStaRecDepDes' || by == 'dobComDegDepDes' || by == 'dobComDojDepDes' || by == 'dobComDorDepDes' || 
                            by == 'dobComRecDepDes' || by == 'dobDegDojDepDes' || by == 'dobDegDorDepDes' || by == 'dobDegRecDepDes' || 
                            by == 'dobDojDorDepDes' || by == 'dobDojRecDepDes' || by == 'dobDorRecDepDes' || by == 'staComDegDepDes' || 
                            by == 'staComDojDepDes' || by == 'staComDorDepDes' || by == 'staComRecDepDes' || by == 'staDegDojDepDes' || 
                            by == 'staDegDorDepDes' || by == 'staDegRecDepDes' || by == 'staDojDorDepDes' || by == 'staDojRecDepDes' ||
                            by == 'staDorRecDepDes' || by == 'comDegDojDepDes' || by == 'comDegDorDepDes' || by == 'comDegRecDepDes' || 
                            by == 'comDojDorDepDes' || by == 'comDojRecDepDes' || by == 'comDorRecDepDes' || by == 'degDojDorDepDes' || 
                            by == 'degDojRecDepDes' || by == 'degDorRecDepDes' || by == 'dojDorRecDepDes' ||

                            by == 'dobStaComDegDojDorRecDepDes'
                        ){
                            if(transferOrPostingEmployeesList.toDepartmentId == input.department){
                                if(transferOrPostingEmployeesList.toDesignationId){
                                    console.log('yes toposting avail')
                                    if(transferOrPostingEmployeesList.toDesignationId == input.designation)
                                    {
                                        console.log('yes posting matched')
                                        resultData.push(dataAll);
                                    }
                                }
                            }
                        }
                        else if(by == 'posDepDes' ||
                            by == 'dobPosDepDes' || by == 'staPosDepDes' || by == 'comPosDepDes' || by == 'degPosDepDes' ||
                            by == 'dojPosDepDes' || by == 'dorPosDepDes' || by == 'recPosDepDes' || by == 'comDorDepDes' || 
                            by == 'dobStaPosDepDes' || by == 'dobComPosDepDes' || by == 'dobDegPosDepDes' || by == 'dobDojPosDepDes' ||
                            by == 'dobRecPosDepDes' || by == 'staComPosDepDes' || by == 'staDegPosDepDes' || by == 'staDojPosDepDes' || 
                            by == 'staDorPosDepDes' || by == 'staRecPosDepDes' || by == 'comDegPosDepDes' || by == 'comDojPosDepDes' ||
                            by == 'comDorPosDepDes' || by == 'comRecPosDepDes' || by == 'degDojPosDepDes' || by == 'degRecPosDepDes' || 
                            by == 'degDorPosDepDes' || by == 'dojDorPosDepDes' || by == 'dojRecPosDepDes' ||

                            by == "dobStaComDegDojDorPosDepDes" || by == "dobStaComDegDojRecPosDepDes" ||by == "dobStaComDegDorRecPosDepDes" ||
                            by == "dobStaComDojDorRecPosDepDes" || by == "dobStaDegDojDorRecPosDepDes" || by == "dobComDegDojDorRecPosDepDes" ||
                            by == "staComDegDojDorRecPosDepDes" ||
                            by == 'ten'
                        ){
                            if(transferOrPostingEmployeesList.toDepartmentId == input.department){
                                if(transferOrPostingEmployeesList.toDesignationId){
                                    console.log('yes toposting avail')
                                    if(transferOrPostingEmployeesList.toDesignationId == input.designation)
                                    {
                                        console.log('yes posting matched')
                                        if(transferOrPostingEmployeesList.toPostingInCategoryCode){
                                            console.log('yes toposting avail')
                                            if(transferOrPostingEmployeesList.toPostingInCategoryCode == input.postingIn)
                                            {
                                                console.log('yes posting matched')
                                                resultData.push(dataAll);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        
                        else if(by == "dateOfBirth" || by == "dateOfJoining" || by == "dateOfRetirement" ||
                            by == "community" || by == "recruitmentType" || by == "state"  || by == "degree" || 
                            by == "dobSta" || by == "dobCom" || by == "dobDeg"||
                            by == "recDes" || by == "dobSta" || by == "dobCom" || by == "dobDeg" || by == "dobDoj" ||
                            by == "dobDor" || by == "dobRec" || by == "staCom" || by == "staDeg" || by == "staDoj" ||
                            by == "staDor" || by == "staRec" || by == "comDeg" || by == "comDoj" || by == "comDor" ||
                            by == "comRec" || by == "degDoj" || by == "degDor" || by == "degRec" || by == "dojDor" ||
                            by == "dojRec" || by == "dorRec" || by == "dobStaCom" || by == "dobStaDeg" || by == "dobStaDoj" ||
                            by == "dobStaDor" || by == "dobStaRec" || by == "dobComDeg" || by == "dobComDoj" || 
                            by == "dobComDor" || by == "dobComRec" || by == "dobDegDoj" || by == "dobDegDor" || 
                            by == "dobDegRec"  || by == "dobDojDor" || by == "dobDojRec" || by == "dobDorRec" || 
                            by == "staComDoj" || by == "staDojDor" || by == "staDojRec" || by == "comDegDoj" ||
                            by == "comDojDor" || by == "comDojRec" || by == "degDojRec" || by == "dojDorRec" 
                            || by == "staComDor" || by == "staDegDor" || by == "comDegDor" || by == "comDorRec" 
                            || by == "degDojDor" || by == "degDorRec" || by == "staComRec" || by == "staComDeg"
                            || by == "staDorRec" || by == "comDegRec" || by == "staDegDoj"|| by == "staDegRec" ||
                            by == 'dobStaComDeg' || by == 'dobStaComDoj' || by == 'dobStaComDor' || by == 'dobStaComRec' ||
                            by == 'dobStaDegDoj' ||
                            by == 'dobStaDegDor' || by == 'dobStaDegRec' || 
                            by == 'dobStaDojDor' || by == 'dobStaDojRec' || 
                            by == 'dobStaDorRec' || 
                            by == 'dobComDegDoj' || by == 'dobComDegDor' || by == 'dobComDegRec' || by == 'dobComDojDor' || 
                            by == 'dobComDojRec' || by == 'dobComDorRec' ||
                            by == 'dobDegDojDor' || by == 'dobDegDojRec' || by == 'dobDegDorRec' ||
                            by == 'dobDojDorRec' ||
                            by == 'staComDegDoj' || by == 'staComDegDor' || by == 'staComDegRec' || by == 'staComDojDor' || 
                            by == 'staComDojRec' || by == 'staComDorRec' ||
                            by == 'staDegDojDor' || by == 'staDegDojRec' || by == 'staDegDorRec' ||
                            by == 'staDojDorRec' ||
                            by == 'comDegDojDor' || by == 'comDegDojRec' || by == 'comDegDorRec' || by == 'comDojDorRec' ||
                            by == 'degDojDorRec' ||
                            by == 'dobStaComDegDoj' || by == 'dobStaComDegDor' || by == 'dobStaComDegRec' || by == 'dobStaComDojDor' || 
                            by == 'dobStaComDojRec' || by == 'dobStaComDorRec' || by == 'dobStaDegDojDor' || by == 'dobStaDegDojRec' ||
                            by == 'dobStaDegDorRec' || by == 'dobStaDojDorRec' || by == 'dobComDegDojDor' || by == 'dobComDegDojRec' ||
                            by == 'dobComDegDorRec' || by == 'dobComDojDorRec' || by == 'dobDegDojDorRec' || by == 'staComDegDojDor' || 
                            by == 'staComDegDojRec' || by == 'staComDegDorRec' ||by == 'staComDojDorRec'  || by == 'staDegDojDorRec' || 
                            by == 'comDegDojDorRec'
                         ){
                            // console.log('dataAll => ', dataAll);
                            console.log('condition true');
                            resultData.push(dataAll);
                            // console.log('resultData end => ', resultData);
                        }
                    }
                }
                ///here
                
                
            }
            else{
                console.log('len else ', uniqueArray.length);
            }

        }
        // console.log('Unique by latest date of order: 2', uniqueArray);
        let resData = {
            empCount : resultData.length,
            empList: resultData
        }
        // console.log('resDate =====> ', resData);
        return resData;
    }
    catch (error) {
        console.log('error', error);
        throw 'error';
        }
}

exports.getCurrentPosting = async (req, res) => {
    console.log('helo from employeeProfile controller', req.query);
    try {
    let data;
    let resultData = [];
        
        data = await employeeProfile.find(req.query)
        
        
    .sort({ batch: 'asc' })
    .allowDiskUse(true)
    //.limit(100)
    .exec();
    console.log('data ', data);
    if(data.length > 0){
        console.log('data.length', data.length)
        for(let data0 of data){
            let updateQueryJson = {
                empId: data0._id
            }
            uniqueArray = await empProfile.getEmployeeUpdateFilter(updateQueryJson);
            console.log('uniqueArray.length ==> ', uniqueArray.length);
            console.log('uniqueArray ==> ', uniqueArray[0]);
            if(uniqueArray.length > 0 && uniqueArray[0].transferOrPostingEmployeesList){
                for(let transferOrPostingEmployeesList of uniqueArray[0].transferOrPostingEmployeesList){
                    console.log('Check ', transferOrPostingEmployeesList.fullName, transferOrPostingEmployeesList);
                    if(transferOrPostingEmployeesList.empProfileId._id.toString() === data0._id.toString()){
                        console.log('Matched ');
                        console.log('posting available')
                dataAll = {
                    Departmentdetails: await departments.findById(transferOrPostingEmployeesList.toDepartmentId).select(
                        ['department_name', 'address']),
                    Designationdetails: await designations.findById(transferOrPostingEmployeesList.toDesignationId).select(['designation_name']),
                    employeeUpdateId:  uniqueArray[0]._id,
                    fullName: data0.fullName,
                    personalEmail: data0.personalEmail,
                    dateOfBirth: data0.dateOfBirth,
                    imagePath: data0.imagePath,
                    dateOfJoining: data0.lastDateOfPromotion,
                    statinformation : await categories.findById(data0.state).select(['category_name']),
                    officeEmail: data0.officeEmail,
                    mobileNo1: data0.mobileNo1,
                    mobileNo2: data0.mobileNo2,
                    mobileNo3: data0.mobileNo3,
                    addressLine: data0.addressLine,
                    city: data0.city,
                    pincode: data0.pincode,
                }
                resultData.push(dataAll);
            }
        }

            }
        }
        
    }
        //console.log('if', data);
        successRes(res, resultData, 'Employee listed Successfully');
    
    } catch (error) {
        console.log('error', error);
        errorRes(res, error, "Error on listing employee");
    }
}

exports.getEmployeeProfileBydateOfBirth = async (req, res) => {
    console.log('Hello from employeeProfile controller', req.query);
    try {
        let query = {};
        let data;
        let resultData = [];

        // Get the current date
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth(); // 0-based month (January = 0)
        const currentDay = currentDate.getDate();

        console.log('Current Month and Day:', currentMonth, currentDay);

        // Use aggregation to match the month and day of dateOfBirth
        data = await employeeProfile.aggregate([
            {
                $project: {
                    fullName: 1,
                    personalEmail: 1,
                    gender: 1,
                    dateOfBirth: 1,
                    dateOfJoining: 1,
                    dateOfRetirement: 1,
                    state: 1,
                    batch: 1,
                    recruitmentType: 1,
                    serviceStatus: 1,
                    qualification1: 1,
                    qualification2: 1,
                    community: 1,
                    degreeData: 1,
                    caste: 1,
                    religion: 1,
                    promotionGrade: 1,
                    payscale: 1,
                    officeEmail: 1,
                    mobileNo1: 1,
                    mobileNo2: 1,
                    mobileNo3: 1,
                    addressLine: 1,
                    city: 1,
                    pincode: 1,
                    employeeId: 1,
                    ifhrmsId: 1,
                    lastDateOfPromotion: 1,
                    languages: 1,
                    seniority: 1,
                    imagePath: 1,
                    submittedBy: 1,
                    approvedBy: 1,
                    approvedDate: 1,
                    approvalStatus: 1,
                    departmentId: 1,
                    // Extract the month and day from dateOfBirth
                    birthMonth: { $month: "$dateOfBirth" },
                    birthDay: { $dayOfMonth: "$dateOfBirth" }
                }
            },
            {
                $match: {
                    $and: [
                        { birthMonth: currentMonth + 1 }, // month is 1-based in MongoDB (Jan = 1)
                        { birthDay: currentDay }
                    ]
                }
            }
        ]);

        console.log('Data fetched:', data);
        if (data.length > 0) {
            console.log('Data length:', data.length);

            for (let data0 of data) {
                let updateQueryJson = { empId: data0._id };
                let uniqueArray = await empProfile.getEmployeeUpdateFilter(updateQueryJson);

                console.log('Unique Array Length:', uniqueArray.length);
                console.log('Unique Array:', uniqueArray[0]);

                if (uniqueArray.length > 0 && uniqueArray[0].transferOrPostingEmployeesList) {
                    for (let transferOrPostingEmployeesList of uniqueArray[0].transferOrPostingEmployeesList) {
                        console.log('Check:', transferOrPostingEmployeesList.fullName);

                        if (transferOrPostingEmployeesList.empProfileId._id.toString() === data0._id.toString()) {
                            console.log('Matched');
                            resultData.push({
                                toPostingInCategoryCode: transferOrPostingEmployeesList.toPostingInCategoryCode,
                                toDepartmentId: transferOrPostingEmployeesList.toDepartmentId,
                                toDesignationId: transferOrPostingEmployeesList.toDesignationId,
                                postTypeCategoryCode: transferOrPostingEmployeesList.postTypeCategoryCode,
                                locationChangeCategoryId: transferOrPostingEmployeesList.locationChangeCategoryId,
                                uniqueId: uniqueArray[0]._id,
                                updateType: uniqueArray[0].updateType,
                                orderTypeCategoryCode: uniqueArray[0].orderTypeCategoryCode,
                                orderNumber: uniqueArray[0].orderNumber,
                                orderForCategoryCode: uniqueArray[0].orderForCategoryCode,
                                fullName: data0.fullName,
                                personalEmail: data0.personalEmail,
                                _id: data0._id,
                                gender: data0.gender,
                                dateOfBirth: data0.dateOfBirth,
                                dateOfJoining: data0.dateOfJoining,
                                dateOfRetirement: data0.dateOfRetirement,
                                state: data0.state,
                                batch: data0.batch,
                                recruitmentType: data0.recruitmentType,
                                serviceStatus: data0.serviceStatus,
                                qualification1: data0.qualification1,
                                qualification2: data0.qualification2,
                                community: data0.community,
                                degreeData: data0.degreeData,
                                caste: data0.caste,
                                religion: data0.religion,
                                promotionGrade: data0.promotionGrade,
                                payscale: data0.payscale,
                                officeEmail: data0.officeEmail,
                                mobileNo1: data0.mobileNo1,
                                mobileNo2: data0.mobileNo2,
                                mobileNo3: data0.mobileNo3,
                                addressLine: data0.addressLine,
                                city: data0.city,
                                pincode: data0.pincode,
                                employeeId: data0.employeeId,
                                ifhrmsId: data0.ifhrmsId,
                                lastDateOfPromotion: data0.lastDateOfPromotion,
                                languages: data0.languages,
                                seniority: data0.seniority,
                                imagePath: data0.imagePath,
                                submittedBy: data0.submittedBy,
                                approvedBy: data0.approvedBy,
                                approvedDate: data0.approvedDate,
                                approvalStatus: data0.approvalStatus,
                                departmentId: data0.departmentId
                            });
                        }
                    }
                } else {
                    resultData.push({
                        fullName: data0.fullName,
                        personalEmail: data0.personalEmail,
                        _id: data0._id,
                        gender: data0.gender,
                        dateOfBirth: data0.dateOfBirth,
                        dateOfJoining: data0.dateOfJoining,
                        dateOfRetirement: data0.dateOfRetirement,
                        state: data0.state,
                        batch: data0.batch,
                        recruitmentType: data0.recruitmentType,
                        serviceStatus: data0.serviceStatus,
                        qualification1: data0.qualification1,
                        qualification2: data0.qualification2,
                        community: data0.community,
                        degreeData: data0.degreeData,
                        caste: data0.caste,
                        religion: data0.religion,
                        promotionGrade: data0.promotionGrade,
                        payscale: data0.payscale,
                        officeEmail: data0.officeEmail,
                        mobileNo1: data0.mobileNo1,
                        mobileNo2: data0.mobileNo2,
                        mobileNo3: data0.mobileNo3,
                        addressLine: data0.addressLine,
                        city: data0.city,
                        pincode: data0.pincode,
                        employeeId: data0.employeeId,
                        ifhrmsId: data0.ifhrmsId,
                        lastDateOfPromotion: data0.lastDateOfPromotion,
                        languages: data0.languages,
                        seniority: data0.seniority,
                        imagePath: data0.imagePath,
                        submittedBy: data0.submittedBy,
                        approvedBy: data0.approvedBy,
                        approvedDate: data0.approvedDate,
                        approvalStatus: data0.approvalStatus,
                        departmentId: data0.departmentId
                    });
                }
            }
        }

        successRes(res, resultData, 'Employee listed Successfully');
    } catch (error) {
        console.log('Error:', error);
        errorRes(res, error, "Error listing employee");
    }
};

exports.getEmployeesRetiringThisYear = async (req, res) => {
    console.log('Hello from employeeProfile controller', req.query);
    try {
        let query = {};
        let data;
        let resultData = [];

        // Get the current date
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear(); // Get the current year

        console.log('Current Year:', currentYear);

        // Use aggregation to match employees who are going to retire this year
        data = await employeeProfile.aggregate([
            {
                $project: {
                    fullName: 1,
                    personalEmail: 1,
                    gender: 1,
                    dateOfRetirement: 1,
                    dateOfJoining: 1,
                    state: 1,
                    batch: 1,
                    recruitmentType: 1,
                    serviceStatus: 1,
                    qualification1: 1,
                    qualification2: 1,
                    community: 1,
                    degreeData: 1,
                    caste: 1,
                    religion: 1,
                    promotionGrade: 1,
                    payscale: 1,
                    officeEmail: 1,
                    mobileNo1: 1,
                    mobileNo2: 1,
                    mobileNo3: 1,
                    addressLine: 1,
                    city: 1,
                    pincode: 1,
                    employeeId: 1,
                    ifhrmsId: 1,
                    lastDateOfPromotion: 1,
                    languages: 1,
                    seniority: 1,
                    imagePath: 1,
                    submittedBy: 1,
                    approvedBy: 1,
                    approvedDate: 1,
                    approvalStatus: 1,
                    departmentId: 1,
                    // Extract the year from dateOfRetirement
                    retirementYear: { $year: "$dateOfRetirement" }
                }
            },
            {
                $match: {
                    retirementYear: currentYear // Match if the retirement year is the current year
                }
            }
        ]);

        console.log('Data fetched:', data);
        if (data.length > 0) {
            console.log('Data length:', data.length);

            for (let data0 of data) {
                let updateQueryJson = { empId: data0._id };
                let uniqueArray = await empProfile.getEmployeeUpdateFilter(updateQueryJson);

                console.log('Unique Array Length:', uniqueArray.length);
                console.log('Unique Array:', uniqueArray[0]);

                if (uniqueArray.length > 0 && uniqueArray[0].transferOrPostingEmployeesList) {
                    for (let transferOrPostingEmployeesList of uniqueArray[0].transferOrPostingEmployeesList) {
                        console.log('Check:', transferOrPostingEmployeesList.fullName);

                        if (transferOrPostingEmployeesList.empProfileId._id.toString() === data0._id.toString()) {
                            console.log('Matched');
                            resultData.push({
                                toPostingInCategoryCode: transferOrPostingEmployeesList.toPostingInCategoryCode,
                                toDepartmentId: transferOrPostingEmployeesList.toDepartmentId,
                                toDesignationId: transferOrPostingEmployeesList.toDesignationId,
                                postTypeCategoryCode: transferOrPostingEmployeesList.postTypeCategoryCode,
                                locationChangeCategoryId: transferOrPostingEmployeesList.locationChangeCategoryId,
                                uniqueId: uniqueArray[0]._id,
                                updateType: uniqueArray[0].updateType,
                                orderTypeCategoryCode: uniqueArray[0].orderTypeCategoryCode,
                                orderNumber: uniqueArray[0].orderNumber,
                                orderForCategoryCode: uniqueArray[0].orderForCategoryCode,
                                fullName: data0.fullName,
                                personalEmail: data0.personalEmail,
                                _id: data0._id,
                                gender: data0.gender,
                                dateOfRetirement: data0.dateOfRetirement,
                                dateOfJoining: data0.dateOfJoining,
                                state: data0.state,
                                batch: data0.batch,
                                recruitmentType: data0.recruitmentType,
                                serviceStatus: data0.serviceStatus,
                                qualification1: data0.qualification1,
                                qualification2: data0.qualification2,
                                community: data0.community,
                                degreeData: data0.degreeData,
                                caste: data0.caste,
                                religion: data0.religion,
                                promotionGrade: data0.promotionGrade,
                                payscale: data0.payscale,
                                officeEmail: data0.officeEmail,
                                mobileNo1: data0.mobileNo1,
                                mobileNo2: data0.mobileNo2,
                                mobileNo3: data0.mobileNo3,
                                addressLine: data0.addressLine,
                                city: data0.city,
                                pincode: data0.pincode,
                                employeeId: data0.employeeId,
                                ifhrmsId: data0.ifhrmsId,
                                lastDateOfPromotion: data0.lastDateOfPromotion,
                                languages: data0.languages,
                                seniority: data0.seniority,
                                imagePath: data0.imagePath,
                                submittedBy: data0.submittedBy,
                                approvedBy: data0.approvedBy,
                                approvedDate: data0.approvedDate,
                                approvalStatus: data0.approvalStatus,
                                departmentId: data0.departmentId
                            });
                        }
                    }
                } else {
                    resultData.push({
                        fullName: data0.fullName,
                        personalEmail: data0.personalEmail,
                        _id: data0._id,
                        gender: data0.gender,
                        dateOfRetirement: data0.dateOfRetirement,
                        dateOfJoining: data0.dateOfJoining,
                        state: data0.state,
                        batch: data0.batch,
                        recruitmentType: data0.recruitmentType,
                        serviceStatus: data0.serviceStatus,
                        qualification1: data0.qualification1,
                        qualification2: data0.qualification2,
                        community: data0.community,
                        degreeData: data0.degreeData,
                        caste: data0.caste,
                        religion: data0.religion,
                        promotionGrade: data0.promotionGrade,
                        payscale: data0.payscale,
                        officeEmail: data0.officeEmail,
                        mobileNo1: data0.mobileNo1,
                        mobileNo2: data0.mobileNo2,
                        mobileNo3: data0.mobileNo3,
                        addressLine: data0.addressLine,
                        city: data0.city,
                        pincode: data0.pincode,
                        employeeId: data0.employeeId,
                        ifhrmsId: data0.ifhrmsId,
                        lastDateOfPromotion: data0.lastDateOfPromotion,
                        languages: data0.languages,
                        seniority: data0.seniority,
                        imagePath: data0.imagePath,
                        submittedBy: data0.submittedBy,
                        approvedBy: data0.approvedBy,
                        approvedDate: data0.approvedDate,
                        approvalStatus: data0.approvalStatus,
                        departmentId: data0.departmentId
                    });
                }
            }
        }

        successRes(res, resultData, 'Employees retiring this year listed successfully');
    } catch (error) {
        console.log('Error:', error);
        errorRes(res, error, "Error listing employees retiring this year");
    }
};
