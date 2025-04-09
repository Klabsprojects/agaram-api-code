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

        const objectIdFields = [
            'employeeProfileId',
            'designationId',
            'departmentId',
            'state',
            'stateId',
            'district',
            'hbaAvailedFor',
            'typeOfProperty',
            'totalNumberOfInstallments',
            'orderType',
            'orderFor',
            'submittedBy',
            'approvedBy'
        ];
        
        // Convert empty strings to null
        objectIdFields.forEach(field => {
            if (query[field] === '') {
                query[field] = null;
            }
        });

        if (req.files && req.files['orderFile'] && req.files['orderFile'].length > 0) {
            // If orderFile file exists
            query.orderFile = req.files['orderFile'][0].path; // Assuming only one file is uploaded
            console.log('Uploaded orderFile file path:', req.files['orderFile'][0].path);
        } 
        // else {
        //     throw new Error('orderFile upload failed: No orderFile file uploaded');
        // }
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

    // exports.getHba = async (req, res) => {
    //     console.log('helo from Hba controller', req.query);
    //     try {
    //         let query = {};
    //         let data;
    //         let resultData = [];
    //         let admins = [];
    //         let adminIds = [];
    //         if(req.query._id){
    //             query.where = req.query;
    //             data = await hba.find(req.query)
    //             .populate({
    //                 path: 'employeeProfileId',
    //                 model: 'employeeProfile', // Model of the application collection
    //                 select: ['batch', 'mobileNo1'] // Fields to select from the application collection
    //             })  
    //             .populate({
    //                 path: 'submittedBy',
    //                 model: 'login', // Ensure the model name matches exactly
    //                 select: ['username', 'loginAs'] // Specify the fields you want to include from EmployeeProfile
    //             })
    //             .populate({
    //                 path: 'approvedBy',
    //                 model: 'login', // Ensure the model name matches exactly
    //                 select: ['username', 'loginAs'] // Specify the fields you want to include from EmployeeProfile
    //             }) 
    //             .exec();
    //             if(data.length > 0){
    //                 console.log('data', data.length, data)
    //                 for(let data0 of data){
    //                     console.log('IDDD => ', data0);
    //                     console.log('IDDD => ', data0.employeeProfileId._id);
    //                     let updateQueryJson = {
    //                         empId: data0.employeeProfileId._id
    //                     }
    //             uniqueArray = await empProfile.getEmployeeUpdateFilter(updateQueryJson);
    //             console.log('length ==> ', uniqueArray.length);
    //                     if(uniqueArray.length > 0 && uniqueArray[0].transferOrPostingEmployeesList){
    //                         for(let transferOrPostingEmployeesList of uniqueArray[0].transferOrPostingEmployeesList){
    //                             console.log('Check ', transferOrPostingEmployeesList.fullName, transferOrPostingEmployeesList.empProfileId._id.toString(),
    //                             data0.employeeProfileId._id.toString());
    //                             if(transferOrPostingEmployeesList.empProfileId._id.toString() === data0.employeeProfileId._id.toString()){
    //                                 console.log('Matched ');
    //                                 console.log('posting available')
    //                         dataAll = {
    //                             toPostingInCategoryCode: transferOrPostingEmployeesList.toPostingInCategoryCode,
    //                             toDepartmentId: transferOrPostingEmployeesList.toDepartmentId,
    //                             toDesignationId: transferOrPostingEmployeesList.toDesignationId,
    //                             postTypeCategoryCode: transferOrPostingEmployeesList.postTypeCategoryCode,
    //                             locationChangeCategoryId: transferOrPostingEmployeesList.locationChangeCategoryId,
    //                             // updateType: uniqueArray[0].updateType,
    //                             // orderTypeCategoryCode: uniqueArray[0].orderTypeCategoryCode,
    //                             // orderNumber: uniqueArray[0].orderNumber,
    //                             // orderForCategoryCode: uniqueArray[0].orderForCategoryCode,
    //                             _id: data0._id,
    //                             officerName: data0.officerName,
    //                             employeeProfileId: data0.employeeProfileId,
    //                             designation: data0.designation,
    //                             designationId: data0.designationId,
    //                             department: data0.department,
    //                             departmentId: data0.departmentId,
    //                             stateId: data0.stateId,
    //                             state: data0.state,
    //                             districtId: data0.districtId,
    //                             district: data0.district,
    //                             hbaAvailedFor: data0.hbaAvailedFor,
    //                             typeOfProperty: data0.typeOfProperty,
    //                             dateOfApplication: data0.dateOfApplication,
    //                             totalCostOfProperty: data0.totalCostOfProperty,
    //                             isExisingResidenceAvailable: data0.isExisingResidenceAvailable,
    //                             twoBRelacation: data0.twoBRelacation,
    //                             totalHbaAvailed: data0.totalHbaAvailed,
    //                             totalNumberOfInstallments: data0.totalNumberOfInstallments,
    //                             totalNumberOfRecoveryMonths: data0.totalNumberOfRecoveryMonths,
    //                             installments: data0.installments,
    //                             dateOfOrder: data0.dateOfOrder,
    //                             orderType: data0.orderType,
    //                             orderNo: data0.orderNo,
    //                             orderFor: data0.orderFor,
    //                             remarks: data0.remarks,
    //                             orderFile: data0.orderFile,
    //                             submittedBy: data0.submittedBy,
    //                             approvedBy: data0.approvedBy,
    //                             approvedDate: data0.approvedDate,
    //                             approvalStatus: data0.approvalStatus,
    //                 }
    //         resultData.push(dataAll);
    //             }
    //                 }
    //             }
    //             else{
    //                 let dataAll = {
    //                     _id: data0._id,
    //                     officerName: data0.officerName,
    //                     employeeProfileId: data0.employeeProfileId,
    //                     designation: data0.designation,
    //                     designationId: data0.designationId,
    //                     department: data0.department,
    //                     departmentId: data0.departmentId,
    //                     stateId: data0.stateId,
    //                             state: data0.state,
    //                             districtId: data0.districtId,
    //                             district: data0.district,
    //                             hbaAvailedFor: data0.hbaAvailedFor,
    //                             typeOfProperty: data0.typeOfProperty,
    //                             dateOfApplication: data0.dateOfApplication,
    //                             totalCostOfProperty: data0.totalCostOfProperty,
    //                             isExisingResidenceAvailable: data0.isExisingResidenceAvailable,
    //                             twoBRelacation: data0.twoBRelacation,
    //                             totalHbaAvailed: data0.totalHbaAvailed,
    //                             totalNumberOfInstallments: data0.totalNumberOfInstallments,
    //                             totalNumberOfRecoveryMonths: data0.totalNumberOfRecoveryMonths,
    //                             installments: data0.installments,
    //                     dateOfOrder: data0.dateOfOrder,
    //                     orderType: data0.orderType,
    //                     orderNo: data0.orderNo,
    //                     orderFor: data0.orderFor,
    //                     remarks: data0.remarks,
    //                     orderFile: data0.orderFile,
    //                     submittedBy: data0.submittedBy,
    //                     approvedBy: data0.approvedBy,
    //                     approvedDate: data0.approvedDate,
    //                     approvalStatus: data0.approvalStatus,
    //                 }
    //         resultData.push(dataAll);
    //             }
    //         }
    //             }
    //             else
    //             {
    //                 resultData = [];
    //             }
    //             successRes(res, resultData, 'Hba listed Successfully');
    //         }
    //         else if(req.query.employeeProfileId){
    //             console.log('profileid', req.query.employeeProfileId)
    //             query.employeeProfileId = req.query.employeeProfileId;
    //         if (req.query.minPrice && req.query.maxPrice) {
    //             const minPrice = req.query.minPrice;
    //             const maxPrice = req.query.maxPrice;
    //             query.totalCostOfProperty = { $gte: minPrice, $lte: maxPrice }; // Adding date range to the query
    //         }
    //         if(req.query.hbaAvailedFor){
    //             query.hbaAvailedFor = req.query.hbaAvailedFor;
    //         }
    //         if(req.query.typeOfProperty){
    //             query.typeOfProperty = req.query.typeOfProperty;
    //         }
    //         console.log('query ', query);
    //             data = await hba.find(query)
    //             .populate({
    //                 path: 'employeeProfileId',
    //                 model: 'employeeProfile', // Model of the application collection
    //                 select: ['batch', 'mobileNo1', 'fullName'] // Fields to select from the application collection
    //             })  
    //             .populate({
    //                 path: 'submittedBy',
    //                 model: 'login', // Ensure the model name matches exactly
    //                 select: ['username', 'loginAs'] // Specify the fields you want to include from EmployeeProfile
    //             })
    //             .populate({
    //                 path: 'approvedBy',
    //                 model: 'login', // Ensure the model name matches exactly
    //                 select: ['username', 'loginAs'] // Specify the fields you want to include from EmployeeProfile
    //             }) 
    //             .exec();
    //             console.log(data, 'hba listed else Successfully');
    //             successRes(res, data, 'hba listed Successfully');
    //         }
    //         else if(req.query.loginAs == 'Spl A - SO' ||
    //             req.query.loginAs == 'Spl B - SO' ||
    //             req.query.loginAs == 'Spl A - ASO' || 
    //             req.query.loginAs == 'Spl B - ASO'
    //         ){
    //         if(req.query.loginAs == 'Spl A - SO'){
    //                 admins  = await login.find({ loginAs: { $in: ['Spl A - ASO', 'Spl A - SO'] } }).select('_id').exec();
    //                 if (admins .length === 0) {
    //                     return res.status(404).json({ message: 'No admin users found' });
    //                 }   
    //         }
    //         if(req.query.loginAs == 'Spl A - ASO'){
    //             admins  = await login.find({ loginAs: { $in: ['Spl A - ASO'] } }).select('_id').exec();
    //             if (admins .length === 0) {
    //                 return res.status(404).json({ message: 'No admin users found' });
    //             }   
    //         }
    //         if(req.query.loginAs == 'Spl B - SO'){
    //             admins  = await login.find({ loginAs: { $in: ['Spl B - ASO', 'Spl B - SO'] } }).select('_id').exec();
    //             if (admins .length === 0) {
    //                 return res.status(404).json({ message: 'No admin users found' });
    //             }   
    //         }
    //         if(req.query.loginAs == 'Spl B - ASO'){
    //             admins  = await login.find({ loginAs: { $in: ['Spl B - ASO'] } }).select('_id').exec();
    //             if (admins .length === 0) {
    //                 return res.status(404).json({ message: 'No admin users found' });
    //             }   
    //         }
    //         if(req.query.loginAs == 'Spl A - SO' || req.query.loginAs == 'Spl A - ASO' ||
    //             req.query.loginAs == 'Spl B - SO' || req.query.loginAs == 'Spl B - ASO')
    //         {
    //             adminIds = admins.map(admin => admin._id);
    //         }
    //         console.log('admins ', admins);
    //         console.log('adminIds ', adminIds);
    //         let profileQuery = {
    //             $or: [
    //                 { submittedBy: { $in: adminIds } },
    //                 { approvalStatus: true }
    //             ]
    //         }
    //         if (req.query.minPrice && req.query.maxPrice) {
    //             const minPrice = req.query.minPrice;
    //             const maxPrice = req.query.maxPrice;
    //             profileQuery.totalCostOfProperty = { $gte: minPrice, $lte: maxPrice }; // Adding date range to the query
    //         }
    //         if(req.query.hbaAvailedFor){
    //             profileQuery.hbaAvailedFor = req.query.hbaAvailedFor;
    //         }
    //         if(req.query.typeOfProperty){
    //             profileQuery.typeOfProperty = req.query.typeOfProperty;
    //         }
    //         console.log('profileQuery ', profileQuery);
    //              // Step 2: Query the leave collection where submittedBy matches any of the admin IDs
    //              data = await hba.find(profileQuery)
    //                  .populate({
    //                      path: 'employeeProfileId',
    //                      model: 'employeeProfile',
    //                      select: ['batch', 'mobileNo1']
    //                  })
    //                  .populate({
    //                     path: 'submittedBy',
    //                     model: 'login', // Ensure the model name matches exactly
    //                     select: ['username', 'loginAs'] // Specify the fields you want to include from EmployeeProfile
    //                 })
    //                 .populate({
    //                     path: 'approvedBy',
    //                     model: 'login', // Ensure the model name matches exactly
    //                     select: ['username', 'loginAs'] // Specify the fields you want to include from EmployeeProfile
    //                 }) 
    //                  .exec();   
    //                  if(data.length > 0){
    //                     console.log('data.length', data.length)
    //                 for(let data0 of data){
    //                     console.log('IDDD => ', data0);
    //                     console.log('IDDD => ', data0.employeeProfileId._id);
    //                     let updateQueryJson = {
    //                         empId: data0.employeeProfileId._id
    //                     }
    //                     uniqueArray = await empProfile.getEmployeeUpdateFilter(updateQueryJson);
    //                     console.log('length ==> ', uniqueArray.length);
    //                     if(uniqueArray.length > 0 && uniqueArray[0].transferOrPostingEmployeesList){
    //                         for(let transferOrPostingEmployeesList of uniqueArray[0].transferOrPostingEmployeesList){
    //                             console.log('Check ', transferOrPostingEmployeesList.fullName, transferOrPostingEmployeesList.empProfileId._id.toString(),
    //                             data0.employeeProfileId._id.toString());
    //                             if(transferOrPostingEmployeesList.empProfileId._id.toString() === data0.employeeProfileId._id.toString()){
    //                                 console.log('Matched ');
    //                                 console.log('posting available')
    //                         dataAll = {
    //                             toPostingInCategoryCode: transferOrPostingEmployeesList.toPostingInCategoryCode,
    //                             toDepartmentId: transferOrPostingEmployeesList.toDepartmentId,
    //                             toDesignationId: transferOrPostingEmployeesList.toDesignationId,
    //                             postTypeCategoryCode: transferOrPostingEmployeesList.postTypeCategoryCode,
    //                             locationChangeCategoryId: transferOrPostingEmployeesList.locationChangeCategoryId,
    //                             // updateType: uniqueArray[0].updateType,
    //                             // orderTypeCategoryCode: uniqueArray[0].orderTypeCategoryCode,
    //                             // orderNumber: uniqueArray[0].orderNumber,
    //                             // orderForCategoryCode: uniqueArray[0].orderForCategoryCode,
    //                             _id: data0._id,
    //                             officerName: data0.officerName,
    //                             employeeProfileId: data0.employeeProfileId,
    //                             designation: data0.designation,
    //                             designationId: data0.designationId,
    //                             department: data0.department,
    //                             departmentId: data0.departmentId,
    //                             stateId: data0.stateId,
    //                             state: data0.state,
    //                             districtId: data0.districtId,
    //                             district: data0.district,
    //                             hbaAvailedFor: data0.hbaAvailedFor,
    //                             typeOfProperty: data0.typeOfProperty,
    //                             dateOfApplication: data0.dateOfApplication,
    //                             totalCostOfProperty: data0.totalCostOfProperty,
    //                             isExisingResidenceAvailable: data0.isExisingResidenceAvailable,
    //                             twoBRelacation: data0.twoBRelacation,
    //                             totalHbaAvailed: data0.totalHbaAvailed,
    //                             totalNumberOfInstallments: data0.totalNumberOfInstallments,
    //                             totalNumberOfRecoveryMonths: data0.totalNumberOfRecoveryMonths,
    //                             installments: data0.installments,
    //                             dateOfOrder: data0.dateOfOrder,
    //                             orderType: data0.orderType,
    //                             orderNo: data0.orderNo,
    //                             orderFor: data0.orderFor,
    //                             remarks: data0.remarks,
    //                             orderFile: data0.orderFile,
    //                             submittedBy: data0.submittedBy,
    //                             approvedBy: data0.approvedBy,
    //                             approvedDate: data0.approvedDate,
    //                             approvalStatus: data0.approvalStatus,
    //                         }
    //                 resultData.push(dataAll);
    //                     }
                        
    //                 }
    //                     }
    //                     else{
    //                         dataAll = {
    //                             _id: data0._id,
    //                             officerName: data0.officerName,
    //                             employeeProfileId: data0.employeeProfileId,
    //                             designation: data0.designation,
    //                             designationId: data0.designationId,
    //                             department: data0.department,
    //                             departmentId: data0.departmentId,
    //                             stateId: data0.stateId,
    //                             state: data0.state,
    //                             districtId: data0.districtId,
    //                             district: data0.district,
    //                             hbaAvailedFor: data0.hbaAvailedFor,
    //                             typeOfProperty: data0.typeOfProperty,
    //                             dateOfApplication: data0.dateOfApplication,
    //                             totalCostOfProperty: data0.totalCostOfProperty,
    //                             isExisingResidenceAvailable: data0.isExisingResidenceAvailable,
    //                             twoBRelacation: data0.twoBRelacation,
    //                             totalHbaAvailed: data0.totalHbaAvailed,
    //                             totalNumberOfInstallments: data0.totalNumberOfInstallments,
    //                             totalNumberOfRecoveryMonths: data0.totalNumberOfRecoveryMonths,
    //                             installments: data0.installments,
    //                             dateOfOrder: data0.dateOfOrder,
    //                             orderType: data0.orderType,
    //                             orderNo: data0.orderNo,
    //                             orderFor: data0.orderFor,
    //                             remarks: data0.remarks,
    //                             orderFile: data0.orderFile,
    //                             submittedBy: data0.submittedBy,
    //                             approvedBy: data0.approvedBy,
    //                             approvedDate: data0.approvedDate,
    //                             approvalStatus: data0.approvalStatus,
    //                         }
    //                 resultData.push(dataAll);
    //                     }
    //                 }
    //                 }
    //                 else
    //                 {
    //                     resultData = [];
    //                 }
    //         successRes(res, resultData, 'Hba listed Successfully');
    //         }
    //         else{
    //             if (req.query.minPrice && req.query.maxPrice) {
    //                 const minPrice = req.query.minPrice;
    //                 const maxPrice = req.query.maxPrice;
    //                 query.totalCostOfProperty = { $gte: minPrice, $lte: maxPrice }; // Adding date range to the query
    //             }
    //             if(req.query.hbaAvailedFor){
    //                 query.hbaAvailedFor = req.query.hbaAvailedFor;
    //             }
    //             if(req.query.typeOfProperty){
    //                 query.typeOfProperty = req.query.typeOfProperty;
    //             }
    //             console.log('query ', query);
    //             data = await hba.find(query)
    //             .populate({
    //                 path: 'employeeProfileId',
    //                 model: 'employeeProfile', // Model of the application collection
    //                 select: ['batch', 'mobileNo1'] // Fields to select from the application collection
    //             })  
    //             .populate({
    //                 path: 'submittedBy',
    //                 model: 'login', // Ensure the model name matches exactly
    //                 select: ['username', 'loginAs'] // Specify the fields you want to include from EmployeeProfile
    //             })
    //             .populate({
    //                 path: 'approvedBy',
    //                 model: 'login', // Ensure the model name matches exactly
    //                 select: ['username', 'loginAs'] // Specify the fields you want to include from EmployeeProfile
    //             }) 
    //             .exec();
    //         successRes(res, data, 'Hba listed Successfully');
    //         }
                
    //     } catch (error) {
    //         console.log('error', error);
    //         errorRes(res, error, "Error on listing Gpf");
    //     }
    // }
    
    

