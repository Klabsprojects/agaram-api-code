const employeeUpdate = require('../../models/employee/employeeUpdate.model');
const login = require('../../models/login/login.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")
const whatsapp = require('../whatsapp/whatsapp.controller');

// employeeUpdate creation
exports.addEmployeeUpdate = async (req, res) => {
    try {
        console.log('try create employeeUpdate');
        const query = req.body;
        if(req.file){
            query.orderFile = req.file.path
            //query.fcraClearance = req.file.path
            console.log('Uploaded file path:', req.file.path);
        }
        const data = await employeeUpdate.create(query);
        successRes(res, data, 'Employee Update added Successfully');
    } catch (error) {
        console.log('catch create employeeUpdate', error);
        errorRes(res, error, "Error on employeeUpdate creation");
    }
}

exports.addTransferOrPostingManyEmployees = async (req, res) => {
    try {
            console.log('try create bulk employees transfer/posting', req.body);
            let query = {};
            let phoneArr = [];
            if(req.file){
                req.body.orderFile = req.file.path
                query.orderFile = req.file.path
                console.log('Uploaded file path:', req.file.path);
            }
            if(req.body.transferOrPostingEmployeesList){
                console.log(' original transferOrPostingEmployeesList ', req.body.transferOrPostingEmployeesList);
                //req.body.transferOrPostingEmployeesList = JSON.stringify(req.body.transferOrPostingEmployeesList);
                console.log(' after stringify transferOrPostingEmployeesList ', req.body.transferOrPostingEmployeesList);
                console.log('yes');
                query = req.body;
                req.body.transferOrPostingEmployeesList = JSON.parse(req.body.transferOrPostingEmployeesList);
                console.log(' after parse transferOrPostingEmployeesList ', req.body.transferOrPostingEmployeesList);
                for(let x of req.body.transferOrPostingEmployeesList){
                    console.log(x);
                    //console.log(parseInt(x.phone, 10));
                    phoneArr.push(x.phone); 
                }
            }
            console.log('phoneArr', phoneArr);
            let reqest = {}
            reqest.body = {
                phone: phoneArr,
                module: req.body.module,
                date: req.body.dateOfOrder,
                fileName: req.file.filename
            }
            console.log('request ', reqest);
            const data = await employeeUpdate.create(query);
            const goSent = await whatsapp.sendWhatsapp(reqest, res);
            successRes(res, data, 'Bulk Employees transfer/posting Added successfully');
    } catch (error) {
            console.log('catch create employeeUpdate', error);
            errorRes(res, error, "Error on Bulk Employees transfer/posting Add");
    }
}

// Get employeeUpdate
exports.getEmployeeUpdate = async (req, res) => {
        console.log('helo from employeeUpdate controller', req.query);
        try {
            let query = {};
            let data;
            let admins = [];
            let adminIds = [];
            if(req.query.employeeProfileId && req.query.updateType){
                data  = await employeeUpdate.find({
                    'transferOrPostingEmployeesList.empProfileId': req.query.employeeProfileId,
                    'updateType': req.query.updateType
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
                .sort({ dateOfOrder: -1 }) // Sort by dateOfOrder in descending order (-1)
                .exec();
                
                console.log(data, 'Employee Update listed if Successfully');
                successRes(res, data, 'Employee Update listed Successfully');
            }
            else if(req.query._id){
                query.where = req.query;
                data = await employeeUpdate.find(req.query)
                // .populate({
                //     path: 'transferOrPostingEmployeesList.empProfileId',
                //     model: 'employeeProfile', // Model of the application collection
                //     select: ['batch', 'mobileNo1'] // Fields to select from the application collection
                // })  
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
                console.log(data, 'Employee Update listed if Successfully');
                successRes(res, data, 'Employee Update listed Successfully');
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
                     data = await employeeUpdate.find(profileQuery)
                .populate({
                    path: 'transferOrPostingEmployeesList.empProfileId',
                    model: 'employeeProfile', // Model of the employeeProfile collection
                    select: ['batch', 'mobileNo1'] // Fields to select from the employeeProfile collection
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
                
            console.log(data, 'Employee Update listed if Successfully');
            successRes(res, data, 'Employee Update listed Successfully');
                    
            }
            else{
                data = await employeeUpdate.find()
                .populate({
                    path: 'transferOrPostingEmployeesList.empProfileId',
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
            successRes(res, data, 'Employee Update listed Successfully');
            }
        } catch (error) {
            console.log('error', error.reason);
            errorRes(res, error, "Error on listing employee Update");
        }
    }

    // posting/promotion/transfer updation
exports.updateTransferPosting = async (req, res) => {
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
            if(update.transferOrPostingEmployeesList){
                console.log(' original transferOrPostingEmployeesList ', update.transferOrPostingEmployeesList);
                //update.transferOrPostingEmployeesList = JSON.stringify(update.transferOrPostingEmployeesList);
                console.log(' after stringify transferOrPostingEmployeesList ', update.transferOrPostingEmployeesList);
                console.log('yes');
                //query = req.body;
                update.transferOrPostingEmployeesList = JSON.parse(update.transferOrPostingEmployeesList);
                console.log(' after parse transferOrPostingEmployeesList ', update.transferOrPostingEmployeesList);
            }
            console.log('value got');
            const data = await employeeUpdate.findOneAndUpdate(filter, update, {
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
                const data = await employeeUpdate.findOneAndUpdate(filter, update, {
                    new: true
                  });
                console.log('data updated ', data);

                console.log('phoneArr', req.body.phoneArr);
                let reqest = {}
                reqest.body = {
                    phone: req.body.phoneArr,
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