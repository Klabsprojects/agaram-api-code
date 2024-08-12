const education = require('../../models/forms/education.model');
const login = require('../../models/login/login.model');
const employeeProfile = require('../../models/employee/employeeProfile.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")
const whatsapp = require('../whatsapp/whatsapp.controller');
const empProfile = require('../employee/employeeProfile.controller');

// education creation
exports.addEducation = async (req, res) => {
    try {
        console.log('try create education', req.body);
        const query = req.body;
        let data;
        console.log('query ', query);
        const { officerName, department, designation, orderType, orderNo, orderFor, dateOfOrder, remarks, degreeData } = req.body;
        console.log('Uploaded file path:', req.file.path);
        if (req.file) {
            query.orderFile = req.file.path;
            console.log('Uploaded file path:', req.file.path);
        } else {
            throw new Error('File upload failed: No file uploaded');
        }
        //const data = await education.create(query);
            // Check if degreeData exists and is an array
            if (degreeData && Array.isArray(degreeData)) {
                data = await education.create(query);
                console.log('data ==> ', data);
                for(let dataDegree of query.degreeData){
                    const newDegreeData = {
                        courseLevel: dataDegree.courseLevel,
                        specialisation: dataDegree.specialisation,
                        degree: dataDegree.degree,
                        instituteName: dataDegree.instituteName,
                        locationState: dataDegree.locationState,
                        locationCountry: dataDegree.locationCountry,
                        durationOfCourse: dataDegree.durationOfCourse,
                        fund: dataDegree.fund,
                        fees: dataDegree.fees,
                        courseCompletedYear: dataDegree.courseCompletedYear,
                        courseCompletedDate: dataDegree.courseCompletedDate,
                        addedBy: "educationForm"
                      };
                    const result = await employeeProfile.updateOne(
                        { _id: query.employeeProfileId }, // Specify the document by _id
                        { $push: { degreeData: newDegreeData } } // Use $push to add new degree data
                      );
                      let reqest = {}
                      reqest.body = {
                        phone: req.body.phone,
                        module: req.body.module,
                        date: req.body.dateOfOrder,
                        fileName: req.file.filename
                    }
                    const goSent = await whatsapp.sendWhatsapp(reqest, res);
                      console.log('Update successful:', result, 'document(s) updated.');
                      
                }
                successRes(res, data, 'Education records created successfully');
                
            } else {
                throw new Error('Invalid degreeData: Expected an array');
            }
    } catch (error) {
        console.log('catch create education', error);
        errorRes(res, error, "Error on creating education");
    }
    }

// Get education
exports.getEducation = async (req, res) => {
        console.log('helo from education controller', req.query);
        try {
            let query = {};
            let data;
            let resultData = [];
            let admins = [];
            let adminIds = [];
            if(req.query._id){
                query.where = req.query;
                data = await education.find(req.query)
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
                        
                        _id: data[0]._id,
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
                }
                else{
                    let dataAll = {
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
                }
                else
                {
                    resultData = [];
                }
                successRes(res, resultData, 'education listed Successfully');
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
                 data = await education.find(profileQuery)
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
                        else{
                            dataAll = {
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
                    else
                    {
                        resultData = [];
                    }
            successRes(res, resultData, 'education listed Successfully');
            }
            else{
                data = await education.find()
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
            errorRes(res, error, "Error on listing education");
        }
    }

    exports.updateEducation = async (req, res) => {
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
                const data = await education.findOneAndUpdate(filter, update, {
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
    
        exports.updateEducationApprovalStatus = async (req, res) => {
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
                    const data = await education.findOneAndUpdate(filter, update, {
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