// exports.updateHba = async (req, res) => {
//     try {
//         const query = { ...req.body };
//         const objectIdFields = [
//             'employeeProfileId',
//             'designationId',
//             'departmentId',
//             'state',
//             'stateId',
//             'district',
//             'hbaAvailedFor',
//             'typeOfProperty',
//             'totalNumberOfInstallments',
//             'orderType',
//             'orderFor',
//             'submittedBy',
//             'approvedBy'
//         ];
        
//         // Convert empty strings to null
//         objectIdFields.forEach(field => {
//             if (query[field] === '' || query[field] === 'null') {
//                 query[field] = null;
//             }
//         });

//         // Handle file upload for the order file
//         if (req.files && req.files["orderFile"]) {
//             query.orderFile = req.files["orderFile"][0].path;
//         } else if(req.body.orderFile) {
//             query.orderFile = req.body.orderFile;
//         }

//         // Array to store all processed installments
//         const processedInstallments = [];
        
//         // Handle installments submitted as form fields with array notation
//         if (req.body && typeof req.body === 'object') {
//             const installmentKeys = Object.keys(req.body)
//                 .filter((key) => key.startsWith("installments["));

//             if (installmentKeys.length > 0) {
//                 // Group installment properties by index
//                 const installmentMap = new Map();
                
