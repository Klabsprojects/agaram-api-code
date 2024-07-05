const designations = require('../../models/categories/designation.model');
//const { successRes, errorRes } = require("../../middlewares/response.middleware")
const { successRes, errorRes } = require("../../middlewares/response.middleware")
const {  ERRORS, SUCCESS, Op } = require("../../helpers/index.helper");
// Designations creation
exports.addDesignations = async (req, res) => {
    try {
        console.log('try create departments');
        const query = req.body;
        const data = await designations.create(query);
        //res.json(data);
        successRes(res, data, 'Designation registered Successfully');
    } catch (error) {
        console.log('catch create departments');
        //res.json(error);
        const message = error.message ? error.message : ERRORS.CREATED;
        errorRes(res, error, message);
    }
    }

// Get Designations
exports.getDesignations = async (req, res) => {
        console.log('helo from department controller', req.query);
        try {
            let query = {};
            let data;
            if(req.query){
                query.where = req.query;
                data = await designations.find(req.query).exec();
            }
            else
                data = await designations.find();
            //res.json(data);
            successRes(res, data, 'Designation listed Successfully');
        } catch (error) {
            console.log('error', error);
            //res.json(error);
            const message = error.message ? error.message : ERRORS.LISTED;
            errorRes(res, error, message);
        }
    }