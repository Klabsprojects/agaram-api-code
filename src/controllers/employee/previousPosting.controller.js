const previousPosting = require('../../models/employee/previousPosting.model');
const login = require('../../models/login/login.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")
const whatsapp = require('../whatsapp/whatsapp.controller');
const employeeProfile = require('../../models/employee/employeeProfile.model');

// previousPosting creation
exports.addPreviousPosting = async (req, res) => {
    try {
        console.log('try create previousPosting', req.body);
        const query = req.body;
        // Check if an entry with the same droProfileId already exists
        const existingRecord = await previousPosting.findOne({ empProfileId: query.empProfileId });
        console.log('existingRecord ', existingRecord);
        if (existingRecord) {
            return res.status(400).send({ status: 400, message: "Previous posting already exists for this employee" });
        }
        const data = await previousPosting.create(query);
        successRes(res, data, 'previousPosting created Successfully');
    } catch (error) {
        console.log('catch create previousPosting', error);
        errorRes(res, error, "Error on creating previousPosting");
    }
}

// Get PreviousPosting
exports.getPreviousPosting = async (req, res) => {
        console.log('helo from PreviousPosting controller', req.query);
        try {
            let data = [];
            
            if(req.query.empProfileId){
                const query = { empProfileId: req.query.empProfileId }; // Corrected query structure

                console.log('Query:', query);

                data = await previousPosting.find(query)
                .exec();

                console.log(data, 'PreviousPosting listed else Successfully');

                if (data.length > 0) {
                    data = await Promise.all(data.map(async (item) => {
                        // Convert Mongoose document to plain JS object
                        item = item.toObject();
            
                        // Fetch related employeeProfile
                        const profile = await employeeProfile.findOne({ _id: item.empProfileId }).select(['fullName', 'batch', 'mobileNo1', 'employeeId']);
                        
                        // Replace empProfileId with populated data
                        item.empProfileId = profile;
                        return item;
                    }));
                }
                console.log('Data after population:', JSON.stringify(data, null, 2));
                console.log('data after ', data)
                successRes(res, data, 'PreviousPosting listed Successfully');
            }
            else if(req.query._id){
                const query = { _id: req.query._id }; // Corrected query structure

                console.log('Query:', query);

                data = await previousPosting.find(query)
                .exec();

                if (data.length > 0) {
                    data = await Promise.all(data.map(async (item) => {
                        // Convert Mongoose document to plain JS object
                        item = item.toObject();
            
                        // Fetch related employeeProfile
                        const profile = await employeeProfile.findOne({ _id: item.empProfileId }).select(['fullName', 'batch', 'mobileNo1', 'employeeId']);
                        
                        // Replace empProfileId with populated data
                        item.empProfileId = profile;
                        return item;
                    }));
                }
                console.log('Data after population:', JSON.stringify(data, null, 2));
                console.log(data, 'PreviousPosting listed else Successfully');
                successRes(res, data, 'PreviousPosting listed Successfully');
            }
            else
                {
                    data = await previousPosting.find()
                    
                    .populate({
                        path: 'submittedBy',
                        model: 'login', // Ensure the model name matches exactly
                        select: ['username', 'loginAs'] // Specify the fields you want to include from EmployeeProfile
                    })
                    .populate({
                        path: 'approvedBy',
                        model: 'login', // Ensure the model name matches exactly
                        select: ['username', 'loginAs'] // Specify the fields you want to include from EmployeeProfile
                    }) 
                    .populate({
                        path: 'empProfileId',
                        model: 'employeeProfile', // Ensure this model name is correct
                        select: ['fullName', 'batch', 'mobileNo1', 'employeeId'] // Fields to include
                    })
                    .exec();
                    console.log(data, 'previousPosting listed else Successfully');
                    successRes(res, data, 'previousPosting listed Successfully');
                }
        } catch (error) {
            console.log('error', error);
            errorRes(res, error, "Error on listing previousPosting");
        }
    }

    // previousPosting updation
    exports.updatePreviousPosting = async (req, res) => {
        try {
            console.log('try update PreviousPosting', req.body);
            const query = req.body;
            let filter;
            let update = {};
            update = req.body;
            if(Object.keys(req.body).length >0){
                if(query.id){
                    console.log('id coming');
                    console.log(query.id);
                    filter = {
                        _id : query.id
                    }
                }
                
            else{
                console.log('id not coming');
                throw 'pls provide id field';
            }
            }
            
            else{
                console.log('problem in input query');
                throw 'pls provideinput query';
            }
            
                
            console.log('update ', update);
            console.log('filter ', filter);
            // Check if the update object is empty or not
            if (Object.keys(update).length > 0) {
                console.log('value got');
                const data = await previousPosting.findOneAndUpdate(filter, update, {
                    new: true
                  });
                console.log('data updated ', data);
                successRes(res, data, 'data updated Successfully');
            } else {
                console.log('empty');
                throw 'Update value missing';
            }
        } catch (error) {
            console.log('catch update', error);
            errorRes(res, error, "Error on updation");
        }
        }