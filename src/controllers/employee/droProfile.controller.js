const droProfile = require('../../models/employee/droProfile.model');
const employeeUpdate = require('../../models/employee/employeeUpdate.model');
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