const state = require('../../models/state/state.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")

// state creation
exports.addState = async (req, res) => {
    try {
        console.log('try create state');
        const query = req.body;
        const data = await state.create(query);
        successRes(res, data, 'state created Successfully');
    } catch (error) {
        console.log('catch create state', error);
        errorRes(res, error, "Error on creating state");
    }
    }

// Get state
exports.getState = async (req, res) => {
        console.log('helo from state controller', req.query);
        try {
            let query = {};
            let data;
            if(req.query){
                query.where = req.query;
                data = await state.find(req.query).exec();
            }
            else
                data = await state.find();
                successRes(res, data, 'state listed Successfully');
            } catch (error) {
                console.log('error', error);
                errorRes(res, error, "Error on listing state");
            }
    }