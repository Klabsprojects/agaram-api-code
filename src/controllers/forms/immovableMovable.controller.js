const immovableMovable = require('../../models/forms/immovableMovable.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")

// ImmovableMovable creation
exports.addImmovableMovable = async (req, res) => {
    try {
        console.log('try create immovableMovable');
        const query = req.body;
        //console.log('Uploaded file path:', req.file.path);
        const data = await immovableMovable.create(query);
        //res.json(data);
        successRes(res, data, 'immovableMovable created Successfully');
    } catch (error) {
        console.log('catch create immovableMovable');
        //res.json(error);
        errorRes(res, error, "Error on creating immovableMovable");
    }
    }

// Get ImmovableMovable
exports.getImmovableMovable = async (req, res) => {
        console.log('helo from immovableMovable controller', req.query);
        try {
            let query = {};
            let data;
            if(req.query){
                query.where = req.query;
                data = await immovableMovable.find(req.query).exec();
            }
            else
                data = await immovableMovable.find();
            //res.json(data);
            successRes(res, data, 'immovableMovable listed Successfully');
        } catch (error) {
            console.log('error', error);
            //res.json(error);
            errorRes(res, error, "Error on listing immovableMovable");
        }
    }