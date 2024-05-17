const foreignVisit = require('../../models/forms/officialForeignVisit.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")

// Degree creation
exports.addVisit = async (req, res) => {
    try {
        console.log('try create foreignVisit');
        const query = req.body;
        console.log(query);
        //console.log('Uploaded file path:', req.file.path);
        console.log(req.file);
        if(req.file){
            query.politicalClearance = req.file.path
            //query.fcraClearance = req.file.path
            console.log('Uploaded file path:', req.file.path);
        }
        const data = await foreignVisit.create(query);
        //res.json(data);
        successRes(res, data, 'foreignVisit created Successfully');
    } catch (error) {
        console.log('catch create foreignVisit');
        //res.json(error);
        errorRes(res, error, "Error on creating foreignVisit");
    }
    }

// Get foreignVisit
exports.getVisit = async (req, res) => {
        console.log('helo from foreignVisit controller', req.query);
        try {
            let query = {};
            let data;
            if(req.query){
                query.where = req.query;
                data = await foreignVisit.find(req.query).exec();
            }
            else
                data = await foreignVisit.find();
            //res.json(data);
            successRes(res, data, 'foreignVisit listed Successfully');
        } catch (error) {
            console.log('error', error);
            //res.json(error);
            errorRes(res, error, "Error on listing foreignVisit");
        }
    }