const leave = require('../../models/employee/leave.model');
const login = require('../../models/login/login.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")
const whatsapp = require('../whatsapp/whatsapp.controller');
const employeeProfile = require('../../models/employee/employeeProfile.model');

// leave creation
exports.addLeave = async (req, res) => {
    try {
        console.log('try create leave', req.body);
        const query = req.body;
        //console.log('Uploaded file path:', req.file.path);
        if (req.file) {
            query.orderFile = req.file.path;
            console.log('Uploaded file path:', req.file.path);
            console.log('Uploaded file path:', req.file.filename);
        } else {
            throw new Error('File upload failed: No file uploaded');
        }
        const data = await leave.create(query);
        let reqest = {}
        reqest.body = {
            phone: req.body.phone,
            module: req.body.module,
            date: req.body.dateOfOrder,
            fileName: req.file.filename
        }
        //const goSent = await whatsapp.sendWhatsapp(reqest, res);
        successRes(res, data, 'leave created Successfully');
    } catch (error) {
        console.log('catch create leave', error);
        errorRes(res, error, "Error on creating leave");
    }
    }

// Get leave
exports.getLeave = async (req, res) => {
        console.log('helo from leave controller', req.query);
        try {
            let query = {};
            let data = [];
            let admins = [];
            let adminIds = [];

            if(req.query._id){
                /////old
                query.where = req.query;
                data = await leave.find(req.query)
                .populate({
                    path: 'employeeProfileId',
                    model: 'employeeProfile', // Model of the application collection
                    select: ['batch', 'mobileNo1', 'loginId'] // Fields to select from the application collection
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
                console.log(data, 'leave listed else Successfully');
                successRes(res, data, 'leave listed Successfully');
            }

            else if(req.query.employeeProfileId){
                console.log('profileid', req.query.employeeProfileId)
                //query.where = req.query;
                query.employeeProfileId = req.query.employeeProfileId;
                        // Adding date filter to the query if fromdate and todate exist
        if (req.query.fromdate && req.query.todate) {
            const fromDate = new Date(req.query.fromdate);
            const toDate = new Date(req.query.todate);
            //query.dateOfOrder = { $gte: fromDate, $lte: toDate }; // Adding date range to the query
            query.fromDate= { $gte: fromDate }; // From date greater than or equal to startDate
            query.endDate= { $lte: toDate };   // End date less than or equal to endDate
        }
        if(req.query.typeOfLeave){
            query.typeOfLeave = req.query.typeOfLeave;
        }
        console.log('Query ', query);
                data = await leave.find(query)
                
            //     (
            //         {
            //         'employeeProfileId': req.query.employeeProfileId
            //     }
            // )
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
                console.log(data, 'leave listed else Successfully');
                successRes(res, data, 'leave listed Successfully');
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
            if (req.query.fromdate && req.query.todate) {
                const fromDate = new Date(req.query.fromdate);
                const toDate = new Date(req.query.todate);
                //query.dateOfOrder = { $gte: fromDate, $lte: toDate }; // Adding date range to the query
                profileQuery.fromDate= { $gte: fromDate }; // From date greater than or equal to startDate
                profileQuery.endDate= { $lte: toDate };   // End date less than or equal to endDate
            }
            if(req.query.typeOfLeave){
                profileQuery.typeOfLeave = req.query.typeOfLeave;
            }
            console.log('profileQuery ', profileQuery);
                 // Step 2: Query the leave collection where submittedBy matches any of the admin IDs
                 data = await leave.find(profileQuery)
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
                
            console.log(data, 'leave listed if Successfully');
            successRes(res, data, 'leave listed Successfully');
                    
            }
            else
                {
                    if (req.query.fromdate && req.query.todate) {
                        const fromDate = new Date(req.query.fromdate);
                        const toDate = new Date(req.query.todate);
                        //query.dateOfOrder = { $gte: fromDate, $lte: toDate }; // Adding date range to the query
                        query.fromDate= { $gte: fromDate }; // From date greater than or equal to startDate
                        query.endDate= { $lte: toDate };   // End date less than or equal to endDate
                    }
                    if(req.query.typeOfLeave){
                        query.typeOfLeave = req.query.typeOfLeave;
                    }
                    console.log('query ', query);
                    data = await leave.find(query)
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
                    console.log(data, 'leave listed else Successfully');
                    successRes(res, data, 'leave listed Successfully');
                }
        } catch (error) {
            console.log('error', error);
            errorRes(res, error, "Error on listing leave");
        }
    }

    // leave updation
    exports.updateLeave = async (req, res) => {
        try {
            console.log('try update leave block', req.body);
            const query = req.body;
            if(req.file){
                req.body.orderFile = req.file.path
                query.orderFile = req.file.path
                console.log('Uploaded file path:', req.file.path);
            }
            let filter;
            let update = {};
            update = req.body;
            // update = {
            //     fullName: query.fullName,
            // }
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
                const data = await leave.findOneAndUpdate(filter, update, {
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
                    const data = await leave.findOneAndUpdate(filter, update, {
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