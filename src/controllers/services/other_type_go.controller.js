const go = require('../../models/services/other_type_go.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")

// Go creation
exports.addgo = async (req, res) => {
    try {
        // console.log('try create go', req.body);
        const query = req.body;
        if (req.file) {
            query.GoFile = req.file.path;
            // console.log('Uploaded file path:', req.file.path);
        } else {
            throw new Error('File upload failed: No file uploaded');
        }
        const data = await go.create(query);
        successRes(res, data, 'Go created Successfully');
    } catch (error) {
        console.log('catch create Go', error);
        errorRes(res, error, "Error on creating Go");
    }
    }

// Get Go
exports.getgo = async (req, res) => {
        // console.log('helo from Go controller', req.query);
        try {
            let query = {};
            let data;
            if(req.query){
                query.where = req.query;
                data = await go.find(req.query).exec();
            }
            else
                data = await go.find();
            successRes(res, data, 'Go listed Successfully');
        } catch (error) {
            console.log('error', error);
            errorRes(res, error, "Error on listing Go");
        }
    }

    exports.deletego = async (req, res) => {
        // console.log('Hello from delete go controller', req.params);
        try {
            let query = {};
            
            if (req.params.id) {
                // Delete by ID (assumes you are passing the ID in the URL params)
                query = { _id: req.params.id };
            } else {
                errorRes(res, error, "connot get Id");
            }
    
            const deletedgo = await go.findOneAndDelete(query);
    
            if (!deletedgo) {
                return errorRes(res, null, 'go not found or already deleted');
            }
    
            successRes(res, deletedgo, 'go deleted successfully');
        } catch (error) {
            console.log('Error', error);
            errorRes(res, error, "Error occurred while deleting the go");
        }
    }
    


// Go updation
exports.updateGo = async (req, res) => {
    try {
        console.log('try update Go');
        const query = req.body;
        let filter;
        let update = {};
        if(query.GoNumber){
            update.GoNumber = query.GoNumber;
        }
        if(query.GoDate){
            update.GoDate = query.GoDate;
        } 

        if(query.GoDescription){
            update.GoDescription = query.GoDescription;
        } 

        if (req.file) {
            update.GoFile = req.file.path;
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
            const data = await go.findOneAndUpdate(filter, update, {
                new: true
              });
            console.log('data updated ', data);
            successRes(res, data, 'Go updated Successfully');
        } else {
            console.log('empty');
            throw 'Update value missing';
        }
    } catch (error) {
        console.log('catch update Go updation', error);
        errorRes(res, error, "Error on Go updation");
    }
    }