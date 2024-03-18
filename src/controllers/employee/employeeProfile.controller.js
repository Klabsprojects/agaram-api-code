const employeeProfile = require('../../models/employee/employeeProfile.model');

const { successRes, errorRes } = require("../../middlewares/response.middleware")

// employeeProfile creation
exports.addEmployeeProfile = async (req, res) => {
    try {
        console.log('try create employeeProfile');
        const query = req.body;
        const data = await employeeProfile.create(query);
        successRes(res, data, 'Employee added Successfully');
    } catch (error) {
        console.log('catch create employeeProfile');
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
                data = await employeeProfile.find(req.query).exec();
            }
            else
                data = await employeeProfile.find();
            successRes(res, data, 'Employee listed Successfully');
        } catch (error) {
            console.log('error', error.reason);
            errorRes(res, error, "Error on listing employee");
        }
    }