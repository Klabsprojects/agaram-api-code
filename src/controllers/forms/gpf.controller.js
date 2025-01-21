const gpf = require('../../models/forms/gpf.model');
const login = require('../../models/login/login.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")
const whatsapp = require('../whatsapp/whatsapp.controller');

// gpf creation
exports.addGpf = async (req, res) => {
    try {
        console.log('try create Gpf', req.body);
        const query = req.body;
        //console.log('Uploaded file path:', req.file.path);
        if (req.file) {
            query.orderFile = req.file.path;
            console.log('Uploaded file path:', req.file.path);
        } else {
            throw new Error('File upload failed: No file uploaded');
        }
        const data = await gpf.create(query);
        let reqest = {}
        reqest.body = {
            phone: req.body.phone,
            module: req.body.module,
            date: req.body.dateOfOrder,
            fileName: req.file.filename
        }
        const goSent = await whatsapp.sendWhatsapp(reqest, res);
        successRes(res, data, 'Gpf created Successfully');
    } catch (error) {
        console.log('catch create Gpf', error);
        errorRes(res, error, "Error on creating Gpf");
    }
    }