//                 installmentKeys.forEach((key) => {
//                     const matches = key.match(/installments\[(\d+)\]\[(.+)\]/);
//                     if (matches) {
//                         const [, index, field] = matches;
//                         if (!installmentMap.has(index)) {
//                             installmentMap.set(index, {});
//                         }
                        
//                         // Store the value, but don't process it yet
//                         installmentMap.get(index)[field] = req.body[key];
//                     }
//                 });
                
//                 // Process and clean each installment
//                 installmentMap.forEach((installment) => {
//                     // Process numeric fields
//                     if (installment.amount === 'null' || installment.amount === '') {
//                         installment.amount = null;
//                     } else if (installment.amount !== null && installment.amount !== undefined) {
//                         // Ensure amount is a number if it's not null
//                         installment.amount = Number(installment.amount) || null;
//                     }
                    
//                     // Process date fields
//                     if (installment.installmentDate === 'null' || installment.installmentDate === '') {
//                         installment.installmentDate = null;
//                     }
                    
//                     // Handle file attachment if present
//                     const index = Array.from(installmentMap.keys()).indexOf(Array.from(installmentMap.keys()).find(k => installmentMap.get(k) === installment));
//                     const fileFieldName = `installments[${index}][conductRulePermissionAttachment]`;
                    
//                     if (req.files && req.files[fileFieldName] && req.files[fileFieldName].length > 0) {
//                         installment.conductRulePermissionAttachment = req.files[fileFieldName][0].path;
//                     }
                    
