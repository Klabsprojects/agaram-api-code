const block = require('../../models/forms/block.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")

// block creation
exports.addBlock = async (req, res) => {
    try {
        console.log('try create block', req.body);
        const query = req.body;
        const data = await block.create(query);
        successRes(res, data, 'block created Successfully');
    } catch (error) {
        console.log('catch create block', error);
        errorRes(res, error, "Error on creating block");
    }
    }

// Get block
exports.getBlock = async (req, res) => {
        console.log('helo from block controller', req.query);
        try {
            let query = {};
            let data;
            if(req.query){
                query.where = req.query;
                data = await block.find(req.query).exec();
            }
            else
                data = await block.find();
            successRes(res, data, 'block listed Successfully');
        } catch (error) {
            console.log('error', error);
            errorRes(res, error, "Error on listing block");
        }
    }

// block updation
exports.updateBlock = async (req, res) => {
    try {
        console.log('try update block');
        const query = req.body;
        let filter;
        let update = {};
        if(query.allocationStatus){
            update.allocationStatus = query.allocationStatus;
        }
        if(query.allocationTo){
            update.allocationTo = query.allocationTo;
        } 
        if(query.blockNumber){
            update.blockNumber = query.blockNumber;
        }
        if(query.FlatNumber){
            update.FlatNumber = query.FlatNumber;
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
            const data = await block.findOneAndUpdate(filter, update, {
                new: true
              });
            console.log('data updated ', data);
            successRes(res, data, 'block allocationStatus updated Successfully');
        } else {
            console.log('empty');
            throw 'Update value missing';
        }
    } catch (error) {
        console.log('catch update block allocationStatus updation', error);
        errorRes(res, error, "Error on block allocationStatus updation");
    }
    }