const ltc = require('../../models/forms/ltc.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")
const whatsapp = require('../whatsapp/whatsapp.controller');

// Ltc creation
exports.addLtc = async (req, res) => {
    try {
        console.log('try create ltc');
        const query = req.body;
        //console.log('Uploaded file path:', req.file.path);
        
        if(req.file){
            query.orderFile = req.file.path
            //query.fcraClearance = req.file.path
            console.log('Uploaded file path:', req.file.path);
        }
        const data = await ltc.create(query);
        let reqest = {}
        reqest.body = {
            phone: req.body.phone,
            module: req.body.module,
            date: req.body.dateOfOrder,
            fileName: req.file.filename
        }
        const goSent = await whatsapp.sendWhatsapp(reqest, res);
        //res.json(data);
        successRes(res, data, 'ltc created Successfully');
    } catch (error) {
        console.log('catch create ltc');
        //res.json(error);
        errorRes(res, error, "Error on creating ltc");
    }
    }

// Get Ltc
exports.getLtc = async (req, res) => {
        console.log('helo from ltc controller', req.query);
        try {
            let query = {};
            let data;
            if(req.query){
                query.where = req.query;
                data = await ltc.find(req.query).exec();
            }
            else
                data = await ltc.find();
            //res.json(data);
            successRes(res, data, 'ltc listed Successfully');
        } catch (error) {
            console.log('error', error);
            //res.json(error);
            errorRes(res, error, "Error on listing ltc");
        }
    }