const employeeProfile = require('../../models/employee/employeeProfile.model');
const employeeUpdate = require('../../models/employee/employeeUpdate.model');
const categories = require('../../models/categories/categories.model');
const designations = require('../../models/categories/designation.model');
//const { Op } = require('sequelize');

const { successRes, errorRes } = require("../../middlewares/response.middleware");
const { ObjectId, ObjectID } = require('mongodb');

// employeeProfile creation
exports.addEmployeeProfile = async (req, res) => {
    try {
        console.log('DEMO');
        console.log('try create employeeProfile', req.body);
        const query = req.body;
        query.photo = Buffer.from(query.photo.split(",")[1], 'base64')
        const data = await employeeProfile.create(query);
        let data1 = data;
        console.log(data1);
        console.log(data1.fullName);
        console.log(data1.photo);
        console.log(data1.photo.toString('base64'));
        let pho = data1.photo.toString('base64');
        let data3 = {
            fullName: data1.fullName,
  gender: data1.gender,
  dateOfBirth: data1.dateOfBirth,
  dateOfJoining: data1.dateOfJoining,
  dateOfRetirement: data1.dateOfRetirement,
  state: data1.state,
  batch: data1.batch,
  recruitmentType: data1.recruitmentType,
  serviceStatus: data1.serviceStatus,
  qualification1: data1.qualification1,
  qualification2: data1.qualification2,
  community: data1.community,
  degreeData: data1.degreeData,
  caste: data1.caste,
  religion: data1.religion,
  promotionGrade: data1.promotionGrade,
  payscale: data1.payscale,
  officeEmail: data1.officeEmail,
  mobileNo1: data1.mobileNo1,
  mobileNo2: data1.mobileNo2,
  mobileNo3: data1.mobileNo3,
  addressLine: data1.addressLine,
  city: data1.city,
  pincode: data1.pincode,
  employeeId: data1.employeeId,
  ifhrmsId: data1.ifhrmsId,
            photo: pho
        }
        successRes(res, data3, 'Employee added Successfully');
    } catch (error) {
        console.log('catch create employeeProfile', error);
        errorRes(res, error, "Error on employeeProfile creation");
    }
    }

