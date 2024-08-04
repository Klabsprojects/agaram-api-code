const employeeUpdate = require('../../models/employee/employeeUpdate.model');
const login = require('../../models/login/login.model');
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
            if(req.file){
                req.body.orderFile = req.file.path
                query.orderFile = req.file.path
                console.log('Uploaded file path:', req.file.path);
            }
            if(req.body.transferOrPostingEmployeesList){
                console.log(' original transferOrPostingEmployeesList ', req.body.transferOrPostingEmployeesList);
                //req.body.transferOrPostingEmployeesList = JSON.stringify(req.body.transferOrPostingEmployeesList);
                console.log(' after stringify transferOrPostingEmployeesList ', req.body.transferOrPostingEmployeesList);
                console.log('yes');
                query = req.body;
                req.body.transferOrPostingEmployeesList = JSON.parse(req.body.transferOrPostingEmployeesList);
                console.log(' after parse transferOrPostingEmployeesList ', req.body.transferOrPostingEmployeesList);
                for(let x of req.body.transferOrPostingEmployeesList){
                    console.log(x);
                    //console.log(parseInt(x.phone, 10));
                    phoneArr.push(x.phone); 
                }
            }
            console.log('phoneArr', phoneArr);
            let reqest = {}
            reqest.body = {
                phone: phoneArr,
                module: req.body.module,
                date: req.body.dateOfOrder,
                fileName: req.file.filename
            }
            console.log('request ', reqest);
            const data = await employeeUpdate.create(query);
            const goSent = await whatsapp.sendWhatsapp(reqest, res);
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

    // posting/promotion/transfer updation
exports.updateTransferPosting = async (req, res) => {
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
            const data = await employeeUpdate.findOneAndUpdate(filter, update, {
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

    exports.updateApprovalStatus = async (req, res) => {
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
                const data = await employeeUpdate.findOneAndUpdate(filter, update, {
                    new: true
                  });
                console.log('data updated ', data);
                let reqest = {}
                reqest.body = {
                    phone: req.body.phone,
                    module: req.body.module,
                    date: req.body.dateOfOrder,
                    fileName: req.file.filename
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