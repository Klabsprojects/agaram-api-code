const training = require('../../models/employee/training.model');
const employeeProfile = require('../../models/employee/employeeProfile.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")

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
                data = await training.find(req.query).exec();
            }
            else
                data = await training.find();
            successRes(res, data, 'training listed Successfully');
        } catch (error) {
            console.log('error', error);
            errorRes(res, error, "Error on listing training");
        }
    }