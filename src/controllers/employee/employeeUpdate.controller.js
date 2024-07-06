const employeeUpdate = require('../../models/employee/employeeUpdate.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")
const whatsapp = require('../whatsapp/whatsapp.controller');

// employeeUpdate creation
exports.addEmployeeUpdate = async (req, res) => {
    try {
        console.log('try create employeeUpdate');
        const query = req.body;
        if(req.file){
            query.orderFile = req.file.path
            //query.fcraClearance = req.file.path
            console.log('Uploaded file path:', req.file.path);
        }
        const data = await employeeUpdate.create(query);
        successRes(res, data, 'Employee Update added Successfully');
    } catch (error) {
        console.log('catch create employeeUpdate', error);
        errorRes(res, error, "Error on employeeUpdate creation");
    }
}

exports.addTransferOrPostingManyEmployees = async (req, res) => {
    try {
            console.log('try create bulk employees transfer/posting', req.body);
            let query = {};
            let phoneArr = [];
            if(req.body.transferOrPostingEmployeesList){
                console.log('yes');
                query = req.body;
                for(let x of req.body.transferOrPostingEmployeesList){
                    console.log(x);
                    //console.log(parseInt(x.phone, 10));
                    //phoneArr.push(x); 
                }
            }
            console.log('phoneArr', phoneArr);
            /*let reqest = {}
            reqest.body = {
                phone: phoneArr,
                module: req.body.module,
                date: req.body.dateOfOrder,
                fileName: req.file.filename
            }
            console.log('request ', reqest);*/
            const data = await employeeUpdate.create(query);
            //const goSent = await whatsapp.sendWhatsapp(reqest, res);
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