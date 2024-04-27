const privateVisit = require('../../models/forms/privateVisit.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")

// privateVisit creation
exports.addPrivateVisit = async (req, res) => {
    try {
        console.log('try create privateVisit');
        const query = req.body;
        //console.log('Uploaded file path:', req.file.path);
        const data = await privateVisit.create(query);
        //res.json(data);
        successRes(res, data, 'privateVisit created Successfully');
    } catch (error) {
        console.log('catch create privateVisit');
        //res.json(error);
        errorRes(res, error, "Error on creating privateVisit");
    }
    }

// Get privateVisit
exports.getPrivateVisit = async (req, res) => {
        console.log('helo from privateVisit controller', req.query);
        try {
            let query = {};
            let data;
            if(req.query){
                query.where = req.query;
                data = await privateVisit.find(req.query).exec();
            }
            else
                data = await privateVisit.find();
            //res.json(data);
            successRes(res, data, 'privateVisit listed Successfully');
        } catch (error) {
            console.log('error', error);
            //res.json(error);
            errorRes(res, error, "Error on listing privateVisit");
        }
    }