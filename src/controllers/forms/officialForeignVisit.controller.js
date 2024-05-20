const foreignVisit = require('../../models/forms/officialForeignVisit.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")

// Degree creation
exports.addVisit = async (req, res) => {
    try {
        console.log('try create foreignVisit');
        const query = req.body;
        console.log(query);
        console.log('REQ.FILE => ',req.file);
        /*if (req.file) {
            console.log('REQ.FILE INSIDE => ',req.file);
            query.politicalClearance = req.file.path;
            console.log('Uploaded file path:', req.file.path);
        } else {
            throw new Error('File upload failed: No file uploaded');
        }*/
        if (req.files && req.files['politicalClearance'] && req.files['politicalClearance'].length > 0) {
            // If politicalClearance file exists
            query.politicalClearance = req.files['politicalClearance'][0].path; // Assuming only one file is uploaded
            console.log('politicalClearance resume file path:', req.files['politicalClearance'][0].path);
        } else {
            throw new Error('politicalClearance upload failed: No resume file uploaded');
        }
        
        if (req.files && req.files['fcraClearance'] && req.files['fcraClearance'].length > 0) {
            // If fcraClearance file exists
            query.fcraClearance = req.files['fcraClearance'][0].path; // Assuming only one file is uploaded
            console.log('Uploaded fcraClearance file path:', req.files['fcraClearance'][0].path);
        } else {
            throw new Error('fcraClearance upload failed: No certificate file uploaded');
        }

        if (req.files && req.files['orderFile'] && req.files['orderFile'].length > 0) {
            // If orderFile file exists
            query.orderFile = req.files['orderFile'][0].path; // Assuming only one file is uploaded
            console.log('Uploaded orderFile file path:', req.files['orderFile'][0].path);
        } else {
            throw new Error('orderFile upload failed: No certificate file uploaded');
        }
        
        const data = await foreignVisit.create(query);
        successRes(res, data, 'foreignVisit created Successfully');
    } catch (error) {
        console.log('catch create foreignVisit');
        if (req.fileValidationError) {
            console.log(req.fileValidationError);
            throw req.fileValidationError;
        }
        errorRes(res, error, "Error on creating foreignVisit");
    }
    }

// Get foreignVisit
exports.getVisit = async (req, res) => {
        console.log('helo from foreignVisit controller', req.query);
        try {
            let query = {};
            let data;
            if(req.query){
                query.where = req.query;
                data = await foreignVisit.find(req.query).exec();
            }
            else
                data = await foreignVisit.find();
            //res.json(data);
            successRes(res, data, 'foreignVisit listed Successfully');
        } catch (error) {
            console.log('error', error);
            //res.json(error);
            errorRes(res, error, "Error on listing foreignVisit");
        }
    }