const movable = require('../../models/forms/movable.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")

// Movable creation
exports.addMovable = async (req, res) => {
    try {
        console.log('try create movable', req.body);
        const query = req.body;
        //console.log('Uploaded file path:', req.file.path);
        if (req.file) {
            query.orderFile = req.file.path;
            console.log('Uploaded file path:', req.file.path);
        } else {
            throw new Error('File upload failed: No file uploaded');
        }
        const data = await movable.create(query);
        //res.json(data);
        successRes(res, data, 'movable created Successfully');
    } catch (error) {
        console.log('catch create movable');
        //res.json(error);
        errorRes(res, error, "Error on creating movable");
    }
    }

// Get Movable
exports.getMovable = async (req, res) => {
        console.log('helo from movable controller', req.query);
        try {
            let query = {};
            let data;
            if(req.query){
                query.where = req.query;
                data = await movable.find(req.query).exec();
            }
            else
                data = await movable.find();
            //res.json(data);
            successRes(res, data, 'movable listed Successfully');
        } catch (error) {
            console.log('error', error);
            //res.json(error);
            errorRes(res, error, "Error on listing movable");
        }
    }