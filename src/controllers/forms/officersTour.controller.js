const officersTour = require('../../models/forms/officersTour.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")
const whatsapp = require('../whatsapp/whatsapp.controller');

// officersTour creation
exports.addOfficersTour = async (req, res) => {
    try {
        console.log('try create officersTour');
        const query = req.body;
        //console.log('Uploaded file path:', req.file.path);
        const data = await officersTour.create(query);
        let reqest = {}
        reqest.body = {
            phone: req.body.phone,
            module: req.body.module,
            date: req.body.dateOfOrder,
            fileName: req.file.filename
        }
        const goSent = await whatsapp.sendWhatsapp(reqest, res);
        //res.json(data);
        successRes(res, data, 'officersTour created Successfully');
    } catch (error) {
        console.log('catch create officersTour');
        //res.json(error);
        errorRes(res, error, "Error on creating officersTour");
    }
    }

// Get officersTour
exports.getOfficersTour = async (req, res) => {
        console.log('helo from officersTour controller', req.query);
        try {
            let query = {};
            let data;
            if(req.query){
                query.where = req.query;
                data = await officersTour.find(req.query).exec();
            }
            else
                data = await officersTour.find();
            //res.json(data);
            successRes(res, data, 'officersTour listed Successfully');
        } catch (error) {
            console.log('error', error);
            //res.json(error);
            errorRes(res, error, "Error on listing officersTour");
        }
    }