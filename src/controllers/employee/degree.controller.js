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

// degree updation
exports.updateDegree = async (req, res) => {
    try {
        console.log('try update degree');
        const query = req.body;
        let filter;
        let update = {};
        if(query.degree_name){
            update.degree_name = query.degree_name;
        }
        if(query.id){
            filter = {
                _id : query.id
            }
        }
        else
            throw 'pls provide id field';
        console.log('update ', update);
        console.log('filter ', filter);
        // Check if the update object is empty or not
        if (Object.keys(update).length > 0) {
            console.log('value got');
            const data = await degree.findOneAndUpdate(filter, update, {
                new: true
              });
            console.log('data updated ', data);
            successRes(res, data, 'degree updated Successfully');
        } else {
            console.log('empty');
            throw 'Update value missing';
        }
    } catch (error) {
        console.log('catch update degree updation', error);
        errorRes(res, error, "Error on degree updation");
    }
    }