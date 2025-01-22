const faq = require('../../models/services/faq.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")

// faq creation
exports.addfaq = async (req, res) => {
    try {
        console.log('try create faq', req.body);
        console.log('try create faq');
        const query = req.body;
        const data = await faq.create(query);
        successRes(res, data, 'faq created Successfully');
    } catch (error) {
        console.log('catch create faq', error);
        errorRes(res, error, "Error on creating faq");
    }
    }

// Get faq
exports.getfaq = async (req, res) => {
        // console.log('helo from faq controller', req.query);
        try {
            let query = {};
            let data;
            if(req.query){
                query.where = req.query;
                data = await faq.find(req.query).exec();
            }
            else
                data = await faq.find();
            successRes(res, data, 'faq listed Successfully');
        } catch (error) {
            console.log('error', error);
            errorRes(res, error, "Error on listing faq");
        }
    }

    exports.deletefaq = async (req, res) => {
        // console.log('Hello from delete faq controller', req.params);
        try {
            let query = {};
            
            if (req.params.id) {
                // Delete by ID (assumes you are passing the ID in the URL params)
                query = { _id: req.params.id };
            } else {
                errorRes(res, error, "connot get Id");
            }
    
            const deletedfaq = await faq.findOneAndDelete(query);
    
            if (!deletedfaq) {
                return errorRes(res, null, 'faq not found or already deleted');
            }
    
            successRes(res, deletedfaq, 'faq deleted successfully');
        } catch (error) {
            console.log('Error', error);
            errorRes(res, error, "Error occurred while deleting the faq");
        }
    }
    


// faq updation
exports.updatefaq = async (req, res) => {
    try {
        console.log('try update faq');
        const query = req.body;
        let filter;
        let update = {};
        if(query.Answer){
            update.Answer = query.Answer;
        }
        if(query.Question){
            update.Question = query.Question;
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
            const data = await faq.findOneAndUpdate(filter, update, {
                new: true
              });
            console.log('data updated ', data);
            successRes(res, data, 'faq updated Successfully');
        } else {
            console.log('empty');
            throw 'Update value missing';
        }
    } catch (error) {
        console.log('catch update faq updation', error);
        errorRes(res, error, "Error on faq updation");
    }
    }