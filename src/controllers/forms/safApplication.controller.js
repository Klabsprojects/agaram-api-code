const safApplication = require('../../models/forms/safApplication.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")
const employeeProfile = require('../../models/employee/employeeProfile.model');

// safApplication creation
exports.addSafApplication = async (req, res) => {
    try {
        console.log('try create safApplication', req.body);
        const query = req.body;
         // Check if an application already exists for the given employee
         const existingApplication = await safApplication.findOne({ 
            employeeProfileId: query.employeeProfileId,
            applicationStatus: { $in: ["open", "alloted"] } });
            //applicationStatus: "open" });
        console.log('exist ', existingApplication);
         if (existingApplication) {
             // If an application exists, return the application info
             successRes(res, existingApplication, 'Application already exists for this employee');
         } else {
             // If no application exists, create a new application
            const data = await safApplication.create(query);
            successRes(res, data, 'safApplication created Successfully');
         }
    } catch (error) {
        console.log('catch create safApplication', error);
        errorRes(res, error, "Error on creating safApplication");
    }
    }

// Get safApplication
exports.getSafApplication = async (req, res) => {
        console.log('helo from safApplication controller', req.query);
        try {
            let query = {};
            let data;
            if(req.query){
                query.where = req.query;
                //data = await education.find(req.query).exec();
                data = await safApplication.find(req.query)
                .populate({
                    path: 'employeeProfileId',
                    model: 'employeeProfile', // Model of the application collection
                    select: 'batch' // Fields to select from the application collection
                })  
                .exec();
            }
            else
                //data = await education.find();
                data = await safApplication.find()
                .populate({
                    path: 'employeeProfileId',
                    model: 'employeeProfile', // Model of the application collection
                    select: 'batch' // Fields to select from the application collection
                })  
                .exec();
            successRes(res, data, 'safApplication listed Successfully');
        } catch (error) {
            console.log('error', error);
            errorRes(res, error, "Error on listing safApplication");
        }
    }

// safApplication updation
exports.updateSafApplication = async (req, res) => {
    try {
        console.log('try update safApplication');
        const query = req.body;
        let update = {};
        let filter;
        if(query.waitingPeriod){
            update.waitingPeriod = query.waitingPeriod;
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
            const data = await safApplication.findOneAndUpdate(filter, update, {
                new: true
            });
            console.log('data updated ', data);
            successRes(res, data, 'safApplication waiting period updated Successfully');
        } else {
            console.log('empty');
            throw 'Update value missing';
        }
    } catch (error) {
        console.log('catch update safApplication waiting period updation', error);
        errorRes(res, error, "Error on safApplication waiting period updation");
    }
    }