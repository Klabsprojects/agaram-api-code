const droProfile = require('../../models/employee/droProfile.model');
const droUpdate = require('../../models/employee/droUpdate.model');
const categories = require('../../models/categories/categories.model');
const designations = require('../../models/categories/designation.model');
const login = require('../../models/login/login.model');
//const login = require('../../models/login/login.model');
const whatsapp = require('../whatsapp/whatsapp.controller');
const droProfileUpdateController = require('./droProfileUpdate.controller')
const departmentController = require('../categories/department.controller')
const departments = require('../../models/categories/department.model');
const state = require('../../models/state/state.model');
const empProfile = require('./employeeProfile.controller');
//const { Op } = require('sequelize');

const { successRes, errorRes } = require("../../middlewares/response.middleware");
const { ObjectId, ObjectID } = require('mongodb');

const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

const uploadDir = 'uploadsImages/';

// droProfile creation
exports.addDroProfile = async (req, res) => {
    try {
        console.log('try create droProfile', req.body);
        let dateOrder = new Date();
        const query = req.body;
        if(req.body.toDepartmentId)
            query.departmentId = req.body.toDepartmentId;
        if(req.body.lastDateOfPromotion)
            query.lastDateOfPromotion = req.body.lastDateOfPromotion;
        if(req.body.languages)
            query.languages = req.body.languages;

        console.log('__dirname ', __dirname);
        const baseDir = path.resolve(__dirname, '../../../');  // Go two levels up from the current directory

        // console.log('Base directory:', baseDir);

        const uploadDir = path.join(baseDir, 'droProfileImages');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // console.log('query ', query);

        if (req.files && req.files['orderFile'] && req.files['orderFile'].length > 0) {
            // If conductRulePermissionAttachment file exists
            const orderPath = req.files['orderFile'][0].path;
            // console.log('Uploaded orderFile file path:', orderPath);
            query.orderFile = orderPath;
        }
        if (req.files && req.files['imagePath'] && req.files['imagePath'].length > 0) {
            const fileExtension = path.extname(req.files['imagePath'][0].originalname);  // Get the file extension
            //console.log('uploadDir', uploadDir);
            
            // Output file path for the converted image
            const outputFilePath = path.join(uploadDir, req.files['imagePath'][0].originalname+`${Date.now()}.jpeg`);
            console.log('outputFilePath', outputFilePath);
            
            // Use imagemagick to convert the uploaded image to JPEG
            // console.log('req.file.path', req.files['imagePath'][0].path);
        
            await Jimp.read(req.files['imagePath'][0].path)
            .then(image => {
                return image.writeAsync(outputFilePath);
            })
            .then(() => {
                // console.log('Conversion successful! Output saved to', outputFilePath);
                const fileName = path.basename(outputFilePath);
            //query.imagePath = fileName;
            query.imagePath = fileName;
            })
            .catch(err => {
                console.error('Error during conversion:', err);
                throw new Error('Error during conversion');
            });
        }
        if(req.body.degreeData){
            console.log(' original transferOrPostingEmployeesList ', req.body.degreeData);
            //req.body.transferOrPostingEmployeesList = JSON.stringify(req.body.transferOrPostingEmployeesList);
            // console.log(' after stringify transferOrPostingEmployeesList ', req.body.degreeData);
            // console.log('yes');
            //query = req.body;
            query.degreeData = JSON.parse(req.body.degreeData);
            console.log(' after parse transferOrPostingEmployeesList ', req.body.degreeData);
        }
        // console.log('query ', query);
        const data = await droProfile.create(query);
        // console.log('data ', data);
        if(data){
            // console.log('data ', data);
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
                            droProfileId: data._id,
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
                const dataPosting = await droProfileUpdateController.handleBulkEmployeeTransferPosting(request);
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

// Get droProfile
exports.getDroProfile = async (req, res) => {
        console.log('helo from droProfile controller', req.query);
        try {
            
        let query = {};
        let data;
        let admins = [];
        let resultData = [];
            let adminIds = [];
            if(req.query._id || req.query.fullName || req.query.batch || req.query.loginId){
            query.where = req.query;
            data = await droProfile.find(req.query)
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
                uniqueArray = await this.getEmployeeUpdateFilter(updateQueryJson);
                console.log('uniqueArray.length ==> ', uniqueArray.length, uniqueArray);
                console.log('uniqueArray ==> ', uniqueArray[0]);
                if(uniqueArray.length > 0 && uniqueArray[0].transferOrPostingEmployeesList){
                    for(let transferOrPostingEmployeesList of uniqueArray[0].transferOrPostingEmployeesList){
                        console.log('Check ', transferOrPostingEmployeesList.fullName);
                        if(transferOrPostingEmployeesList.droProfileId._id.toString() === data0._id.toString()){
                            console.log('Matched ');
                            console.log('posting available');
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
                                droProfileId: transferOrPostingEmployeesList.droProfileId,
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
                        departmentId: data0.departmentId
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
                        
                        departmentId: data0.departmentId
                    }
                    resultData.push(dataAll);
                }
            }
            
        }
            //console.log('if', data);
            successRes(res, data, 'Employee listed Successfully');
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
             data = await droProfile.find(profileQuery)
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

            data = await droProfile.find().sort({ batch: 'asc' })
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

    // DroProfile updation
    exports.updateDroProfile = async (req, res) => {
        try {
            console.log('try update DroProfile', req.body);
            // const query = req.body;
            let filter;
            let update = {};
            // update = req.body;


            console.log('try create droProfile', req.body);
        let dateOrder = new Date();
        const query = req.body;
        if(req.body.toDepartmentId)
            query.departmentId = req.body.toDepartmentId;
        if(req.body.lastDateOfPromotion)
            query.lastDateOfPromotion = req.body.lastDateOfPromotion;
        if(req.body.languages)
            query.languages = req.body.languages;

        console.log('__dirname ', __dirname);
        const baseDir = path.resolve(__dirname, '../../../');  // Go two levels up from the current directory

        // console.log('Base directory:', baseDir);

        const uploadDir = path.join(baseDir, 'droProfileImages');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // console.log('query ', query);

        if (req.files && req.files['orderFile'] && req.files['orderFile'].length > 0) {
            // If conductRulePermissionAttachment file exists
            const orderPath = req.files['orderFile'][0].path;
            // console.log('Uploaded orderFile file path:', orderPath);
            query.orderFile = orderPath;
        }
        if (req.files && req.files['imagePath'] && req.files['imagePath'].length > 0) {
            const fileExtension = path.extname(req.files['imagePath'][0].originalname);  // Get the file extension
            //console.log('uploadDir', uploadDir);
            
            // Output file path for the converted image
            const outputFilePath = path.join(uploadDir, req.files['imagePath'][0].originalname+`${Date.now()}.jpeg`);
            console.log('outputFilePath', outputFilePath);
            
            // Use imagemagick to convert the uploaded image to JPEG
            // console.log('req.file.path', req.files['imagePath'][0].path);
        
            await Jimp.read(req.files['imagePath'][0].path)
            .then(image => {
                return image.writeAsync(outputFilePath);
            })
            .then(() => {
                // console.log('Conversion successful! Output saved to', outputFilePath);
                const fileName = path.basename(outputFilePath);
            //query.imagePath = fileName;
            query.imagePath = fileName;
            })
            .catch(err => {
                console.error('Error during conversion:', err);
                throw new Error('Error during conversion');
            });
        }
        if(req.body.degreeData){
            console.log(' original transferOrPostingEmployeesList ', req.body.degreeData);
            //req.body.transferOrPostingEmployeesList = JSON.stringify(req.body.transferOrPostingEmployeesList);
            // console.log(' after stringify transferOrPostingEmployeesList ', req.body.degreeData);
            // console.log('yes');
            //query = req.body;
            query.degreeData = JSON.parse(req.body.degreeData);
            console.log(' after parse transferOrPostingEmployeesList ', req.body.degreeData);
        }
        
            update = req.body;
            
            if(Object.keys(req.body).length >0){
                if(query.id){
                    console.log('id coming');
                    console.log(query.id);
                    filter = {
                        _id : query.id
                    }
                }
                
            else{
                console.log('id not coming');
                throw 'pls provide id field';
            }
            }
            
            else{
                console.log('problem in input query');
                throw 'pls provideinput query';
            }
            
                
            console.log('update ', update);
            console.log('filter ', filter);
            // Check if the update object is empty or not
            if (Object.keys(update).length > 0) {
                console.log('value got');
                const data = await droProfile.findOneAndUpdate(filter, update, {
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

exports.getEmployeeUpdateFilter = async(input) => {
    //console.log('inside getEmployeeUpdate function', input)
    let secretariatDetails;

    const dataResArray  = await droUpdate.find({
        'transferOrPostingEmployeesList.droProfileId': input.empId,
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