const training = require('../../models/employee/training.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")
const whatsapp = require('../whatsapp/whatsapp.controller');
const employeeProfile = require('../../models/employee/employeeProfile.model');

// training creation
exports.addTraining = async (req, res) => {
    try {
        console.log('try create training', req.body);
        const query = req.body;
        //console.log('Uploaded file path:', req.file.path);
        if (req.file) {
            query.orderFile = req.file.path;
            console.log('Uploaded file path:', req.file.path);
        } else {
            throw new Error('File upload failed: No file uploaded');
        }
        const data = await training.create(query);
        let reqest = {}
        reqest.body = {
            phone: req.body.phone,
            module: req.body.module,
            date: req.body.dateOfOrder,
            fileName: req.file.filename
        }
        const goSent = await whatsapp.sendWhatsapp(reqest, res);
        successRes(res, data, 'training created Successfully');
    } catch (error) {
        console.log('catch create training', error);
        errorRes(res, error, "Error on creating training");
    }
    }

// Get training
exports.getTraining = async (req, res) => {
        console.log('helo from training controller', req.query);
        try {
            let query = {};
            let data;
            if(req.query){
                query.where = req.query;
                //data = await education.find(req.query).exec();
                data = await training.find(req.query)
                .populate({
                    path: 'employeeProfileId',
                    model: 'employeeProfile', // Model of the application collection
                    select: 'batch' // Fields to select from the application collection
                })  
                .exec();
            }
            else
                //data = await education.find();
                data = await training.find()
                .populate({
                    path: 'employeeProfileId',
                    model: 'employeeProfile', // Model of the application collection
                    select: 'batch' // Fields to select from the application collection
                })  
                .exec();
            successRes(res, data, 'training listed Successfully');
        } catch (error) {
            console.log('error', error);
            errorRes(res, error, "Error on listing training");
        }
    }