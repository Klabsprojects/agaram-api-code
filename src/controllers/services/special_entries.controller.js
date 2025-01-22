const SpecialEntries = require('../../models/services/special_entries.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")

// SpecialEntries creation
exports.addSpecialEntries = async (req, res) => {
    try {
        // console.log('try create SpecialEntries', req.body);
        const query = req.body;
        if (req.file) {
            query.SpecialEntiriesFile = req.file.path;
            // console.log('Uploaded file path:', req.file.path);
        } else {
            throw new Error('File upload failed: No file uploaded');
        }
        const data = await SpecialEntries.create(query);
        successRes(res, data, 'SpecialEntries created Successfully');
    } catch (error) {
        console.log('catch create SpecialEntries', error);
        errorRes(res, error, "Error on creating SpecialEntries");
    }
    }

// Get SpecialEntries
exports.getSpecialEntries = async (req, res) => {
        // console.log('helo from SpecialEntries controller', req.query);
        try {
            let query = {};
            let data;
            if(req.query){
                query.where = req.query;
                data = await SpecialEntries.find(req.query).exec();
            }
            else
                data = await SpecialEntries.find();
            successRes(res, data, 'SpecialEntries listed Successfully');
        } catch (error) {
            console.log('error', error);
            errorRes(res, error, "Error on listing SpecialEntries");
        }
    }

    exports.deleteSpecialEntries = async (req, res) => {
        // console.log('Hello from delete SpecialEntries controller', req.params);
        try {
            let query = {};
            
            if (req.params.id) {
                // Delete by ID (assumes you are passing the ID in the URL params)
                query = { _id: req.params.id };
            } else {
                errorRes(res, error, "connot get Id");
            }
    
            const deletedSpecialEntries = await SpecialEntries.findOneAndDelete(query);
    
            if (!deletedSpecialEntries) {
                return errorRes(res, null, 'SpecialEntries not found or already deleted');
            }
    
            successRes(res, deletedSpecialEntries, 'SpecialEntries deleted successfully');
        } catch (error) {
            console.log('Error', error);
            errorRes(res, error, "Error occurred while deleting the SpecialEntries");
        }
    }
    


// SpecialEntries updation
exports.updateSpecialEntries = async (req, res) => {
    try {
        console.log('try update SpecialEntries');
        const query = req.body;
        let filter;
        let update = {};
        if(query.SpecialEntiriesNumber){
            update.SpecialEntiriesNumber = query.SpecialEntiriesNumber;
        }
        if(query.SpecialEntiriesDate){
            update.SpecialEntiriesDate = query.SpecialEntiriesDate;
        } 

        if(query.SpecialEntiriesDescription){
            update.SpecialEntiriesDescription = query.SpecialEntiriesDescription;
        } 

        if (req.file) {
            update.SpecialEntiriesFile = req.file.path;
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
            const data = await SpecialEntries.findOneAndUpdate(filter, update, {
                new: true
              });
            console.log('data updated ', data);
            successRes(res, data, 'SpecialEntries updated Successfully');
        } else {
            console.log('empty');
            throw 'Update value missing';
        }
    } catch (error) {
        console.log('catch update SpecialEntries updation', error);
        errorRes(res, error, "Error on SpecialEntries updation");
    }
    }