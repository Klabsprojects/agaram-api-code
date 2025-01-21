const idcard = require('../../models/forms/idCard.model');
const login = require('../../models/login/login.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")
const whatsapp = require('../whatsapp/whatsapp.controller');

// Idcard creation
exports.addIdcard = async (req, res) => {
    try {
        console.log('try create Idcard', req.body);
        const query = req.body;

        if (req.files && req.files['orderFile'] && req.files['orderFile'].length > 0) {
            // If orderFile file exists
            query.orderFile = req.files['orderFile'][0].path; // Assuming only one file is uploaded
            console.log('Uploaded orderFile file path:', req.files['orderFile'][0].path);
        } else {
            throw new Error('orderFile upload failed: No orderFile file uploaded');
        }

        if (req.files && req.files['idCardApplication'] && req.files['idCardApplication'].length > 0) {
            // If idCardApplication file exists
            query.idCardApplication = req.files['idCardApplication'][0].path; // Assuming only one file is uploaded
            console.log('idCardApplication file path:', req.files['idCardApplication'][0].path);
        }

        if (req.files && req.files['finalIdCard'] && req.files['finalIdCard'].length > 0) {
            // If finalIdCard file exists
            query.finalIdCard = req.files['finalIdCard'][0].path; // Assuming only one file is uploaded
            console.log('finalIdCard file path:', req.files['finalIdCard'][0].path);
        }
        console.log('query ', query);
        const data = await idcard.create(query);
        let reqest = {}
        reqest.body = {
            phone: req.body.phone,
            module: req.body.module,
            date: req.body.dateOfOrder,
            fileName: query.orderFile
        }
        const goSent = await whatsapp.sendWhatsapp(reqest, res);
        successRes(res, data, 'Idcard created Successfully');
    } catch (error) {
        console.log('catch create Idcard', error);
        errorRes(res, error, "Error on creating Idcard");
    }
    }