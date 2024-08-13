const safAllocation = require('../../models/forms/safAllocation.model');
const block = require('../../models/forms/block.model');
const login = require('../../models/login/login.model');
const safApplication = require('../../models/forms/safApplication.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")
const whatsapp = require('../whatsapp/whatsapp.controller');
const employeeProfile = require('../../models/employee/employeeProfile.model');
const empProfile = require('../employee/employeeProfile.controller');

// safAllocation creation
exports.addSafAllocation = async (req, res) => {
    try {
        console.log('try create safAllocation', req.body);
        const query = req.body;
        if (req.file) {
            query.orderFile = req.file.path;
            console.log('Uploaded file path:', req.file.path);
        } else {
            throw new Error('File upload failed: No file uploaded');
        }
        const data = await safAllocation.create(query);
        let reqest = {}
        reqest.body = {
            phone: req.body.phone,
            module: req.body.module,
            date: req.body.dateOfOrder,
            fileName: req.file.filename
        }
        const goSent = await whatsapp.sendWhatsapp(reqest, res);
        if(req.body.blockId && Object.keys(data).length > 0)
            await block.updateOne({ _id: req.body.blockId }, { $set: { allocationStatus: true, allocationTo: data.employeeProfileId } });
        if(req.body.dateOfAccomodation){
            if(req.body.dateOfAccomodation){
                const today = new Date();
                const dateOfAccomodation = new Date(req.body.dateOfAccomodation);
                const millisecondsInADay = 1000 * 60 * 60 * 24;
                const daysDifference = Math.floor((dateOfAccomodation - today) / millisecondsInADay);
    
                // Update waiting period count
                await updateWaitingPeriodCount(daysDifference);
                successRes(res, data, 'safAllocation created Successfully');
            }
        }
        
    } catch (error) {
        console.log('catch create safAllocation', error);
        errorRes(res, error, "Error on creating safAllocation");
    }
    }

// Function to update waiting period count
async function updateWaitingPeriodCount(daysDifference) {
    const applications = await safApplication.find().exec();
    applications.forEach(async (application) => {
        if (application.applicationStatus != 'closed') {
            const currentCount = application.waitingPeriod || 0;
            application.waitingPeriod = currentCount + daysDifference;
            application.applicationStatus = "alloted"
            await application.save();
        }
    });
}

// Get safAllocation
exports.getSafAllocationOld = async (req, res) => {
        console.log('helo from safAllocation controller', req.query);
        try {
            let query = {};
            let data;
            let resultData = [];
            let admins = [];
            let adminIds = [];
            if(req.query._id){
                query.where = req.query;
                data = await safAllocation.find(req.query)
                .populate({
                    path: 'blockId',
                    //select: 'field1 field2', // Fields to select from the block collection
                })
                .populate({
                    path: 'applicationId',
                    model: 'safApplication', // Model of the application collection
                    //select: 'fieldA fieldB' // Fields to select from the application collection
                }) 
                .populate({
                    path: 'employeeProfileId',
                    model: 'employeeProfile', // Model of the application collection
                    select: ['batch', 'mobileNo1'] // Fields to select from the application collection
                })  
                .exec();
                console.log('data[0] ', data[0]);
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
                            blockId: data[0].blockId,
                            applicationId: data[0].applicationId,
                            dateOfAccomodation: data[0].dateOfAccomodation,
                            dateOfVacating: data[0].dateOfVacating,
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
        successRes(res, resultData, 'safAllocation listed Successfully');
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
                 data = await safAllocation.find({ submittedBy: { $in: adminIds } })
                .populate({
                    path: 'blockId',
                    //select: 'field1 field2', // Fields to select from the block collection
                })
                .populate({
                    path: 'applicationId',
                    model: 'safApplication', // Model of the application collection
                    //select: 'fieldA fieldB' // Fields to select from the application collection
                }) 
                .populate({
                    path: 'employeeProfileId',
                    model: 'employeeProfile', // Model of the application collection
                    select: ['batch', 'mobileNo1'] // Fields to select from the application collection
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
                successRes(res, resultData, 'immovable listed Successfully');
                    
            }
            else{
                data = await safAllocation.find()
                .populate({
                    path: 'blockId',
                    //select: 'field1 field2', // Fields to select from the block collection
                })
                .populate({
                    path: 'applicationId',
                    model: 'safApplication', // Model of the application collection
                    //select: 'fieldA fieldB' // Fields to select from the application collection
                })  
                .populate({
                    path: 'employeeProfileId',
                    model: 'employeeProfile', // Model of the application collection
                    select: ['batch', 'mobileNo1'] // Fields to select from the application collection
                })    
                .exec();
            successRes(res, data, 'safAllocation listed Successfully');
            }
                
        } catch (error) {
            console.log('error', error);
            errorRes(res, error, "Error on listing safAllocation");
        }
    }


    exports.getSafAllocation = async (req, res) => {
        console.log('helo from safAllocation controller', req.query);
        try {
            let query = {};
            let data;
            let resultData = [];
            let admins = [];
            let adminIds = [];
            if(req.query._id || req.query.employeeProfileId){
                query.where = req.query;
                data = await safAllocation.find(req.query)
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
                                blockId: data0.blockId,
                                applicationId: data0.applicationId,
                                dateOfAccomodation: data0.dateOfAccomodation,
                                dateOfVacating: data0.dateOfVacating,
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
                        employeeId: data0.employeeId,
                        designation: data0.designation,
                        designationId: data0.designationId,
                        department: data0.department,
                        departmentId: data0.departmentId,
                        blockId: data0.blockId,
                        applicationId: data0.applicationId,
                        dateOfAccomodation: data0.dateOfAccomodation,
                        dateOfVacating: data0.dateOfVacating,
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
                successRes(res, resultData, 'safAllocation listed Successfully');
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
                 data = await safAllocation.find(profileQuery)
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
                                blockId: data0.blockId,
                                applicationId: data0.applicationId,
                                dateOfAccomodation: data0.dateOfAccomodation,
                                dateOfVacating: data0.dateOfVacating,
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
                                employeeId: data0.employeeId,
                                designation: data0.designation,
                                designationId: data0.designationId,
                                department: data0.department,
                                departmentId: data0.departmentId,
                                blockId: data0.blockId,
                                applicationId: data0.applicationId,
                                dateOfAccomodation: data0.dateOfAccomodation,
                                dateOfVacating: data0.dateOfVacating,
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
            successRes(res, resultData, 'safAllocation listed Successfully');
            }
            else{
                data = await safAllocation.find()
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
            successRes(res, data, 'safAllocation listed Successfully');
            }
                
        } catch (error) {
            console.log('error', error);
            errorRes(res, error, "Error on listing safAllocation");
        }
    }

    // safAllocation1 updation
/*exports.updateSafAllocation1 = async (req, res) => {
    try {
        console.log('try update safAllocation', req.body);
        const query = req.body;
        let updateBlock = {};
        let filterBlock;
        let updateAlloc = {};
        let filterAlloc;
        if(query.allocationStatus && query.allocationTo){
            if(query.allocationStatus == "false"){
                console.log('false');
                updateAlloc = {
                    //blockId: null
                }
                updateBlock = {
                    allocationStatus : false,
                    allocationTo : null
                }
            }else
            {
                updateBlock = {
                    allocationStatus : query.allocationStatus,
                    allocationTo : query.allocationTo
                }
            }
        }
        else throw 'allocstatus not coming';
        if(query.blockId){
            if(query.allocationStatus == "false"){
                console.log('false');
                updateAlloc = {
                    //blockId: null
                    dateOfAccomodation: Date,
	                dateOfVacating: Date,
                }
                updateBlock = {
                    allocationStatus : false,
                    allocationTo : null
                }
                filterBlock = {
                    _id : query.blockId
                }
            }else
            {
            filterBlock = {
                _id : query.blockId
            }
            updateAlloc = {
                blockId: query.blockId
            }
        }
        }

        if(query.id){
            filterAlloc = {
                _id : query.id
            }
        }
        else
            throw 'pls provide id field';
        console.log('updateAlloc ', updateAlloc);
        console.log('filterAlloc ', filterAlloc);
        console.log('updateBlock ', updateBlock);
        console.log('filterBlock ', filterBlock);
        // Check if the update object is empty or not
        if (Object.keys(updateAlloc).length > 0 && Object.keys(updateBlock).length > 0) {
            console.log('value got');
            const data = await safAllocation.findOneAndUpdate(filterAlloc, updateAlloc, {
                new: true
            });
            const data1 = await block.findOneAndUpdate(filterBlock, updateBlock, {
                new: true
            });
            console.log('data updated ', data);
            successRes(res, data, 'safAllocation updated Successfully');
        } else {
            console.log('empty');
            throw 'Update value missing';
        }
    } catch (error) {
        console.log('catch update safAllocation updation', error);
        errorRes(res, error, error);
    }
    }
*/

// safAllocation updation
exports.updateSafAllocation = async (req, res) => {
    try {
        console.log('try update safAllocation', req.body);
        const query = req.body;
        let updateBlock = {};
        let filterBlock;
        let updateAlloc = {};
        let filterAlloc;
        let updateApply = {};
        let filterApply;
        if(query.dateOfVacating && query.blockId && query.id && query.employeeProfileId){
            updateAlloc = {
                dateOfVacating : query.dateOfVacating
                }
            filterAlloc = {
                _id : query.id
                }
            
            updateBlock = {
                allocationStatus : false,
                allocationTo : "null"
                }
            filterBlock = {
                _id : query.blockId
                }
            
            updateApply = {
                applicationStatus : "closed"
                }
            filterApply = {
                employeeProfileId : query.employeeProfileId,
                applicationStatus : "open"
            }
        }
        else throw 'allocstatus not coming';
        console.log('updateAlloc ', updateAlloc);
        console.log('filterAlloc ', filterAlloc);
        console.log('updateBlock ', updateBlock);
        console.log('filterBlock ', filterBlock);
        // Check if the update object is empty or not
        if (Object.keys(updateAlloc).length > 0 && Object.keys(updateBlock).length > 0 
        && Object.keys(updateApply).length > 0) {
            console.log('value got');
            const data = await safAllocation.findOneAndUpdate(filterAlloc, updateAlloc, {
                new: true
            });
            const data1 = await block.findOneAndUpdate(filterBlock, updateBlock, {
                new: true
            });
            const data2 = await safApplication.findOneAndUpdate(filterApply, updateApply, {
                new: true
            });
            console.log('data updated ', data);
            successRes(res, data, 'safAllocation updated Successfully');
        } else {
            console.log('empty');
            throw 'Update value missing';
        }
    } catch (error) {
        console.log('catch update safAllocation updation', error);
        errorRes(res, error, error);
    }
    }

    exports.editSafAllocation = async (req, res) => {
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
                const data = await safAllocation.findOneAndUpdate(filter, update, {
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
    
        exports.updateSafAllocationApprovalStatus = async (req, res) => {
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
                    const data = await safAllocation.findOneAndUpdate(filter, update, {
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