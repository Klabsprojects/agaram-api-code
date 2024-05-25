const safApplication = require('../../models/forms/safApplication.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")

// safApplication creation
exports.addSafApplication = async (req, res) => {
    try {
        console.log('try create safApplication', req.body);
        const query = req.body;
        const data = await safApplication.create(query);
        successRes(res, data, 'safApplication created Successfully');
    } catch (error) {
        console.log('catch create safApplication', error);
        errorRes(res, error, "Error on creating safApplication");
    }
    }

// Get safApplication
exports.getSafApplication = async (req, res) => {
        console.log('helo from safApplication controller', req.query);
        try {
            let query = {};
            let data;
            if(req.query){
                query.where = req.query;
                data = await safApplication.find(req.query).exec();
            }
            else
                data = await safApplication.find();
            successRes(res, data, 'safApplication listed Successfully');
        } catch (error) {
            console.log('error', error);
            errorRes(res, error, "Error on listing safApplication");
        }
    }