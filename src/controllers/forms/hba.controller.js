const hba = require('../../models/forms/hba.model');
const login = require('../../models/login/login.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")
const whatsapp = require('../whatsapp/whatsapp.controller');
const empProfile = require('../employee/employeeProfile.controller');
const upload = require("../../middlewares/upload");
const gpf = require('../../models/forms/gpf.model');

// Hba creation
exports.addHba = async (req, res) => {
    try {
        console.log('try create Hba', req.body);
        const query = req.body;

        if (req.files && req.files['orderFile'] && req.files['orderFile'].length > 0) {
            // If orderFile file exists
            query.orderFile = req.files['orderFile'][0].path; // Assuming only one file is uploaded
            console.log('Uploaded orderFile file path:', req.files['orderFile'][0].path);
        } else {
            throw new Error('orderFile upload failed: No orderFile file uploaded');
        }
        console.log('query ', query);

        if (req.files && req.files['conductRulePermissionAttachment'] && req.files['conductRulePermissionAttachment'].length > 0) {
            // If conductRulePermissionAttachment file exists
            const conductRulePermissionAttachmentPath = req.files['conductRulePermissionAttachment'][0].path;
            console.log('Uploaded conductRulePermissionAttachment file path:', conductRulePermissionAttachmentPath);

            // Add conductRulePermissionAttachment to each installment
            if (req.files && req.files['conductRulePermissionAttachment'] && req.files['conductRulePermissionAttachment'].length > 0) {
                // If conductRulePermissionAttachment file exists
                const conductRulePermissionAttachmentPath = req.files['conductRulePermissionAttachment'][0].path;
                console.log('Uploaded conductRulePermissionAttachment file path:', conductRulePermissionAttachmentPath);
    
                // Add conductRulePermissionAttachment to each installment
                if (Array.isArray(query.installments)) {
                    query.installments = query.installments.map(installment => {
                        // Add conductRulePermissionAttachment and other fields if they exist
                        installment.conductRulePermissionAttachment = conductRulePermissionAttachmentPath;
                        
                        // If you want to add additional properties like conductRulePermission, make sure they're present
                        // Here I'm assuming you want to copy the original values from the request
                        installment.conductRulePermission = req.body.conductRulePermission || installment.conductRulePermission;
                        installment.installmentNumber = req.body.installmentNumber || installment.installmentNumber;
                        installment.amount = req.body.amount || installment.amount;
                        installment.installmentDate = req.body.installmentDate || installment.installmentDate;
                        
                        return installment;
                    });
                }
            }

        }
        const data = await hba.create(query);
        let reqest = {}
        reqest.body = {
            phone: req.body.phone,
            module: req.body.module,
            date: req.body.dateOfOrder,
            fileName: query.orderFile
        }
        const goSent = await whatsapp.sendWhatsapp(reqest, res);
        successRes(res, data, 'Hba created Successfully');
    } catch (error) {
        console.log('catch create Hba', error);
        errorRes(res, error, "Error on creating Hba");
    }
    }

    exports.getHba = async (req, res) => {
        console.log('helo from Hba controller', req.query);
        try {
            let query = {};
            let data;
            let resultData = [];
            let admins = [];
            let adminIds = [];
            if(req.query._id){
                query.where = req.query;
                data = await hba.find(req.query)
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
                    console.log('data', data.length, data)
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
                                // updateType: uniqueArray[0].updateType,
                                // orderTypeCategoryCode: uniqueArray[0].orderTypeCategoryCode,
                                // orderNumber: uniqueArray[0].orderNumber,
                                // orderForCategoryCode: uniqueArray[0].orderForCategoryCode,
                                _id: data0._id,
                                officerName: data0.officerName,
                                employeeProfileId: data0.employeeProfileId,
                                designation: data0.designation,
                                designationId: data0.designationId,
                                department: data0.department,
                                departmentId: data0.departmentId,
                                stateId: data0.stateId,
                                state: data0.state,
                                districtId: data0.districtId,
                                district: data0.district,
                                hbaAvailedFor: data0.hbaAvailedFor,
                                typeOfProperty: data0.typeOfProperty,
                                dateOfApplication: data0.dateOfApplication,
                                totalCostOfProperty: data0.totalCostOfProperty,
                                isExisingResidenceAvailable: data0.isExisingResidenceAvailable,
                                twoBRelacation: data0.twoBRelacation,
                                totalHbaAvailed: data0.totalHbaAvailed,
                                totalNumberOfInstallments: data0.totalNumberOfInstallments,
                                totalNumberOfRecoveryMonths: data0.totalNumberOfRecoveryMonths,
                                installments: data0.installments,
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
                        stateId: data0.stateId,
                                state: data0.state,
                                districtId: data0.districtId,
                                district: data0.district,
                                hbaAvailedFor: data0.hbaAvailedFor,
                                typeOfProperty: data0.typeOfProperty,
                                dateOfApplication: data0.dateOfApplication,
                                totalCostOfProperty: data0.totalCostOfProperty,
                                isExisingResidenceAvailable: data0.isExisingResidenceAvailable,
                                twoBRelacation: data0.twoBRelacation,
                                totalHbaAvailed: data0.totalHbaAvailed,
                                totalNumberOfInstallments: data0.totalNumberOfInstallments,
                                totalNumberOfRecoveryMonths: data0.totalNumberOfRecoveryMonths,
                                installments: data0.installments,
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
                successRes(res, resultData, 'Hba listed Successfully');
            }
            else if(req.query.employeeProfileId){
                console.log('profileid', req.query.employeeProfileId)
                query.where = req.query;
                data = await hba.find({
                    'employeeProfileId': req.query.employeeProfileId
                })
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
                console.log(data, 'hba listed else Successfully');
                successRes(res, data, 'hba listed Successfully');
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
                 data = await hba.find(profileQuery)
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
                                // updateType: uniqueArray[0].updateType,
                                // orderTypeCategoryCode: uniqueArray[0].orderTypeCategoryCode,
                                // orderNumber: uniqueArray[0].orderNumber,
                                // orderForCategoryCode: uniqueArray[0].orderForCategoryCode,
                                _id: data0._id,
                                officerName: data0.officerName,
                                employeeProfileId: data0.employeeProfileId,
                                designation: data0.designation,
                                designationId: data0.designationId,
                                department: data0.department,
                                departmentId: data0.departmentId,
                                stateId: data0.stateId,
                                state: data0.state,
                                districtId: data0.districtId,
                                district: data0.district,
                                hbaAvailedFor: data0.hbaAvailedFor,
                                typeOfProperty: data0.typeOfProperty,
                                dateOfApplication: data0.dateOfApplication,
                                totalCostOfProperty: data0.totalCostOfProperty,
                                isExisingResidenceAvailable: data0.isExisingResidenceAvailable,
                                twoBRelacation: data0.twoBRelacation,
                                totalHbaAvailed: data0.totalHbaAvailed,
                                totalNumberOfInstallments: data0.totalNumberOfInstallments,
                                totalNumberOfRecoveryMonths: data0.totalNumberOfRecoveryMonths,
                                installments: data0.installments,
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
                                stateId: data0.stateId,
                                state: data0.state,
                                districtId: data0.districtId,
                                district: data0.district,
                                hbaAvailedFor: data0.hbaAvailedFor,
                                typeOfProperty: data0.typeOfProperty,
                                dateOfApplication: data0.dateOfApplication,
                                totalCostOfProperty: data0.totalCostOfProperty,
                                isExisingResidenceAvailable: data0.isExisingResidenceAvailable,
                                twoBRelacation: data0.twoBRelacation,
                                totalHbaAvailed: data0.totalHbaAvailed,
                                totalNumberOfInstallments: data0.totalNumberOfInstallments,
                                totalNumberOfRecoveryMonths: data0.totalNumberOfRecoveryMonths,
                                installments: data0.installments,
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
            successRes(res, resultData, 'Hba listed Successfully');
            }
            else{
                data = await hba.find()
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
            successRes(res, data, 'Hba listed Successfully');
            }
                
        } catch (error) {
            console.log('error', error);
            errorRes(res, error, "Error on listing Gpf");
        }
    }
    
    // exports.updateHba = async (req, res) => {
    //     try {
    //         // console.log('try update hba', req.body);
    //         console.log('try update hba', req.body.installments);
    //         //const query = req.body;
    //         let query = {};
    //         // if(req.file){
    //         //     req.body.orderFile = req.file.path
    
    //         //     console.log('Uploaded file path:', req.file.path);
    //         // }
    //         // if(req.body.installments){
    //         //     console.log(' original transferOrPostingEmployeesList ', req.body.installments);
    //         //     req.body.installments = JSON.stringify(req.body.installments);
    //         //     console.log(' after stringify installments ', req.body.installments);
    //         //     console.log('yes');
    //         //     query = req.body;
    //         //     req.body.installments = JSON.parse(req.body.installments);
    //         //     console.log(' after parse installments ', req.body.installments);
    //         // }
    //         // let filter;
    //         // let update = {};
    //         // update = req.body;
    //         // if(query.id){
    //         //     console.log('id coming');
    //         //     console.log(query.id);
    //         //     filter = {
    //         //         _id : query.id
    //         //     }
    //         // }
    //         // else{
    //         //     console.log('id coming');
    //         //     throw 'pls provide id field';
    //         // }
                
    //         // console.log('update ', update);
    //         // console.log('filter ', filter);
    //         // // Check if the update object is empty or not
    //         // if (Object.keys(update).length > 0) {
    //         //     console.log('value got');
    //         //     const data = await hba.findOneAndUpdate(filter, update, {
    //         //         new: true
    //         //       });
    //         //     console.log('data updated ', data);
    //         //     successRes(res, data, 'data updated Successfully');
    //         // } else {
    //         //     console.log('empty');
    //         //     throw 'Update value missing';
    //         // }
    //     } catch (error) {
    //         console.log('catch update hba', error);
    //         errorRes(res, error, "Error on hba updation");
    //     }
    //     }
 

 
exports.updateHba = async (req, res) => {
    try {
        console.log("Received HBA update request");

        const query = { ...req.body };
        console.log('1')
        console.log(req.body)
        // console.log("Incoming files:", req.files); // Debugging

        if (req.files && req.files["orderFile"]) {
            query.orderFile = req.files["orderFile"][0].path;
        }

        const processedInstallments = [];
        const installmentKeys = Object.keys(req.body)
            .filter((key) => key.startsWith("installments["))
            .sort();

        const installmentMap = new Map();
        installmentKeys.forEach((key) => {
            const matches = key.match(/installments\[(\d+)\]\[(.+)\]/);
            console.log('matches',matches)
            if (matches) {
                const [, index, field] = matches;
                if (!installmentMap.has(index)) {
                    installmentMap.set(index, {});
                }
                installmentMap.get(index)[field] = req.body[key];
            }
        });

        for (var z = 0; z < req.body.installments.length; z++) {
            // Correctly assign conductRulePermissionAttachment from req.files
            const fileFieldName = `installments[${z}][conductRulePermissionAttachment]`;
            console.log(req.files, req.files[fileFieldName]);
        
            if (req.files && req.files[fileFieldName] && req.files[fileFieldName].length > 0) {
                console.log('File found');
                // Assign the first file path as a string
                req.body.installments[z].conductRulePermissionAttachment = req.files[fileFieldName][0].path;
            } else {
                console.log('No file found');
                req.body.installments[z].conductRulePermissionAttachment = ''; // Ensure it's a string
            }
        
            processedInstallments.push(req.body.installments[z]);
        }

        const updateOperations = [];
        for (const installment of processedInstallments) {
            if (!installment._id) {
                // New installment
                updateOperations.push({
                    updateOne: {
                        filter: { _id: query.id },
                        update: { $push: { installments: installment } }
                    }
                });
            } else if (installment.edited === "yes") {
                // Update existing installment
                updateOperations.push({
                    updateOne: {
                        filter: {
                            _id: query.id,
                            "installments._id": installment._id
                        },
                        update: {
                            $set: { "installments.$": installment }
                        }
                    }
                });
            }
        }

        if (updateOperations.length > 0) {
            await hba.bulkWrite(updateOperations);
        }

        const mainDocUpdate = {};
        Object.keys(query).forEach((key) => {
            if (!key.startsWith("installments[") && key !== "id") {
                mainDocUpdate[key] = query[key];
            }
        });

        if (Object.keys(mainDocUpdate).length > 0) {
            await hba.updateOne({ _id: query.id }, { $set: mainDocUpdate });
        }

        return res.json({
            success: true,
            message: "HBA updated successfully",
            updatedData: {
                mainUpdate: mainDocUpdate,
                installments: processedInstallments
            }
        });

    } catch (error) {
        console.error("Error updating HBA:", error);
        return res.status(500).json({
            success: false,
            message: "Error updating HBA",
            error: error.message
        });
    }
};
