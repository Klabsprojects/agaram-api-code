const training = require('../../models/employee/training.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")
const whatsapp = require('../whatsapp/whatsapp.controller');

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