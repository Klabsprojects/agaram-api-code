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
    const uniqueNamesByLatestDateOfOrder = secretariatDetails
      .sort((a, b) => new Date(b.dateOfOrder) - new Date(a.dateOfOrder)) // Sort by latest date first
      .reduce((acc, curr) => {
        if (!acc[curr.empProfileId]) { // Check if name already exists in accumulator
          acc[curr.empProfileId] = curr; // If not, add the current item
        }
        return acc;
      }, {});
    
    const uniqueArray = Object.values(uniqueNamesByLatestDateOfOrder);
    console.log('Unique by latest date of order:', uniqueArray);
    return uniqueArray;
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
            uniqueArray = await this.getEmployeeUpdate(employee._id);
            console.log('length ==> ', uniqueArray.length);
            if(uniqueArray.length == 1){
                let dataAll = {
                    toPostingInCategoryCode: uniqueArray[0].toPostingInCategoryCode,
                    toDepartmentId: uniqueArray[0].toDepartmentId,
                    toDesignationId: uniqueArray[0].toDesignationId,
                    postTypeCategoryCode: uniqueArray[0].postTypeCategoryCode,
                    locationChangeCategoryId: uniqueArray[0].locationChangeCategoryId,
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
                uniqueArray = await this.getEmployeeUpdate(employee._id);
                console.log('length ==> ', uniqueArray.length);
                if(uniqueArray.length == 1){
                    let dataAll = {
                        toPostingInCategoryCode: uniqueArray[0].toPostingInCategoryCode,
                        toDepartmentId: uniqueArray[0].toDepartmentId,
                        toDesignationId: uniqueArray[0].toDesignationId,
                        postTypeCategoryCode: uniqueArray[0].postTypeCategoryCode,
                        locationChangeCategoryId: uniqueArray[0].locationChangeCategoryId,
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
                uniqueArray = await this.getEmployeeUpdate(employee._id);
                console.log('length ==> ', uniqueArray.length);
                if(uniqueArray.length == 1){
                    let dataAll = {
                        toPostingInCategoryCode: uniqueArray[0].toPostingInCategoryCode,
                        toDepartmentId: uniqueArray[0].toDepartmentId,
                        toDesignationId: uniqueArray[0].toDesignationId,
                        postTypeCategoryCode: uniqueArray[0].postTypeCategoryCode,
                        locationChangeCategoryId: uniqueArray[0].locationChangeCategoryId,
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
            uniqueArray = await this.getEmployeeUpdate(employee._id);
            console.log('length ==> ', uniqueArray.length);
            if(uniqueArray.length == 1){
                let dataAll = {
                    toPostingInCategoryCode: uniqueArray[0].toPostingInCategoryCode,
                    toDepartmentId: uniqueArray[0].toDepartmentId,
                    toDesignationId: uniqueArray[0].toDesignationId,
                    postTypeCategoryCode: uniqueArray[0].postTypeCategoryCode,
                    locationChangeCategoryId: uniqueArray[0].locationChangeCategoryId,
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
            uniqueArray = await this.getEmployeeUpdate(employee._id);
            console.log('length ==> ', uniqueArray.length);
            if(uniqueArray.length == 1){
                let dataAll = {
                    toPostingInCategoryCode: uniqueArray[0].toPostingInCategoryCode,
                    toDepartmentId: uniqueArray[0].toDepartmentId,
                    toDesignationId: uniqueArray[0].toDesignationId,
                    postTypeCategoryCode: uniqueArray[0].postTypeCategoryCode,
                    locationChangeCategoryId: uniqueArray[0].locationChangeCategoryId,
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
        secretariatDetails =  await employeeUpdate.find({})
          const uniqueNamesByLatestDateOfOrder = secretariatDetails
            .sort((a, b) => new Date(b.dateOfOrder) - new Date(a.dateOfOrder)) // Sort by latest date first
            .reduce((acc, curr) => {
              if (!acc[curr.empProfileId]) { // Check if name already exists in accumulator
                acc[curr.empProfileId] = curr; // If not, add the current item
              }
              return acc;
            }, {});
          
          const uniqueArray = Object.values(uniqueNamesByLatestDateOfOrder);
          console.log('Unique by latest date of order:', uniqueArray);
          if(req.query.secretariat == 'yes'){
            let lastIndex = -1;
            for(let data of uniqueArray){
                
                console.log('toPostingInCategoryCode => ', data.toPostingInCategoryCode);
                console.log('categoryId => ', categoryId);
                if(data.toPostingInCategoryCode == categoryId)
                {
                    console.log('true');
                    let getQueryJson = {
                        _id: data.empProfileId
                    } 
                    console.log(getQueryJson);
                    const profileData = await employeeProfile.find(getQueryJson).exec();
                    console.log('profileData ', profileData);
                    if(profileData.length > 0){
                        resJson = {
                            employeeId : data.employeeId,
                            fullName: data.fullName,
                            toPostingInCategoryCode: data.toPostingInCategoryCode , 
                            toDepartmentId: data.toDepartmentId ,
                            toDesignationId: data.toDesignationId ,
                            postTypeCategoryCode: data.postTypeCategoryCode ,
                            dateOfOrder: data.dateOfOrder ,
                            orderForCategoryCode: data.orderForCategoryCode ,
                            orderTypeCategoryCode: data.orderTypeCategoryCode,
                            batch: profileData[0].batch,
                            ifhrmsId: profileData[0].ifhrmsId,
                            officeEmail: profileData[0].officeEmail,
                            mobileNo1: profileData[0].mobileNo1,
                            city: profileData[0].city
                        }
                        
                    console.log('resJson ', resJson);
                    resData.push(resJson);
                    console.log('resData ', resData);
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
                console.log('toPostingInCategoryCode => ', data.toPostingInCategoryCode);
                console.log('categoryId => ', categoryId);
                if(data.toPostingInCategoryCode != categoryId)
                {
                    console.log('true');
                    let getQueryJson = {
                        _id: data.empProfileId
                    } 
                    console.log(getQueryJson);
                    const profileData = await employeeProfile.find(getQueryJson).exec();
                    console.log('profileData ', profileData._doc);
                    if(profileData.length > 0){
                        resJson = {
                            employeeId : data.employeeId,
                            //fullName: data.fullName,
                            toPostingInCategoryCode: data.toPostingInCategoryCode , 
                            toDepartmentId: data.toDepartmentId ,
                            toDesignationId: data.toDesignationId ,
                            postTypeCategoryCode: data.postTypeCategoryCode ,
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
                if (lastIndex === uniqueArray.length - 1) {
                    console.log('Reached the end of the array');
                    //console.log(resData);
                  }   
            }
          }
          for(let i=0; i< resData.length; i++){
            console.log('resData name==> ', resData[i]);
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
                console.log('designationDetails', designationDetails);
                designationDetails2 = await designations.find({
                    "designation_name": desig2
                })
                console.log('designationDetails2', designationDetails2);

            }
        }
        console.log('designationDetails', designationDetails[0]._id);
        designationId1 = designationDetails[0]._id.toString();
        if(req.query.designation == "Additional Collector"){
            console.log('designationDetails2', designationDetails2[0]._id);
            designationId2 = designationDetails2[0]._id.toString();
        }
        
        secretariatDetails =  await employeeUpdate.find({})
          const uniqueNamesByLatestDateOfOrder = secretariatDetails
            .sort((a, b) => new Date(b.dateOfOrder) - new Date(a.dateOfOrder)) // Sort by latest date first
            .reduce((acc, curr) => {
              if (!acc[curr.empProfileId]) { // Check if name already exists in accumulator
                acc[curr.empProfileId] = curr; // If not, add the current item
              }
              return acc;
            }, {});
          
          const uniqueArray = Object.values(uniqueNamesByLatestDateOfOrder);
          console.log('Unique by latest date of order:', uniqueArray);
            let lastIndex = -1;
            for(let data of uniqueArray){
                
                console.log('toDesignationId => ', data.toDesignationId);
                console.log('designationId1 => ', designationId1);
                console.log('designationId2 => ', designationId2);
                if(req.query.designation == "Additional Collector"){
                    if(data.toDesignationId == designationId1 || data.toDesignationId == designationId2){
                        if(data.toDesignationId == designationId1)
                        {
                            console.log('true');
                            let getQueryJson = {
                                _id: data.empProfileId
                            } 
                            console.log(getQueryJson);
                            const profileData = await employeeProfile.find(getQueryJson).exec();
                            console.log('profileData ', profileData);
                            if(profileData.length > 0){
                                resJson = {
                                    employeeId : data.employeeId,
                                    fullName: data.fullName,
                                    toPostingInCategoryCode: data.toPostingInCategoryCode , 
                                    toDepartmentId: data.toDepartmentId ,
                                    toDesignationId: data.toDesignationId ,
                                    postTypeCategoryCode: data.postTypeCategoryCode ,
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
                    if(data.toDesignationId == designationId1)
                    {
                        console.log('true');
                        let getQueryJson = {
                            _id: data.empProfileId
                        } 
                        console.log(getQueryJson);
                        const profileData = await employeeProfile.find(getQueryJson).exec();
                        console.log('profileData ', profileData);
                        if(profileData.length > 0){
                            resJson = {
                                employeeId : data.employeeId,
                                fullName: data.fullName,
                                toPostingInCategoryCode: data.toPostingInCategoryCode , 
                                toDepartmentId: data.toDepartmentId ,
                                toDesignationId: data.toDesignationId ,
                                postTypeCategoryCode: data.postTypeCategoryCode ,
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
            updateQueryJson = {
                empId: employee._id
            }
            uniqueArray = await this.getEmployeeUpdateFilter(updateQueryJson);
            console.log('length ==> ', uniqueArray.length);
            if(uniqueArray.length == 1){
                let dataAll = {
                    toPostingInCategoryCode: uniqueArray[0].toPostingInCategoryCode,
                    toDepartmentId: uniqueArray[0].toDepartmentId,
                    toDesignationId: uniqueArray[0].toDesignationId,
                    postTypeCategoryCode: uniqueArray[0].postTypeCategoryCode,
                    locationChangeCategoryId: uniqueArray[0].locationChangeCategoryId,
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
                    if(uniqueArray[0].toDepartmentId == input.department){
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
                    if(uniqueArray[0].toPostingInCategoryCode){
                        {console.log('yes toposting avail')
                        if(uniqueArray[0].toPostingInCategoryCode == input.postingIn)
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
                    uniqueArray[0].toDepartmentId == input.department){
                        resultData.push(dataAll);
                    }
                }
                else if(by == 'dePo' || by == 'naDePo' || by == 'baDePo' || by == 'naBaDePo'){
                    if(uniqueArray[0].toDepartmentId == input.department){
                        if(uniqueArray[0].toPostingInCategoryCode){
                            console.log('yes toposting avail')
                            if(uniqueArray[0].toPostingInCategoryCode == input.postingIn)
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
                        if(uniqueArray[0].toPostingInCategoryCode){
                            console.log('yes toposting avail')
                            if(uniqueArray[0].toPostingInCategoryCode == input.postingIn)
                            {
                                console.log('yes posting matched')
                                resultData.push(dataAll);
                            }
                        }
                    }
                }
                else if(by == "all" || by == 'dePePo' || by == 'naDePePo' || by == 'baDePePo'){
                    if(uniqueArray[0].toDepartmentId == input.department){
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
                        if(uniqueArray[0].toPostingInCategoryCode){
                            console.log('yes toposting avail')
                            if(uniqueArray[0].toPostingInCategoryCode == input.postingIn)
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
            }/*else{
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
    console.log('inside getEmployeeUpdate function')
    let secretariatDetails;
    secretariatDetails =  await employeeUpdate.find({
        empProfileId: input.empId
    })
    const uniqueNamesByLatestDateOfOrder = secretariatDetails
      .sort((a, b) => new Date(b.dateOfOrder) - new Date(a.dateOfOrder)) // Sort by latest date first
      .reduce((acc, curr) => {
        if (!acc[curr.empProfileId]) { // Check if name already exists in accumulator
          acc[curr.empProfileId] = curr; // If not, add the current item
        }
        return acc;
      }, {});
    
    const uniqueArray = Object.values(uniqueNamesByLatestDateOfOrder);
    console.log('Unique by latest date of order:', uniqueArray);
    return uniqueArray;
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