// Get employeeProfile
exports.getEmployeeProfile = async (req, res) => {
        console.log('helo from employeeProfile controller', req.query);
        try {
            
        let query = {};
        let data;
        if(req.query){
            query.where = req.query;
            data = await employeeProfile.find(req.query).sort({ batch: 'asc' }).exec();
            console.log('if', data);
        }
        else{
            data = await employeeProfile.find().sort({ batch: 'asc' }).exec();
            console.log('else', data);
        }
        successRes(res, data, 'Employee listed Successfully');
        } catch (error) {
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
            if(req.query.name && !req.query.start && !req.query.end){
                let name = req.query.name;
                
                let getQueryJson = {
                    fullName: name
                } 
                console.log(getQueryJson);
                data = await employeeProfile.find(getQueryJson).exec();
                console.log('Data ==> ', data);
                dataUpdate = await employeeUpdate.find({empProfileId: data[0]._id}).sort({ dateOfOrder: 'desc' }).exec();
                console.log('DataUpdate ==> ', dataUpdate);
                let department;
                let designation;
                if(dataUpdate.length == 0){
                    console.log('no');
                    throw 'No posting available for employee';
                }
                if(dataUpdate[0].fromDepartmentId){
                    let today = new Date()
                    console.log(dataUpdate[0].dateOfOrder);
                    console.log(today);
                    if(dataUpdate[0].dateOfOrder > today){
                        console.log('date of order greater');
                        department = dataUpdate[0].fromDepartmentId;
                        designation = dataUpdate[0].fromDesignationId;
                    }
                    else {
                        console.log('today greater');
                        department = dataUpdate[0].toDepartmentId;
                        designation = dataUpdate[0].toDesignationId;
                    }
                }
                else
                {
                    console.log('only to dept avail');
                    department = dataUpdate[0].toDepartmentId;
                    designation = dataUpdate[0].toDesignationId;
                }
                let result = {
                    fullName: data[0].fullName,
                    gender: data[0].gender,
                    batch: data[0].batch,
                    department: department,
                    designation: designation
                }
                console.log('DATA RES from Name search ', result);
                successRes(res, result, 'Employee listed Successfully');
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
                for(let res of data){
                    dataUpdate = await employeeUpdate.find({empProfileId: res._id}).sort({ dateOfOrder: 'desc' }).exec();
                    if(dataUpdate.length == 0){
                        console.log('no');
                    }
                    else{
                        dataUpdate = dataUpdate[0];
                        console.log('dataUpdate ====> ', dataUpdate);
                        if (typeof dataUpdate["fromDepartmentId"] !== "undefined" ) {
                            console.log('from exists');
                            let today = new Date()
                        console.log(dataUpdate.dateOfOrder);
                        console.log(today);
                        if(dataUpdate.dateOfOrder > today){
                            console.log('date of order greater');
                            department = dataUpdate.fromDepartmentId;
                            designation = dataUpdate.fromDesignationId;
                        }
                        else {
                            console.log('today greater');
                            department = dataUpdate.toDepartmentId;
                            designation = dataUpdate.toDesignationId;
                        }
                        } else {
                            console.log('from does not exist');
                            console.log('only to dept avail');
                        department = dataUpdate.toDepartmentId;
                        designation = dataUpdate.toDesignationId;
                        }
                    }
                    if(dataUpdate.length !== 0){

                        let jsonval = {
                            fullName: res.fullName,
                            gender: res.gender,
                            batch: res.batch,
                            department: department,
                            designation: designation
                            }
                            matched.push(jsonval);
                    }

                }
                console.log()
                console.log('DATA RES from date search ', data);
                successRes(res, matched, 'Employee listed Successfully');
            }
            if(req.query.posting_in){
                let dataJsonFrom = {};
                let dataJsonTo = {};
                let resData = [];
                if(req.query.department && !req.query.designation){
                    dataJsonFrom.fromPostingInCategoryCode = req.query.posting_in;
                    dataJsonTo.toPostingInCategoryCode = req.query.posting_in;
                    dataJsonFrom.fromDepartmentId = req.query.department;
                    dataJsonTo.toDepartmentId = req.query.department;
                }
                else if(req.query.department && req.query.designation){
                    dataJsonFrom.fromPostingInCategoryCode = req.query.posting_in;
                    dataJsonTo.toPostingInCategoryCode = req.query.posting_in;
                    dataJsonFrom.fromDepartmentId = req.query.department;
                    dataJsonTo.toDepartmentId = req.query.department;
                    dataJsonFrom.fromDesignationId = req.query.designation;
                    dataJsonTo.toDesignationId = req.query.designation;
                }
                else if(!req.query.department && !req.query.designation){
                    dataJsonFrom.fromPostingInCategoryCode = req.query.posting_in;
                    dataJsonTo.toPostingInCategoryCode = req.query.posting_in;
                }
                dataUpdate = await employeeUpdate.find({$or:[dataJsonFrom,dataJsonTo]}).exec();
                    if(dataUpdate.length == 0){
                        console.log('no');
                    }
                    else{
                        console.log('dataUpdate ', dataUpdate);
                        const array = [1, 2, 3, 2, 4, 5, 4, 5];
                        const uniqueElements = new Set();

                        dataUpdate.forEach(item => {
                            if (!uniqueElements.has(item.fullName)) {
                                uniqueElements.add(item.fullName);
                            }
                        });
                        const arrayUnique = Array.from(uniqueElements);
                        //console.log('UNIQUE ARR => ', arrayUnique);
                        let matchedData = [];
                        for (var i = 0; i < arrayUnique.length; i++) {
                            console.log('inside I => ',i);
                            for (var j = 0; j < dataUpdate.length; j++) {
                                console.log('inside J => ',i, j);
                                if (arrayUnique[i] == dataUpdate[j].fullName) {
                                    console.log('array matched ', arrayUnique[i], dataUpdate[j].fullName);
                                    matchedData.push(dataUpdate[j])
                                  }
                                else{
                                    console.log('error');
                                }
                            }
                            //console.log('dummy ===>>> ', dummy);
                            matchedData.sort((a, b) => a.dateOfOrder - b.dateOfOrder);
                            //console.log('dummy sorted ===>>> ', dummy);
                            matchedData = matchedData.reverse();
                            //console.log('dummy reversed ===>>> ', dummy);
                            if(matchedData.length == 0){
                                console.log('no');
                            }
                            else{
                                matchedData = matchedData[0];
                                console.log('dataUpdate ====> ', matchedData);
                                if (typeof matchedData["fromDepartmentId"] !== "undefined" ) {
                                    console.log('from exists');
                                    let today = new Date()
                                console.log(matchedData.dateOfOrder);
                                console.log(today);
                                if(matchedData.dateOfOrder > today){
                                    console.log('date of order greater');
                                    department = matchedData.fromDepartmentId;
                                    designation = matchedData.fromDesignationId;
                                }
                                else {
                                    console.log('today greater');
                                    department = matchedData.toDepartmentId;
                                    designation = matchedData.toDesignationId;
                                }
                                } else {
                                    console.log('from does not exist');
                                    console.log('only to dept avail');
                                department = matchedData.toDepartmentId;
                                designation = matchedData.toDesignationId;
                                }
                            }
                            if(matchedData.length !== 0){
        
                                let jsonval = {
                                    /*fullName: res.fullName,
                                    gender: res.gender,
                                    batch: res.batch,*/
                                    department: department,
                                    designation: designation,
                                    empProfileId: matchedData.empProfileId,
                                    fullName: matchedData.fullName
                                    }
                                    resData.push(jsonval);
                            }
                            /*resData.push({
                                fullName: matchedData[0].fullName,
                                empProfileId: matchedData[0].empProfileId,
                            });*/
                            matchedData = [];
                        }
                        //console.log('resData ==> ', resData);
                        for(let i=0; i< resData.length; i++){
                            console.log('resData name==> ', resData[i]);
                            let getQueryJson = {
                                _id: resData[i].empProfileId
                            } 
                            console.log(getQueryJson);
                            postData = await employeeProfile.find(getQueryJson, {
                                new: true
                            }).select({"gender": 1, "batch": 1}).exec();
                            console.log('post data ', postData);
                            console.log('res data ', resData[i]);
                            resData[i].gender = postData[0].gender;
                            resData[i].batch = postData[0].batch;
                            console.log('resdata[i] = > ', resData[i]);
                        }

                console.log('DATA RES from date search ', resData);
                successRes(res, resData, 'Employee listed Successfully');
            }
    }}
    catch (error) {
        console.log('error => ', error);
        console.log('error', error.reason);
        errorRes(res, error, "Error on listing employee");
    }
}

