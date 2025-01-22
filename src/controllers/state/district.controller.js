const district = require('../../models/state/district.model');
//const { successRes, errorRes } = require("../../middlewares/response.middleware")
const { successRes, errorRes } = require("../../middlewares/response.middleware")
const {  ERRORS, SUCCESS, Op } = require("../../helpers/index.helper");
// district creation
exports.addDistrict = async (req, res) => {
    try {
        console.log('try create district');
        const query = req.body;
        const data = await district.create(query);
        //res.json(data);
        successRes(res, data, 'district registered Successfully');
    } catch (error) {
        console.log('catch create district');
        //res.json(error);
        const message = error.message ? error.message : ERRORS.CREATED;
        errorRes(res, error, message);
    }
    }

// Get district
exports.getDistrict = async (req, res) => {
        console.log('helo from district controller', req.query);
        try {
            let query = {};
            let data;
            if(req.query){
                query.where = req.query;
                data = await district.find(req.query).exec();
            }
            else
                data = await district.find();
            //res.json(data);
            successRes(res, data, 'District listed Successfully');
        } catch (error) {
            console.log('error', error);
            //res.json(error);
            const message = error.message ? error.message : ERRORS.LISTED;
            errorRes(res, error, message);
        }
    }