const degree = require('../../models/employee/degree.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")

// Degree creation
exports.addDegree = async (req, res) => {
    try {
        console.log('try create Degree');
        const query = req.body;
        const data = await degree.create(query);
        //res.json(data);
        successRes(res, data, 'Degree created Successfully');
    } catch (error) {
        console.log('catch create Degree');
        //res.json(error);
        errorRes(res, error, "Error on creating degree");
    }
    }

// Get Degree
exports.getDegree = async (req, res) => {
        console.log('helo from Degree controller', req.query);
        try {
            let query = {};
            let data;
            if(req.query){
                query.where = req.query;
                data = await degree.find(req.query).exec();
            }
            else
                data = await degree.find();
            //res.json(data);
            successRes(res, data, 'Degree listed Successfully');
        } catch (error) {
            console.log('error', error);
            //res.json(error);
            errorRes(res, error, "Error on listing degree");
        }
    }