// employeeProfile updation
exports.updateEmployeeProfile = async (req, res) => {
    try {
        console.log('try update employeeProfile');
        const query = req.body;
        let update = {};
        if(query.fullName){
            update.fullName = query.fullName;
        }
        if(query.degreeData){
            update.degreeData = query.degreeData;
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
        'transferOrPostingEmployeesList.empProfileId': empId
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
            gender : genderId
        };
        data = await employeeProfile.find(query).sort({ dateOfJoining: 'asc' }).exec();
        for(let employee of data){
            uniqueArray = await this.getEmployeeUpdateChange(employee._id);
            console.log('length ==> ', uniqueArray.length);
            if(uniqueArray.length == 1){
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
                    //photo: employee.photo
                }
                console.log('dataAll => ', dataAll);
                resultData.push(dataAll);
            }else{
                resultData.push(employee);
                console.log('employee => ', employee);
            }
            
            
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
                gender : genderId
            };
            data = await employeeProfile.find(query).sort({ dateOfJoining: 'asc' }).exec();
            for(let employee of data){
                uniqueArray = await this.getEmployeeUpdateChange(employee._id);
                console.log('length ==> ', uniqueArray.length);
                if(uniqueArray.length == 1){
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
                        //photo: employee.photo
                    }
                    console.log('dataAll => ', dataAll);
                    resultData.push(dataAll);
                }else{
                    resultData.push(employee);
                    console.log('employee => ', employee);
                }
                
                
            }
            console.log('Unique by latest date of order:', uniqueArray);
            let resData = {
                empCount : resultData.length,
                empList: resultData
            }
            /*let resData = {
                empCount : data.length,
                empList: data
            }*/
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
         for(let employee of data){
                uniqueArray = await this.getEmployeeUpdateChange(employee._id);
                console.log('length ==> ', uniqueArray.length);
                if(uniqueArray.length == 1){
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
                        //photo: employee.photo
                    }
                    console.log('dataAll => ', dataAll);
                    resultData.push(dataAll);
                }else{
                    resultData.push(employee);
                    console.log('employee => ', employee);
                }
                
                
            }
            console.log('Unique by latest date of order:', uniqueArray);
            let resData = {
                empCount : resultData.length,
                empList: resultData
            }
        successRes(res, resData, 'Active Employees listed Successfully');
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
        for(let employee of data){
            uniqueArray = await this.getEmployeeUpdateChange(employee._id);
            console.log('length ==> ', uniqueArray.length);
            if(uniqueArray.length == 1){
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
                    //photo: employee.photo
                }
                console.log('dataAll => ', dataAll);
                resultData.push(dataAll);
            }else{
                resultData.push(employee);
                console.log('employee => ', employee);
            }
            
            
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
                city: { $regex: 'chennai', $options: 'i' }
            };
        }
        else if(req.query.chennai == 'no'){
            query = {
                city: { $not: { $regex: 'chennai', $options: 'i' } }
            };
        }

        data = await employeeProfile.find(query).sort({ dateOfJoining: 'asc' }).exec();
        for(let employee of data){
            uniqueArray = await this.getEmployeeUpdateChange(employee._id);
            console.log('length ==> ', uniqueArray.length);
            if(uniqueArray.length == 1){
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
                    //photo: employee.photo
                }
                console.log('dataAll => ', dataAll);
                resultData.push(dataAll);
            }else{
                resultData.push(employee);
                console.log('employee => ', employee);
            }
            
            
        }
        console.log('Unique by latest date of order:', uniqueArray);
        let resData = {
            empCount : resultData.length,
            empList: resultData
        }
        successRes(res, resData, 'List employees based on location Success');
    } catch (error) {
        console.log('error', error);
        errorRes(res, error, "Error on listing employees based on location");
    }
}

