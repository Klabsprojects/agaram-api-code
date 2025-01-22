const Utilityforms = require('../../models/services/Utilityforms.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")

// Utilityforms creation
exports.addUtilityforms = async (req, res) => {
    try {
        // console.log('try create Utilityforms', req.body);
        const query = req.body;
        if (req.file) {
            query.UtilityFile = req.file.path;
            // console.log('Uploaded file path:', req.file.path);
        } else {
            throw new Error('File upload failed: No file uploaded');
        }
        const data = await Utilityforms.create(query);
        successRes(res, data, 'Utilityforms created Successfully');
    } catch (error) {
        console.log('catch create Utilityforms', error);
        errorRes(res, error, "Error on creating Utilityforms");
    }
    }

// Get Utilityforms
exports.getUtilityforms = async (req, res) => {
        // console.log('helo from Utilityforms controller', req.query);
        try {
            let query = {};
            let data;
            if(req.query){
                query.where = req.query;
                data = await Utilityforms.find(req.query).exec();
            }
            else
                data = await Utilityforms.find();
            successRes(res, data, 'Utilityforms listed Successfully');
        } catch (error) {
            console.log('error', error);
            errorRes(res, error, "Error on listing Utilityforms");
        }
    }

    exports.deleteUtilityforms = async (req, res) => {
        // console.log('Hello from delete Utilityforms controller', req.params);
        try {
            let query = {};
            
            if (req.params.id) {
                // Delete by ID (assumes you are passing the ID in the URL params)
                query = { _id: req.params.id };
            } else {
                errorRes(res, error, "connot get Id");
            }
    
            const deletedUtilityforms = await Utilityforms.findOneAndDelete(query);
    
            if (!deletedUtilityforms) {
                return errorRes(res, null, 'Utilityforms not found or already deleted');
            }
    
            successRes(res, deletedUtilityforms, 'Utilityforms deleted successfully');
        } catch (error) {
            console.log('Error', error);
            errorRes(res, error, "Error occurred while deleting the Utilityforms");
        }
    }
    


// Utilityforms updation
exports.updateUtilityforms = async (req, res) => {
    try {
        console.log('try update Utilityforms');
        const query = req.body;
        let filter;
        let update = {};
        if(query.UtilityNumber){
            update.UtilityNumber = query.UtilityNumber;
        }
        if(query.UtilityDate){
            update.UtilityDate = query.UtilityDate;
        } 

        if(query.UtilityDescription){
            update.UtilityDescription = query.UtilityDescription;
        } 

        if (req.file) {
            update.UtilityFile = req.file.path;
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
            const data = await Utilityforms.findOneAndUpdate(filter, update, {
                new: true
              });
            console.log('data updated ', data);
            successRes(res, data, 'Utilityforms updated Successfully');
        } else {
            console.log('empty');
            throw 'Update value missing';
        }
    } catch (error) {
        console.log('catch update Utilityforms updation', error);
        errorRes(res, error, "Error on Utilityforms updation");
    }
    }