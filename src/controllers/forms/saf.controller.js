const saf = require('../../models/forms/saf.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")

// saf creation
exports.addSaf = async (req, res) => {
    try {
        console.log('try create saf');
        const query = req.body;
        //console.log('Uploaded file path:', req.file.path);
        const data = await saf.create(query);
        //res.json(data);
        successRes(res, data, 'saf created Successfully');
    } catch (error) {
        console.log('catch create saf');
        //res.json(error);
        errorRes(res, error, "Error on creating saf");
    }
    }

// Get saf
exports.getSaf = async (req, res) => {
        console.log('helo from saf controller', req.query);
        try {
            let query = {};
            let data;
            if(req.query){
                query.where = req.query;
                data = await saf.find(req.query).exec();
            }
            else
                data = await saf.find();
            //res.json(data);
            successRes(res, data, 'saf listed Successfully');
        } catch (error) {
            console.log('error', error);
            //res.json(error);
            errorRes(res, error, "Error on listing saf");
        }
    }