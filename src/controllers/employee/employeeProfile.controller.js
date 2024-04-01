const employeeProfile = require('../../models/employee/employeeProfile.model');
const employeeUpdate = require('../../models/employee/employeeUpdate.model');

const { successRes, errorRes } = require("../../middlewares/response.middleware")

// employeeProfile creation
exports.addEmployeeProfile = async (req, res) => {
    try {
        console.log('DEMO');
        console.log('try create employeeProfile');
        const query = req.body;
        const data = await employeeProfile.create(query);
        successRes(res, data, 'Employee added Successfully');
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
    } catch (error) {
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
        if(query.email){
            update.email = query.email;
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