// Get Employees from Secretariat / not from getBySecretariat
exports.getBySecretariat = async (req, res) => {
    try{
        let query = {};
        let secretariatDetails;
        let categoryDetails;
        let resData = [];
        let categoryId;
        let resDataFinal;
        let resJson;
        categoryDetails = await categories.find({
            "category_name": "Secretariat"
        })
        console.log('categoryDetails', categoryDetails[0]._id);
        categoryId = categoryDetails[0]._id.toString();
        // secretariatDetails =  await employeeUpdate.find({})
        //   const uniqueNamesByLatestDateOfOrder = secretariatDetails
        //     .sort((a, b) => new Date(b.dateOfOrder) - new Date(a.dateOfOrder)) // Sort by latest date first
        //     .reduce((acc, curr) => {
        //       if (!acc[curr.empProfileId]) { // Check if name already exists in accumulator
        //         console.log('acc profile id => ', acc[curr.empProfileId]);
        //         acc[curr.empProfileId] = curr; // If not, add the current item
        //       }
        //       return acc;
        //     }, {});
          
        //   const uniqueArray = Object.values(uniqueNamesByLatestDateOfOrder);
        //   console.log('Unique by latest date of order:', uniqueArray.transferOrPostingEmployeesList);

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
          
          if(req.query.secretariat == 'yes'){
            let lastIndex = -1;
            for(let data of uniqueArray){
                console.log('fullname => ', data.transferOrPostingEmployeesList[0].fullName, data._id);
                console.log('toPostingInCategoryCode => ', data.transferOrPostingEmployeesList[0].toPostingInCategoryCode);
                console.log('categoryId => ', categoryId);
                if(data.transferOrPostingEmployeesList[0].toPostingInCategoryCode == categoryId)
                {
                    console.log('true');
                    let getQueryJson = {
                        _id: data.transferOrPostingEmployeesList[0].empProfileId
                    } 
                    console.log(getQueryJson);
                    const profileData = await employeeProfile.find(getQueryJson).exec();
                    // console.log('profileData ', profileData);
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
                            city: profileData[0].city
                        }
                        
                    // console.log('resJson ', resJson);
                    resData.push(resJson);
                    // console.log('resData ', resData);
                    }
                    lastIndex++;
                }
                if (lastIndex === uniqueArray.length - 1) {
                    console.log('Reached the end of the array');
                    //console.log(resData);
                  }   
            }
          }
          else{
            let lastIndex = -1;
            for(let data of uniqueArray){
                console.log('toPostingInCategoryCode => ', data.transferOrPostingEmployeesList[0].toPostingInCategoryCode);
                console.log('categoryId => ', categoryId);
                if(data.transferOrPostingEmployeesList[0].toPostingInCategoryCode != categoryId)
                {
                    console.log('true');
                    let getQueryJson = {
                        _id: data.transferOrPostingEmployeesList[0].empProfileId
                    } 
                    // console.log(getQueryJson);
                    const profileData = await employeeProfile.find(getQueryJson).exec();
                    // console.log('profileData ', profileData._doc);
                    if(profileData.length > 0){
                        resJson = {
                            employeeId : data.transferOrPostingEmployeesList[0].employeeId,
                            //fullName: data.fullName,
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
                        // console.log('resJson ', resJson);
                        resData.push(resJson);
                        // console.log('resData ', resData);
                    }
                    
                    lastIndex++;
                }
                if (lastIndex === uniqueArray.length - 1) {
                    console.log('Reached the end of the array');
                    //console.log(resData);
                  }   
            }
          }
          for(let i=0; i< resData.length; i++){
            // console.log('resData name==> ', resData[i]);
        }
        let result = {
            empCount: resData.length,
            empList: resData
        }
          successRes(res, result, 'Secretariat Employees listed Successfully');
    }
    catch(error){
        console.log('error', error);
        errorRes(res, error, "Error on listing employees based on Secretariat");
    }
}


