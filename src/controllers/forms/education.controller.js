const education = require('../../models/forms/education.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")

// education creation
exports.addEducation = async (req, res) => {
    try {
        console.log('try create education', req.body);
        const query = req.body;
        //console.log('Uploaded file path:', req.file.path);
        if (req.file) {
            query.orderFile = req.file.path;
            console.log('Uploaded file path:', req.file.path);
        } else {
            throw new Error('File upload failed: No file uploaded');
        }
        const data = await education.create(query);
        successRes(res, data, 'education created Successfully');
    } catch (error) {
        console.log('catch create education', error);
        errorRes(res, error, "Error on creating education");
    }
    }

// Get education
exports.getEducation = async (req, res) => {
        console.log('helo from education controller', req.query);
        try {
            let query = {};
            let data;
            if(req.query){
                query.where = req.query;
                data = await education.find(req.query).exec();
            }
            else
                data = await education.find();
            successRes(res, data, 'education listed Successfully');
        } catch (error) {
            console.log('error', error);
            errorRes(res, error, "Error on listing education");
        }
    }