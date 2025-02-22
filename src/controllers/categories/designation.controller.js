const designations = require('../../models/categories/designation.model');
//const { successRes, errorRes } = require("../../middlewares/response.middleware")
const { successRes, errorRes } = require("../../middlewares/response.middleware")
const {  ERRORS, SUCCESS, Op } = require("../../helpers/index.helper");
// Designations creation
exports.addDesignations = async (req, res) => {
    try {
        console.log('try create departments');
        const query = req.body;
        const data = await designations.create(query);
        //res.json(data);
        successRes(res, data, 'Designation registered Successfully');
    } catch (error) {
        console.log('catch create departments');
        //res.json(error);
        const message = error.message ? error.message : ERRORS.CREATED;
        errorRes(res, error, message);
    }
    }

// Get Designations
exports.getDesignations = async (req, res) => {
        console.log('helo from department controller', req.query);
        try {
            let query = {};
            let data;
            if(req.query){
                query.where = req.query;
                data = await designations.find(req.query).exec();
            }
            else
                data = await designations.find();
            //res.json(data);
            successRes(res, data, 'Designation listed Successfully');
        } catch (error) {
            console.log('error', error);
            //res.json(error);
            const message = error.message ? error.message : ERRORS.LISTED;
            errorRes(res, error, message);
        }
    }

exports.updateDesignation = async (req, res) => {
    console.log('Hello from department update controller', req.query);

    try {
        // Get the data to update from the request body
        const { category_code, designation_name } = req.body;
        
        // If neither category_code nor designation_name is provided, return a 400 error
        if (!category_code && !designation_name) {
            return res.status(400).json({ message: 'At least one of category_code or designation_name is required to update' });
        }

        // Get the designation _id from the query string
        const designationId = req.query._id;
        
        if (!designationId) {
            return res.status(400).json({ message: 'Designation ID (_id) is required in the query string' });
        }

        // Build an update object based on what fields are provided
        const updateData = {};
        if (category_code) {
            updateData.category_code = category_code;
        }
        if (designation_name) {
            updateData.designation_name = designation_name;
        }

        // Update the Designation by _id
        const updatedDesignation = await designations.findByIdAndUpdate(
            designationId,
            updateData,
            { new: true } // Ensure the updated Designation is returned
        );

        if (!updatedDesignation) {
            return res.status(404).json({ message: 'Designation not found' });
        }

        // Return the updated Designation
        //res.status(200).json(updatedDesignation);
        successRes(res, updatedDesignation, 'Designation updated Successfully');

    } catch (error) {
        console.log('Error:', error);
        const message = error.message ? error.message : ERRORS.LISTED;
        errorRes(res, error, message);
    }
};