// Get Employees by Designation
exports.getByDesignation = async (req, res) => {
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
                    'transferOrPostingEmployeesList.empProfileId': employee._id
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
                            //photo: employee.photo
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

exports.getEmployeeUpdateFilter = async(input) => {
    console.log('inside getEmployeeUpdate function', input)
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
        'transferOrPostingEmployeesList.empProfileId': input.empId
    })
    .populate({
        path: 'transferOrPostingEmployeesList.empProfileId',
        model: 'employeeProfile', // Ensure the model name matches exactly
        select: 'orderNumber' // Specify the fields you want to include from EmployeeProfile
    })
    .sort({ dateOfOrder: -1 }) // Sort by dateOfOrder in descending order (-1)
    .exec();
    console.log('dataResArray ==> ', dataResArray);
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
                    'transferOrPostingEmployeesList.empProfileId': employee._id
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
                console.log('getEmployeeAdvancedSearch RESSSSSSS ', result)
                successRes(res, result, 'Employee listed -> 3 params Successfully');
            }
            // else if(count == 3){
            //     result = await this.threeParameterAdvanced(req.body);
            //     console.log('getEmployeeAdvancedSearch', result)
            //     successRes(res, result, 'Employee listed -> 3 params Successfully');
            // }
            // else if(count == 4){
            //     result = await this.fourParameterAdvanced(req.body);
            //     console.log('getEmployeeAdvancedSearch', result)
            //     successRes(res, result, 'Employee listed -> 4 params Successfully');
            // }
            // else if(count == 5){
            //     result = await this.fiveParameterAdvanced(req.body);
            //     console.log('getEmployeeAdvancedSearch', result)
            //     successRes(res, result, 'Employee listed -> 5 params Successfully');
            // }
            // else if(count == 6){
            //     result = await this.sixParameterAdvanced(req.body);
            //     console.log('getEmployeeAdvancedSearch', result)
            //     successRes(res, result, 'Employee listed -> 6 param Successfully');
            // }
            // else if(count == 7){
            //     result = await this.sevenParameterAdvanced(req.body);
            //     console.log('getEmployeeAdvancedSearch', result)
            //     successRes(res, result, 'Employee listed -> 7 params Successfully');
            // }
            // else if(count == 8){
            //     result = await this.eightParameterAdvanced(req.body);
            //     console.log('getEmployeeAdvancedSearch', result)
            //     successRes(res, result, 'Employee listed -> 8 params Successfully');
            // }
            // else if(count == 9){
            //     result = await this.nineParameterAdvanced(req.body);
            //     console.log('getEmployeeAdvancedSearch', result)
            //     successRes(res, result, 'Employee listed -> 9 params Successfully');
            // }
            // else if(count == 10){
            //     result = await this.tenParameterAdvanced(req.body);
            //     console.log('getEmployeeAdvancedSearch', result)
            //     successRes(res, result, 'Employee listed -> 10 params Successfully');
            // }
            // else if(count == 11){
            //     result = await this.elevenParameterAdvanced(req.body);
            //     console.log('getEmployeeAdvancedSearch', result)
            //     successRes(res, result, 'Employee listed -> 11 params Successfully');
            // }
        } 
        catch (error) {
        console.log('error', error);
        errorRes(res, error, "Error on listing employee profile with history");
        }
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
    let oneResult = [];
    return oneResult;
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


    let twoResult = [];
    return twoResult;
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
            || by == 'dobPos' || by == 'dobDep' || by == 'dobDes'){
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
            || by == "staPos" || by == "staDep" || by == "staDes"
        ){
                console.log("if true - by ", by);
                getQueryJson = {
                    state: input.state
                }
        }
        else if(by == "community"
            || by == "comPos" || by == "comDep" || by == "comDes"
        ){
                console.log("if true - by ", by);
                getQueryJson = {
                    community: input.community
                }
        }
        else if(by == "degree"
            || by == "degPos" || by == "degDep" || by == "degDes"
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
            || by == "dojPos" || by == "dojDep" || by == "dojDes"){
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
            || by == "dorPos" || by == "dorDep" || by == "dorDes"
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
            || by == "recPos" || by == "recDep" || by == "recDes"
        ){
                console.log("if true - by ", by);
                getQueryJson = {
                    recruitmentType: input.recruitmentType
                }
        }

        else if(by == 'dobSta'){
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
        else if(by == 'dobCom'){
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
        else if(by == 'dobDeg'){
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
                }
            } 
        }
        else if(by == 'dobDoj'){
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
        else if(by == 'dobDor'){
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
        else if(by == 'dobRec'){
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
        else if(by == "staCom"){
                console.log("if true - by ", by);
                getQueryJson = {
                    state: input.state,
                    community: input.community
                }
        }
        else if(by == "staDeg"){
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
        else if(by == "staDoj"){
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
        else if(by == "staDor"){
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
        else if(by == "staRec"){
            console.log("if true - by ", by);
            getQueryJson = {
                state: input.state,
                recruitmentType: input.recruitmentType
            }
        }
        else if(by == "comDeg"){
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
        else if(by == "comDoj"){
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
        else if(by == "comDor"){
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
        else if(by == "comRec"){
            console.log("if true - by ", by);
            getQueryJson = {
                community: input.community,
                recruitmentType: input.recruitmentType
            }
        }
        else if(by == "degDoj"){
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
        else if(by == "degDor"){
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
        else if(by == "degRec"){
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
        else if(by == "dojDor"){
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
        else if(by == "dojRec"){
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
        else if (by === 'dobStaCom') {
            getQueryJson = {
                dateOfBirth: {
                    $gte: startDate,
                    $lt: endDate
                },
                state: input.state,
                community: input.community
            };
        } else if (by === 'staComDeg') {
            getQueryJson = {
                state: input.state,
                community: input.community,
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                }
            };
        } else if (by === 'staComDoj') {
            getQueryJson = {
                state: input.state,
                community: input.community,
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                }
            };
        } else if (by === 'staComDor') {
            getQueryJson = {
                state: input.state,
                community: input.community,
                dateOfRetirement: {
                    $gte: startDateR,
                    $lt: endDateR
                }
            };
        } else if (by === 'staComRec') {
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
        } else if (by === 'staDegDoj') {
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
        } else if (by === 'staDegDor') {
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
        } else if (by === 'staDegRec') {
            getQueryJson = {
                state: input.state,
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                recruitmentType: input.recruitmentType
            };
        } else if (by === 'staDegPos') {
            getQueryJson = {
                state: input.state,
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
            };
        } else if (by === 'staDegDep') {
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
        } else if (by === 'staDojDor') {
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
        } else if (by === 'staDojRec') {
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
        } else if (by === 'staDorRec') {
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
        } else if (by === 'comDegDoj') {
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
        } else if (by === 'comDegDor') {
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
        } else if (by === 'comDegRec') {
            getQueryJson = {
                community: input.community,
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
                recruitmentType: input.recruitmentType
            };
        } else if (by === 'comDegPos') {
            getQueryJson = {
                community: input.community,
                degreeData: {
                    $elemMatch: {
                        degree: input.degree
                    }
                },
            };
        } else if (by === 'comDegDep') {
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
        } else if (by === 'comDojDor') {
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
        } else if (by === 'comDojRec') {
            getQueryJson = {
                community: input.community,
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
                recruitmentType: input.recruitmentType
            };
        } else if (by === 'comDojPos') {
            getQueryJson = {
                community: input.community,
                dateOfJoining: {
                    $gte: startDateJ,
                    $lt: endDateJ
                },
            };
        } else if (by === 'comDojDep') {
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
        } else if (by === 'comDorRec') {
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
        } else if (by === 'degDojDor') {
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
        } else if (by === 'degDojRec') {
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
        } else if (by === 'degDorRec') {
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
        } else if (by === 'dojDorRec') {
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
        by == "recDepDes"
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
                by == "recDepDes"){
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
                        // photo: employee.photo
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
                            // photo: employee.photo
                        }

                        ////
                         


                        if(by == 'postingIn' || by == 'dobStaPos' || by == 'dobComPos'  || by == 'dobDojPos' || by == 'dobDorPos' ||
                            by == 'dobRecPos' || by == 'staComPos' || by == 'staDojPos' || by == 'dobDegPos' ||
                            by == 'staDorPos' || by == 'staRecPos' || by == 'comDojPos' || by == 'staDegPos' ||
                            by == 'comDorPos' || by == 'comRecPos' || by == 'degDojPos' || by == 'degDorPos' ||
                            by == 'degRecPos' || by == 'dojDorPos' || by == 'dojRecPos' || by == 'comDegPos' ||
                            by == 'dorRecPos' || by == 'dorRecPos' || by == 'dojRecPos' || by == 'dojDorPos'
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
                        if(by == 'department' || by == 'dobStaDep' || by == 'dobComDep' || by == 'dobDegDep' || 
                            by == 'dobDojDep' || by == 'dobDorDep' || by == 'dobRecDep' || by == 'staComDep'
                            || by == 'staDegDep' || by == 'staDojDep' || by == 'staDorDep' || by == 'staRecDep'
                            || by == 'comDegDep' || by == 'comDojDep' || by == 'comDorDep' || by == 'comRecDep'
                            || by == 'degDojDep' || by == 'degDorDep' || by == 'degRecDep' || by == 'dojDorDep'
                            || by == 'dojRecDep' || by == 'dorRecDep'){
                            console.log('yes dept ');
                            if(transferOrPostingEmployeesList.toPostingInCategoryCode){
                                console.log('yes dept avail')
                                if(transferOrPostingEmployeesList.toDepartmentId == input.department){
                                    resultData.push(dataAll);
                                }
                            } 
                        }
                        if(by == 'designation' || by == 'dobStaDes' || by == 'dobComDes' || by == 'dobDegDes' ||
                            by == 'dobDojDes' || by == 'dobDorDes' || by == 'dobRecDes' || by == 'staComDes' ||
                            by == 'staDegDes' || by == 'staDojDes' || by == 'staDorDes' || by == 'staRecDes' ||
                            by == 'comDegDes' || by == 'comDojDes' || by == 'comDorDes' || by == 'comRecDes' ||
                            by == 'degDojDes' || by == 'degDorDes' || by == 'degRecDes' || by == 'dojDorDes' ||
                            by == 'dojRecDes' || by == 'dorRecDes' 
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
                            by == 'comPosDep' || by == 'degPosDep' || by == 'dojPosDep' || by == 'recPosDep'
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
                            by == 'dojPosDes' || by == 'dorPosDes' || by == 'recPosDes'
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
                            by == 'degDepDes' || by == 'dojDepDes' || by == 'dorDepDes' || by == 'recDepDes'
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
                        
                        else if(by == "dateOfBirth" || by == "dateOfJoining" || by == "dateOfRetirement" ||
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
                            by == "dojRec" || by == "dorRec" || by == "dobStaCom" || by == "dobStaDeg" || by == "dobStaDoj" ||
                            by == "dobStaDor" || by == "dobStaRec" || by == "dobComDeg" || by == "dobComDoj" || 
                            by == "dobComDor" || by == "dobComRec" || by == "dobDegDoj" || by == "dobDegDor" || 
                            by == "dobDegRec"  || by == "dobDojDor" || by == "dobDojRec" || by == "dobDorRec" || 
                            by == "staComDoj" || by == "staDojDor" || by == "staDojRec" || by == "comDegDoj" ||
                            by == "comDojDor" || by == "comDojRec" || by == "degDojRec" || by == "dojDorRec" 
                            || by == "staComDor" || by == "staDegDor" || by == "comDegDor" || by == "comDorRec" 
                            || by == "degDojDor" || by == "degDorRec" || by == "staComRec" || by == "staComDeg"
                            || by == "staDorRec" || by == "comDegRec" || by == "staDegDoj"|| by == "staDegRec"
                            || by == "comDegDep" ){
                            // console.log('dataAll => ', dataAll);
                            
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
        return [];
        }
}