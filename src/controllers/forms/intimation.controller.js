const intimation = require('../../models/forms/intimation.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")

// intimation creation
exports.addIntimation = async (req, res) => {
    try {
        console.log('try create intimation', req.body);
        const query = req.body;
        //console.log('Uploaded file path:', req.file.path);
        if (req.file) {
            query.orderFile = req.file.path;
            console.log('Uploaded file path:', req.file.path);
        } else {
            throw new Error('File upload failed: No file uploaded');
        }
        const data = await intimation.create(query);
        successRes(res, data, 'intimation created Successfully');
    } catch (error) {
        console.log('catch create intimation', error);
        errorRes(res, error, "Error on creating intimation");
    }
    }

// Get intimation
exports.getIntimation = async (req, res) => {
        console.log('helo from intimation controller', req.query);
        try {
            let query = {};
            let data;
            if(req.query){
                query.where = req.query;
                data = await intimation.find(req.query).exec();
            }
            else
                data = await intimation.find();
            successRes(res, data, 'intimation listed Successfully');
        } catch (error) {
            console.log('error', error);
            errorRes(res, error, "Error on listing intimation");
        }
    }