//                     processedInstallments.push(installment);
//                 });
//             }
//         }
        
//         // Handle installments submitted as a direct array
//         if (req.body.installments && Array.isArray(req.body.installments)) {
//             for (let i = 0; i < req.body.installments.length; i++) {
//                 const installment = {...req.body.installments[i]};
                
//                 // Process numeric fields
//                 if (installment.amount === 'null' || installment.amount === '') {
//                     installment.amount = null;
//                 } else if (installment.amount !== null && installment.amount !== undefined) {
//                     // Ensure amount is a number if it's not null
//                     installment.amount = Number(installment.amount) || null;
//                 }
                
//                 // Process date fields
//                 if (installment.installmentDate === 'null' || installment.installmentDate === '') {
//                     installment.installmentDate = null;
//                 }
                
//                 // Handle file attachment if present
//                 const fileFieldName = `installments[${i}][conductRulePermissionAttachment]`;
//                 if (req.files && req.files[fileFieldName] && req.files[fileFieldName].length > 0) {
//                     installment.conductRulePermissionAttachment = req.files[fileFieldName][0].path;
//                 }
                
//                 processedInstallments.push(installment);
//             }
//         }

//         // Create update operations for MongoDB
//         const updateOperations = [];
//         for (const installment of processedInstallments) {
//             if (!installment._id) {
//                 // New installment
//                 updateOperations.push({
//                     updateOne: {
//                         filter: { _id: query.id },
//                         update: { $push: { installments: installment } }
//                     }
//                 });
//             } else if (installment.edited === "yes") {
//                 // Update existing installment
//                 updateOperations.push({
//                     updateOne: {
//                         filter: {
//                             _id: query.id,
//                             "installments._id": installment._id
//                         },
//                         update: {
//                             $set: { "installments.$": installment }
//                         }
//                     }
//                 });
//             }
//         }

