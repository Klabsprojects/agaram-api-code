const leave = require('../../models/employee/leave.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")
const whatsapp = require('../whatsapp/whatsapp.controller');
const employeeProfile = require('../../models/employee/employeeProfile.model');

// leave creation
exports.addLeave = async (req, res) => {
    try {
        console.log('try create leave', req.body);
        const query = req.body;
        //console.log('Uploaded file path:', req.file.path);
        if (req.file) {
            query.orderFile = req.file.path;
            console.log('Uploaded file path:', req.file.path);
            console.log('Uploaded file path:', req.file.filename);
        } else {
            throw new Error('File upload failed: No file uploaded');
        }
        const data = await leave.create(query);
        let reqest = {}
        reqest.body = {
            phone: req.body.phone,
            module: req.body.module,
            date: req.body.dateOfOrder,
            fileName: req.file.filename
        }
        const goSent = await whatsapp.sendWhatsapp(reqest, res);
        successRes(res, data, 'leave created Successfully');
    } catch (error) {
        console.log('catch create leave', error);
        errorRes(res, error, "Error on creating leave");
    }
    }

// Get leave
exports.getLeave = async (req, res) => {
        console.log('helo from leave controller', req.query);
        try {
            let query = {};
            let data;
            if(req.query){
                query.where = req.query;
                //data = await education.find(req.query).exec();
                data = await leave.find(req.query)
                .populate({
                    path: 'employeeProfileId',
                    model: 'employeeProfile', // Model of the application collection
                    select: 'batch' // Fields to select from the application collection
                })  
                .exec();
            }
            else
                //data = await education.find();
                data = await leave.find()
                .populate({
                    path: 'employeeProfileId',
                    model: 'employeeProfile', // Model of the application collection
                    select: 'batch' // Fields to select from the application collection
                })  
                .exec();
            successRes(res, data, 'leave listed Successfully');
        } catch (error) {
            console.log('error', error);
            errorRes(res, error, "Error on listing leave");
        }
    }