const immovable = require('../../models/forms/immovable.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")

// Immovable creation
exports.addImmovable = async (req, res) => {
    try {
        console.log('try create immovable', req.body);
        const query = req.body;
        //console.log('Uploaded file path:', req.file.path);
        if (req.file) {
            query.orderFile = req.file.path;
            console.log('Uploaded file path:', req.file.path);
        } else {
            throw new Error('File upload failed: No file uploaded');
        }
        const data = await immovable.create(query);
        //res.json(data);
        successRes(res, data, 'immovable created Successfully');
    } catch (error) {
        console.log('catch create immovable', error);
        //res.json(error);
        errorRes(res, error, "Error on creating immovable");
    }
    }

// Get Immovable
exports.getImmovable = async (req, res) => {
        console.log('helo from immovable controller', req.query);
        try {
            let query = {};
            let data;
            if(req.query){
                query.where = req.query;
                data = await immovable.find(req.query).exec();
            }
            else
                data = await immovable.find();
            //res.json(data);
            successRes(res, data, 'immovable listed Successfully');
        } catch (error) {
            console.log('error', error);
            //res.json(error);
            errorRes(res, error, "Error on listing movable");
        }
    }