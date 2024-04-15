const employeeProfile = require('../../models/employee/employeeProfile.model');
const employeeUpdate = require('../../models/employee/employeeUpdate.model');
const categories = require('../../models/categories/categories.model');

const { successRes, errorRes } = require("../../middlewares/response.middleware");
const { ObjectId, ObjectID } = require('mongodb');

// employeeProfile creation
exports.addEmployeeProfile = async (req, res) => {
    try {
        console.log('DEMO');
        console.log('try create employeeProfile');
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
                dataUpdate = await employeeUpdate.find({empProfileId: data[0]._id}).sort({ dateOfOrder: 'desc' }).exec();
                console.log('data ', data);
                console.log('dataUpdate ', dataUpdate);
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

    // Get MaleEmployees
exports.getMaleEmployees = async (req, res) => {
    try {
        let query = {};
        let genderDetails;
        let data;
        let genderId;

        genderDetails = await categories.find({
            "category_name": "Male"
        })

        console.log('genderDetails', genderDetails[0]._id);
        genderId = genderDetails[0]._id;
        query = {
            gender : genderId
        };
        data = await employeeProfile.find(query).sort({ dateOfJoining: 'asc' }).exec();
        
        let resData = {
            empCount : data.length,
            empList: data
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
    
            genderDetails = await categories.find({
                "category_name": "Female"
            })
    
            console.log('genderDetails', genderDetails[0]._id);
            genderId = genderDetails[0]._id;
            query = {
                gender : genderId
            };
            data = await employeeProfile.find(query).sort({ dateOfJoining: 'asc' }).exec();
            
            let resData = {
                empCount : data.length,
                empList: data
            }
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

        serviceDetails = await categories.find({
            "category_name": "Serving"
        })

        console.log('service Details', serviceDetails[0]._id);
        serviceId = serviceDetails[0]._id;
        query = {
            serviceStatus : serviceId
        };
        data = await employeeProfile.find(query).sort({ dateOfJoining: 'asc' }).exec();
        
        let resData = {
            empCount : data.length,
            empList: data
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

        serviceDetails = await categories.find({
            "category_name": "Retired"
        })

        console.log('service Details', serviceDetails[0]._id);
        serviceId = serviceDetails[0]._id;
        query = {
            serviceStatus : serviceId
        };
        data = await employeeProfile.find(query).sort({ dateOfJoining: 'asc' }).exec();
        
        let resData = {
            empCount : data.length,
            empList: data
        }
        successRes(res, resData, 'Retired Employees listed Successfully');
    } catch (error) {
        console.log('error', error);
        errorRes(res, error, "Error on listing Retired employees");
    }
}