//         // Execute installment updates if any
//         if (updateOperations.length > 0) {
//             await hba.bulkWrite(updateOperations);
//         }

//         // Update main document fields
//         const mainDocUpdate = {};
//         Object.keys(query).forEach((key) => {
//             if (key !== "installments" && key !== "id") {
//                 // Convert numeric fields from string 'null' to actual null
//                 if (typeof query[key] === 'string' && query[key] === 'null') {
//                     mainDocUpdate[key] = null;
//                 } else {
//                     mainDocUpdate[key] = query[key];
//                 }
//             }
//         });

//         if (Object.keys(mainDocUpdate).length > 0) {
//             await hba.updateOne({ _id: query.id }, { $set: mainDocUpdate });
//         }

//         return res.json({
//             success: true,
//             message: "HBA updated successfully",
//             updatedData: {
//                 mainUpdate: mainDocUpdate,
//                 installments: processedInstallments
//             }
//         });

//     } catch (error) {
//         console.error("Error updating HBA:", error);
//         return res.status(500).json({
//             success: false,
//             message: "Error updating HBA",
//             error: error.message
//         });
//     }
// };

exports.updateHba = async (req, res) => {
    try {
        const query = { ...req.body };
        
        // Fields that should be ObjectId type according to the schema
        const objectIdFields = [
            'employeeProfileId',
            'designationId',
            'departmentId',
            'stateId',
            'districtId',
            'hbaAvailedFor',
            'typeOfProperty',
            'totalNumberOfInstallments',
            'orderType',
            'orderFor',
            'submittedBy',
            'approvedBy'
        ];
        
        // Convert empty strings, 'null' strings, and non-ObjectId strings to actual null values
        objectIdFields.forEach(field => {
            // Check if the field exists in the query
            if (field in query) {
                // Check if the field is empty, 'null' or doesn't match ObjectId format (24 hex chars)
                if (
                    query[field] === '' || 
                    query[field] === 'null' || 
                    (typeof query[field] === 'string' && 
                     !(/^[0-9a-fA-F]{24}$/.test(query[field])))
                ) {
                    query[field] = null;
                }
            }
        });

        // Handle file upload for the order file
        if (req.files && req.files["orderFile"]) {
            query.orderFile = req.files["orderFile"][0].path;
        } else if (req.body.orderFile) {
            query.orderFile = req.body.orderFile;
        }

        // Process numeric fields
        const numericFields = ['totalCostOfProperty', 'totalHbaAvailed', 'totalNumberOfRecoveryMonths', 'orderNo'];
        numericFields.forEach(field => {
            if (field in query) {
                if (query[field] === '' || query[field] === 'null') {
                    query[field] = null;
                } else if (query[field] !== null && query[field] !== undefined) {
                    // Convert to number or null if not a valid number
                    const num = Number(query[field]);
                    query[field] = isNaN(num) ? null : num;
                }
            }
        });

        // Array to store processed installments
        const processedInstallments = [];
        
        // Handle installments from form fields with array notation
        if (req.body && typeof req.body === 'object') {
            const installmentKeys = Object.keys(req.body)
                .filter((key) => key.startsWith("installments["));

            if (installmentKeys.length > 0) {
                // Group installment properties by index
                const installmentMap = new Map();
                
                installmentKeys.forEach((key) => {
                    const matches = key.match(/installments\[(\d+)\]\[(.+)\]/);
                    if (matches) {
                        const [, index, field] = matches;
                        if (!installmentMap.has(index)) {
                            installmentMap.set(index, {});
                        }
                        
                        // Store the value, but don't process it yet
                        installmentMap.get(index)[field] = req.body[key];
                    }
                });
                
                // Process and clean each installment
                installmentMap.forEach((installment, index) => {
                    // Process numeric fields
                    if (installment.amount === '' || installment.amount === 'null') {
                        installment.amount = null;
                    } else if (installment.amount !== null && installment.amount !== undefined) {
                        // Ensure amount is a number if it's not null
                        const numAmount = Number(installment.amount);
                        installment.amount = isNaN(numAmount) ? null : numAmount;
                    }
                    
                    // Process date fields
                    if (installment.installmentDate === '' || installment.installmentDate === 'null') {
                        installment.installmentDate = null;
                    }
                    
                    // Handle file attachment if present
                    const fileFieldName = `installments[${index}][conductRulePermissionAttachment]`;
                    if (req.files && req.files[fileFieldName] && req.files[fileFieldName].length > 0) {
                        installment.conductRulePermissionAttachment = req.files[fileFieldName][0].path;
                    }
                    
                    processedInstallments.push(installment);
                });
            }
        }
        
        // Handle installments submitted as a direct array
        if (req.body.installments && Array.isArray(req.body.installments)) {
            for (let i = 0; i < req.body.installments.length; i++) {
                const installment = {...req.body.installments[i]};
                
                // Process numeric fields
                if (installment.amount === '' || installment.amount === 'null') {
                    installment.amount = null;
                } else if (installment.amount !== null && installment.amount !== undefined) {
                    // Ensure amount is a number if it's not null
                    const numAmount = Number(installment.amount);
                    installment.amount = isNaN(numAmount) ? null : numAmount;
                }
                
                // Process date fields
                if (installment.installmentDate === '' || installment.installmentDate === 'null') {
                    installment.installmentDate = null;
                }
                
                // Handle file attachment if present
                const fileFieldName = `installments[${i}][conductRulePermissionAttachment]`;
                if (req.files && req.files[fileFieldName] && req.files[fileFieldName].length > 0) {
                    installment.conductRulePermissionAttachment = req.files[fileFieldName][0].path;
                }
                
                processedInstallments.push(installment);
            }
        }

        // Create update operations for MongoDB
        const updateOperations = [];
        for (const installment of processedInstallments) {
            // Create a clean copy to avoid mongoose validation issues
            const cleanInstallment = { ...installment };
            
            if (!cleanInstallment._id) {
                // New installment
                updateOperations.push({
                    updateOne: {
                        filter: { _id: query.id },
                        update: { $push: { installments: cleanInstallment } }
                    }
                });
            } else if (cleanInstallment.edited === "yes") {
                // Update existing installment
                delete cleanInstallment.edited; // Remove the edited flag before saving
                
                updateOperations.push({
                    updateOne: {
                        filter: {
                            _id: query.id,
                            "installments._id": cleanInstallment._id
                        },
                        update: {
                            $set: { "installments.$": cleanInstallment }
                        }
                    }
                });
            }
        }

        // Execute installment updates if any
        if (updateOperations.length > 0) {
            await hba.bulkWrite(updateOperations);
        }

        // Update main document fields (excluding installments and id)
        const mainDocUpdate = {};
        Object.keys(query).forEach((key) => {
            if (key !== "installments" && key !== "id") {
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



/**
 * Get HBA (House Building Advance) data with various filtering options
 * Enhanced with proper error handling, code reuse, and cleaner structure
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
exports.getHba = async (req, res) => {
    console.log('Hello from Hba controller', req.query);
    try {
        // Common populate configuration for reuse across queries
        const populateConfig = [
            {
                path: 'employeeProfileId',
                model: 'employeeProfile',
                select: ['batch', 'mobileNo1', 'fullName']
            },
            {
                path: 'submittedBy',
                model: 'login',
                select: ['username', 'loginAs']
            },
            {
                path: 'approvedBy',
                model: 'login',
                select: ['username', 'loginAs']
            }
        ];

        // Handle specific query cases
        if (req.query._id) {
            await handleQueryById(req, res, populateConfig);
        } else if (req.query.employeeProfileId) {
            await handleQueryByEmployeeId(req, res, populateConfig);
        } else if (['Spl A - SO', 'Spl B - SO', 'Spl A - ASO', 'Spl B - ASO'].includes(req.query.loginAs)) {
            await handleQueryByAdmin(req, res, populateConfig);
        } else {
            await handleGenericQuery(req, res, populateConfig);
        }
    } catch (error) {
        console.error('Error in getHba:', error);
        errorRes(res, error, "Error on listing HBA data");
    }
};

/**
 * Process query by specific document ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Array} populateConfig - Mongoose populate configuration
 */
async function handleQueryById(req, res, populateConfig) {
    try {
        const data = await hba.find(req.query)
            .populate(populateConfig)
            .exec();

        if (!data || data.length === 0) {
            return successRes(res, [], 'No HBA records found');
        }

        const resultData = await processHbaData(data);
        successRes(res, resultData, 'HBA listed successfully');
    } catch (error) {
        console.error('Error in handleQueryById:', error);
        errorRes(res, error, "Error processing HBA data by ID");
    }
}

/**
 * Process query by employee profile ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Array} populateConfig - Mongoose populate configuration
 */
async function handleQueryByEmployeeId(req, res, populateConfig) {
    try {
        const query = buildFilterQuery(req.query);
        console.log('Query by employee profile ID:', query);

        const data = await hba.find(query)
            .populate(populateConfig)
            .exec();

        console.log(`Found ${data?.length || 0} HBA records for employee`);
        successRes(res, data || [], 'HBA listed successfully');
    } catch (error) {
        console.error('Error in handleQueryByEmployeeId:', error);
        errorRes(res, error, "Error processing HBA data by employee ID");
    }
}

/**
 * Process query by admin role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Array} populateConfig - Mongoose populate configuration
 */
async function handleQueryByAdmin(req, res, populateConfig) {
    try {
        // Get admin IDs based on login role
        const adminIds = await getAdminIdsByRole(req.query.loginAs);
        
        if (!adminIds || adminIds.length === 0) {
            return res.status(404).json({ message: 'No admin users found for the specified role' });
        }

        // Build query with admin filter
        const profileQuery = {
            $or: [
                { submittedBy: { $in: adminIds } },
                { approvalStatus: true }
            ]
        };
        
        // Add additional filters
        applyAdditionalFilters(profileQuery, req.query);
        console.log('Admin filtered query:', profileQuery);

        const data = await hba.find(profileQuery)
            .populate(populateConfig)
            .exec();
            
        if (!data || data.length === 0) {
            return successRes(res, [], 'No HBA records found for the specified criteria');
        }

        const resultData = await processHbaData(data);
        successRes(res, resultData, 'HBA listed successfully');
    } catch (error) {
        console.error('Error in handleQueryByAdmin:', error);
        errorRes(res, error, "Error processing HBA data for admin view");
    }
}

/**
 * Process generic query with no specific filters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Array} populateConfig - Mongoose populate configuration
 */
async function handleGenericQuery(req, res, populateConfig) {
    try {
        const query = buildFilterQuery(req.query);
        console.log('Generic query:', query);

        const data = await hba.find(query)
            .populate(populateConfig)
            .exec();

        successRes(res, data || [], 'HBA listed successfully');
    } catch (error) {
        console.error('Error in handleGenericQuery:', error);
        errorRes(res, error, "Error processing HBA data for generic query");
    }
}

/**
 * Process employee data to add transfer/posting information
 * @param {Array} data - HBA data records
 * @returns {Array} - Processed data with additional information
 */
async function processHbaData(data) {
    if (!data || data.length === 0) {
        return [];
    }

    const resultData = [];
    
    for (let item of data) {
        try {
            let dataAll = extractBasicHbaData(item);
            
            // Check for employee profile and attempt to get transfer/posting data
            if (item.employeeProfileId && item.employeeProfileId._id) {
                const transferData = await getEmployeeTransferData(item.employeeProfileId._id);
                
                if (transferData && transferData.length > 0) {
                    // Look for a matching employee in transfer data
                    const matchingTransfer = findMatchingTransfer(transferData, item.employeeProfileId._id);
                    
                    if (matchingTransfer) {
                        // Merge transfer data with HBA data
                        Object.assign(dataAll, {
                            toPostingInCategoryCode: matchingTransfer.toPostingInCategoryCode,
                            toDepartmentId: matchingTransfer.toDepartmentId,
                            toDesignationId: matchingTransfer.toDesignationId,
                            postTypeCategoryCode: matchingTransfer.postTypeCategoryCode,
                            locationChangeCategoryId: matchingTransfer.locationChangeCategoryId
                        });
                    }
                }
            }
            
            resultData.push(dataAll);
        } catch (error) {
            console.error('Error processing individual HBA record:', error);
            // Continue processing other records even if one fails
        }
    }

    return resultData;
}

/**
 * Extract basic HBA data from a record
 * @param {Object} item - HBA record
 * @returns {Object} - Basic HBA data object
 */
function extractBasicHbaData(item) {
    if (!item) return {};
    
    return {
        _id: item._id,
        officerName: item.officerName,
        employeeProfileId: item.employeeProfileId,
        designation: item.designation,
        designationId: item.designationId,
        department: item.department,
        departmentId: item.departmentId,
        stateId: item.stateId,
        state: item.state,
        districtId: item.districtId,
        district: item.district,
        hbaAvailedFor: item.hbaAvailedFor,
        typeOfProperty: item.typeOfProperty,
        dateOfApplication: item.dateOfApplication,
        totalCostOfProperty: item.totalCostOfProperty,
        isExisingResidenceAvailable: item.isExisingResidenceAvailable,
        twoBRelacation: item.twoBRelacation,
        totalHbaAvailed: item.totalHbaAvailed,
        totalNumberOfInstallments: item.totalNumberOfInstallments,
        totalNumberOfRecoveryMonths: item.totalNumberOfRecoveryMonths,
        installments: item.installments,
        dateOfOrder: item.dateOfOrder,
        orderType: item.orderType,
        orderNo: item.orderNo,
        orderFor: item.orderFor,
        remarks: item.remarks,
        orderFile: item.orderFile,
        submittedBy: item.submittedBy,
        approvedBy: item.approvedBy,
        approvedDate: item.approvedDate,
        approvalStatus: item.approvalStatus
    };
}

/**
 * Get employee transfer data safely
 * @param {String|ObjectId} employeeId - Employee profile ID
 * @returns {Array} - Transfer data or empty array if none found
 */
async function getEmployeeTransferData(employeeId) {
    if (!employeeId) {
        return [];
    }
    
    try {
        const updateQueryJson = { empId: employeeId };
        const uniqueArray = await empProfile.getEmployeeUpdateFilter(updateQueryJson);
        
        if (uniqueArray && uniqueArray.length > 0 && uniqueArray[0].transferOrPostingEmployeesList) {
            return uniqueArray;
        }
    } catch (error) {
        console.error('Error getting employee transfer data:', error);
    }
    
    return [];
}

/**
 * Find matching transfer record for an employee
 * @param {Array} transferData - Transfer data array
 * @param {String|ObjectId} employeeId - Employee profile ID
 * @returns {Object|null} - Matching transfer record or null
 */
function findMatchingTransfer(transferData, employeeId) {
    if (!transferData || !transferData[0] || !transferData[0].transferOrPostingEmployeesList || !employeeId) {
        return null;
    }
    
    const employeeIdStr = employeeId.toString();
    
    for (const transfer of transferData[0].transferOrPostingEmployeesList) {
        if (transfer.empProfileId && 
            transfer.empProfileId._id && 
            transfer.empProfileId._id.toString() === employeeIdStr) {
            return transfer;
        }
    }
    
    return null;
}

/**
 * Get admin IDs by role
 * @param {String} role - Admin role
 * @returns {Array} - Array of admin ObjectIds
 */
async function getAdminIdsByRole(role) {
    let query = {};
    
    switch(role) {
        case 'Spl A - SO':
            query = { loginAs: { $in: ['Spl A - ASO', 'Spl A - SO'] } };
            break;
        case 'Spl A - ASO':
            query = { loginAs: { $in: ['Spl A - ASO'] } };
            break;
        case 'Spl B - SO':
            query = { loginAs: { $in: ['Spl B - ASO', 'Spl B - SO'] } };
            break;
        case 'Spl B - ASO':
            query = { loginAs: { $in: ['Spl B - ASO'] } };
            break;
        default:
            return [];
    }
    
    try {
        const admins = await login.find(query).select('_id').exec();
        return admins.map(admin => admin._id);
    } catch (error) {
        console.error('Error fetching admin IDs:', error);
        return [];
    }
}

/**
 * Build filter query from request parameters
 * @param {Object} params - Request query parameters
 * @returns {Object} - Mongoose query object
 */
function buildFilterQuery(params) {
    const query = {};
    
    // Set employeeProfileId if provided
    if (params.employeeProfileId) {
        query.employeeProfileId = params.employeeProfileId;
    }
    
    // Add price range filter if both min and max are provided
    if (params.minPrice && params.maxPrice) {
        query.totalCostOfProperty = { 
            $gte: parseFloat(params.minPrice), 
            $lte: parseFloat(params.maxPrice) 
        };
    }
    
    // Add HBA purpose filter
    if (params.hbaAvailedFor) {
        query.hbaAvailedFor = params.hbaAvailedFor;
    }
    
    // Add property type filter
    if (params.typeOfProperty) {
        query.typeOfProperty = params.typeOfProperty;
    }
    
    return query;
}

/**
 * Apply additional filters to an existing query object
 * @param {Object} query - Existing query object to modify
 * @param {Object} params - Request query parameters
 */
function applyAdditionalFilters(query, params) {
    // Add price range filter if both min and max are provided
    if (params.minPrice && params.maxPrice) {
        query.totalCostOfProperty = { 
            $gte: parseFloat(params.minPrice), 
            $lte: parseFloat(params.maxPrice) 
        };
    }
    
    // Add HBA purpose filter
    if (params.hbaAvailedFor) {
        query.hbaAvailedFor = params.hbaAvailedFor;
    }
    
    // Add property type filter
    if (params.typeOfProperty) {
        query.typeOfProperty = params.typeOfProperty;
    }
}