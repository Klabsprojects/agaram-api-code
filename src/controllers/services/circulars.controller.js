const circluar = require('../../models/services/circulars.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")

// circluar creation
exports.addCircular = async (req, res) => {
    try {
        // console.log('try create circular', req.body);
        const query = req.body;
        if (req.file) {
            query.CircularFile = req.file.path;
            // console.log('Uploaded file path:', req.file.path);
        } else {
            throw new Error('File upload failed: No file uploaded');
        }
        const data = await circluar.create(query);
        successRes(res, data, 'circluar created Successfully');
    } catch (error) {
        console.log('catch create circluar', error);
        errorRes(res, error, "Error on creating circluar");
    }
    }

// Get circluar
exports.getCircluar = async (req, res) => {
        // console.log('helo from circluar controller', req.query);
        try {
            let query = {};
            let data;
            if(req.query){
                query.where = req.query;
                data = await circluar.find(req.query).exec();
            }
            else
                data = await circluar.find();
            successRes(res, data, 'circluar listed Successfully');
        } catch (error) {
            console.log('error', error);
            errorRes(res, error, "Error on listing circluar");
        }
    }

    exports.deleteCircular = async (req, res) => {
        // console.log('Hello from delete circular controller', req.params);
        try {
            let query = {};
            
            if (req.params.id) {
                // Delete by ID (assumes you are passing the ID in the URL params)
                query = { _id: req.params.id };
            } else {
                errorRes(res, error, "connot get Id");
            }
    
            const deletedCircular = await circluar.findOneAndDelete(query);
    
            if (!deletedCircular) {
                return errorRes(res, null, 'Circular not found or already deleted');
            }
    
            successRes(res, deletedCircular, 'Circular deleted successfully');
        } catch (error) {
            console.log('Error', error);
            errorRes(res, error, "Error occurred while deleting the circular");
        }
    }
    


// circluar updation
exports.updatecircluar = async (req, res) => {
    try {
        console.log('try update circluar');
        const query = req.body;
        let filter;
        let update = {};
        if(query.CircularNumber){
            update.CircularNumber = query.CircularNumber;
        }
        if(query.CircularDate){
            update.CircularDate = query.CircularDate;
        } 

        if(query.CircularDescription){
            update.CircularDescription = query.CircularDescription;
        } 

        if (req.file) {
            update.CircularFile = req.file.path;
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
            const data = await circluar.findOneAndUpdate(filter, update, {
                new: true
              });
            console.log('data updated ', data);
            successRes(res, data, 'circluar updated Successfully');
        } else {
            console.log('empty');
            throw 'Update value missing';
        }
    } catch (error) {
        console.log('catch update circluar updation', error);
        errorRes(res, error, "Error on circluar updation");
    }
    }