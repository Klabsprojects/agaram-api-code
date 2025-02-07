//const leave = require('../../models/employee/leave.model');
const formsupload = require('../../models/employee/formsupload.model')
const login = require('../../models/login/login.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")
const whatsapp = require('../whatsapp/whatsapp.controller');
const employeeProfile = require('../../models/employee/employeeProfile.model');

// Formsupload creation
exports.addFormsupload = async (req, res) => {
    try {
        console.log('try create Formsupload', req.body);
        const query = req.body;
        //console.log('Uploaded file path:', req.file.path);
        if (req.file) {
            query.formFile = req.file.path;
            console.log('Uploaded file path:', req.file.path);
            console.log('Uploaded file path:', req.file.filename);
        } else {
            throw new Error('File upload failed: No file uploaded');
        }
        const data = await formsupload.create(query);
        successRes(res, data, 'Formsupload created Successfully');
    } catch (error) {
        console.log('catch create Formsupload', error);
        errorRes(res, error, "Error on creating Formsupload");
    }
    }

// Get Formsupload
exports.getFormsupload = async (req, res) => {
        console.log('helo from Formsupload controller', req.query);
        try {
            let query = {};
            let data = [];
            let admins = [];
            let adminIds = [];

            if(req.query._id){
                /////old
                query.where = req.query;
                data = await formsupload.find(req.query)
                .populate({
                    path: 'employeeProfileId',
                    model: 'employeeProfile', // Model of the application collection
                    select: ['batch', 'mobileNo1', 'loginId'] // Fields to select from the application collection
                })  
                .populate({
                    path: 'approvedBy',
                    model: 'login', // Ensure the model name matches exactly
                    select: ['username', 'loginAs'] // Specify the fields you want to include from EmployeeProfile
                }) 
                .exec();
                console.log(data, 'formsupload listed else Successfully');
                successRes(res, data, 'formsupload listed Successfully');
            }

            else if(req.query.employeeProfileId){
                console.log('profileid', req.query.employeeProfileId)
                query.where = req.query;
                data = await formsupload.find({
                    'employeeProfileId': req.query.employeeProfileId
                })
                .populate({
                    path: 'employeeProfileId',
                    model: 'employeeProfile', // Model of the application collection
                    select: ['batch', 'mobileNo1'] // Fields to select from the application collection
                })  
                .populate({
                    path: 'approvedBy',
                    model: 'login', // Ensure the model name matches exactly
                    select: ['username', 'loginAs'] // Specify the fields you want to include from EmployeeProfile
                }) 
                .exec();
                console.log(data, 'formsupload listed else Successfully');
                successRes(res, data, 'formsupload listed Successfully');
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
                 data = await leave.find(profileQuery)
                     .populate({
                         path: 'employeeProfileId',
                         model: 'employeeProfile',
                         select: ['batch', 'mobileNo1']
                     })
                    .populate({
                        path: 'approvedBy',
                        model: 'login', // Ensure the model name matches exactly
                        select: ['username', 'loginAs'] // Specify the fields you want to include from EmployeeProfile
                    }) 
                     .exec();   
                
            console.log(data, 'leave listed if Successfully');
            successRes(res, data, 'leave listed Successfully');
                    
            }
            else
                {
                    data = await formsupload.find()
                    .populate({
                        path: 'employeeProfileId',
                        model: 'employeeProfile', // Model of the application collection
                        select: ['batch', 'mobileNo1', 'fullName'] // Fields to select from the application collection
                    })  
                    .populate({
                        path: 'approvedBy',
                        model: 'login', // Ensure the model name matches exactly
                        select: ['username', 'loginAs'] // Specify the fields you want to include from EmployeeProfile
                    }) 
                    .exec();
                    console.log(data, 'formsupload listed else Successfully');
                    successRes(res, data, 'formsupload listed Successfully');
                }
        } catch (error) {
            console.log('error', error);
            errorRes(res, error, "Error on listing formsupload");
        }
    }

        exports.updateFormsuploadApprovalStatus = async (req, res) => {
            try {
                console.log('try update Formsupload status', req.body, req);
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
                    const data = await formsupload.findOneAndUpdate(filter, update, {
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