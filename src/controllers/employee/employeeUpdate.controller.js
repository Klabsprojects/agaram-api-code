const employeeUpdate = require('../../models/employee/employeeUpdate.model');

const { successRes, errorRes } = require("../../middlewares/response.middleware")

// employeeUpdate creation
exports.addEmployeeUpdate = async (req, res) => {
    try {
        console.log('try create employeeUpdate');
        const query = req.body;
        const data = await employeeUpdate.create(query);
        successRes(res, data, 'Employee Update added Successfully');
    } catch (error) {
        console.log('catch create employeeUpdate');
        errorRes(res, error, "Error on employeeUpdate creation");
    }
}

exports.addTransferOrPostingManyEmployees = async (req, res) => {
    try {
            console.log('try create bulk employees transfer/posting');
            let query = {};
            if(req.body.transferOrPostingEmployeesList){
                console.log('yes');
                query = req.body;
            }
            const data = await employeeUpdate.create(query);
            successRes(res, data, 'Bulk Employees transfer/posting Added successfully');
    } catch (error) {
            console.log('catch create employeeUpdate', error);
            errorRes(res, error, "Error on Bulk Employees transfer/posting Add");
    }
}

// Get employeeUpdate
exports.getEmployeeUpdate = async (req, res) => {
        console.log('helo from employeeUpdate controller', req.query);
        try {
            let query = {};
            let data;
            if(req.query){
                query.where = req.query;
                data = await employeeUpdate.find(req.query).exec();
            }
            else
                data = await employeeUpdate.find();
            successRes(res, data, 'Employee Update listed Successfully');
        } catch (error) {
            console.log('error', error.reason);
            errorRes(res, error, "Error on listing employee Update");
        }
    }