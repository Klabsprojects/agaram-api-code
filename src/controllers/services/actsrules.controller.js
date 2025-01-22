const actsrules = require('../../models/services/actsrules.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")

// actsrules creation
exports.addActsrules = async (req, res) => {
    try {
        // console.log('try create circular', req.body);
        const query = req.body;
        if (req.file) {
            query.actsrulesFile = req.file.path;
            // console.log('Uploaded file path:', req.file.path);
        } else {
            throw new Error('File upload failed: No file uploaded');
        }
        const data = await actsrules.create(query);
        successRes(res, data, 'actsrules created Successfully');
    } catch (error) {
        console.log('catch create actsrules', error);
        errorRes(res, error, "Error on creating actsrules");
    }
    }

// Get actsrules
exports.getActsrules = async (req, res) => {
        // console.log('helo from actsrules controller', req.query);
        try {
            let query = {};
            let data;
            if(req.query){
                query.where = req.query;
                data = await actsrules.find(req.query).exec();
            }
            else
                data = await actsrules.find();
            successRes(res, data, 'actsrules listed Successfully');
        } catch (error) {
            console.log('error', error);
            errorRes(res, error, "Error on listing actsrules");
        }
    }

    exports.deleteActsrules = async (req, res) => {
        // console.log('Hello from delete circular controller', req.params);
        try {
            let query = {};
            
            if (req.params.id) {
                // Delete by ID (assumes you are passing the ID in the URL params)
                query = { _id: req.params.id };
            } else {
                errorRes(res, error, "connot get Id");
            }
    
            const deletedCircular = await actsrules.findOneAndDelete(query);
    
            if (!deletedCircular) {
                return errorRes(res, null, 'Circular not found or already deleted');
            }
    
            successRes(res, deletedCircular, 'Circular deleted successfully');
        } catch (error) {
            console.log('Error', error);
            errorRes(res, error, "Error occurred while deleting the circular");
        }
    }
    


// actsrules updation
exports.updateaActsrules = async (req, res) => {
    try {
        console.log('try update actsrules');
        const query = req.body;
        let filter;
        let update = {};
        if(query.actsrulesNumber){
            update.actsrulesNumber = query.actsrulesNumber;
        }
        if(query.actsrulesDate){
            update.actsrulesDate = query.actsrulesDate;
        } 

        if(query.actsrulesDescription){
            update.actsrulesDescription = query.actsrulesDescription;
        } 

        if (req.file) {
            update.actsrulesFile = req.file.path;
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
            const data = await actsrules.findOneAndUpdate(filter, update, {
                new: true
              });
            console.log('data updated ', data);
            successRes(res, data, 'actsrules updated Successfully');
        } else {
            console.log('empty');
            throw 'Update value missing';
        }
    } catch (error) {
        console.log('catch update actsrules updation', error);
        errorRes(res, error, "Error on actsrules updation");
    }
    }