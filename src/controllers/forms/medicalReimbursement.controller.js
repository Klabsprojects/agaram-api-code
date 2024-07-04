const medicalReimbursement = require('../../models/forms/medicalReimbursement.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")
const whatsapp = require('../whatsapp/whatsapp.controller');

// medicalReimbursement creation
exports.addMedicalReimbursement = async (req, res) => {
    try {
        console.log('try create medicalReimbursement', req.body);
        const query = req.body;
        //console.log('Uploaded file path:', req.file.path);
        if (req.file) {
            query.orderFile = req.file.path;
            console.log('Uploaded file path:', req.file.path);
        } else {
            throw new Error('File upload failed: No file uploaded');
        }
        let reqest = {}
        reqest.body = {
            phone: req.body.phone,
            module: req.body.module,
            date: req.body.dateOfOrder,
            fileName: req.file.filename
        }
        const goSent = await whatsapp.sendWhatsapp(reqest, res);
        const data = await medicalReimbursement.create(query);
        successRes(res, data, 'medicalReimbursement created Successfully');
    } catch (error) {
        console.log('catch create medicalReimbursement', error);
        errorRes(res, error, "Error on creating medicalReimbursement");
    }
    }

// Get MedicalReimbursement
exports.getMedicalReimbursement = async (req, res) => {
        console.log('helo from medicalReimbursement controller', req.query);
        try {
            let query = {};
            let data;
            if(req.query){
                query.where = req.query;
                data = await medicalReimbursement.find(req.query).exec();
            }
            else
                data = await medicalReimbursement.find();
            successRes(res, data, 'medicalReimbursement listed Successfully');
        } catch (error) {
            console.log('error', error);
            errorRes(res, error, "Error on listing medicalReimbursement");
        }
    }