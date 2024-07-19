const education = require('../../models/forms/education.model');
const employeeProfile = require('../../models/employee/employeeProfile.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")
const whatsapp = require('../whatsapp/whatsapp.controller');

// education creation
exports.addEducation = async (req, res) => {
    try {
        console.log('try create education', req.body);
        const query = req.body;
        let data;
        console.log('query ', query);
        const { officerName, department, designation, orderType, orderNo, orderFor, dateOfOrder, remarks, degreeData } = req.body;
        console.log('Uploaded file path:', req.file.path);
        if (req.file) {
            query.orderFile = req.file.path;
            console.log('Uploaded file path:', req.file.path);
        } else {
            throw new Error('File upload failed: No file uploaded');
        }
        //const data = await education.create(query);
            // Check if degreeData exists and is an array
            if (degreeData && Array.isArray(degreeData)) {
                data = await education.create(query);
                console.log('data ==> ', data);
                for(let dataDegree of query.degreeData){
                    const newDegreeData = {
                        courseLevel: dataDegree.courseLevel,
                        specialisation: dataDegree.specialisation,
                        instituteName: dataDegree.instituteName,
                        locationState: dataDegree.locationState,
                        locationCountry: dataDegree.locationCountry,
                        durationOfCourse: dataDegree.durationOfCourse,
                        fund: dataDegree.fund,
                        fees: dataDegree.fees,
                        courseCompletedYear: dataDegree.courseCompletedYear,
                        courseCompletedDate: dataDegree.courseCompletedDate,
                        addedBy: "educationForm"
                      };
                    const result = await employeeProfile.updateOne(
                        { _id: query.employeeProfileId }, // Specify the document by _id
                        { $push: { degreeData: newDegreeData } } // Use $push to add new degree data
                      );
                      let reqest = {}
                      reqest.body = {
                        phone: req.body.phone,
                        module: req.body.module,
                        date: req.body.dateOfOrder,
                        fileName: req.file.filename
                    }
                    const goSent = await whatsapp.sendWhatsapp(reqest, res);
                      console.log('Update successful:', result, 'document(s) updated.');
                      
                }
                successRes(res, data, 'Education records created successfully');
                
            } else {
                throw new Error('Invalid degreeData: Expected an array');
            }
    } catch (error) {
        console.log('catch create education', error);
        errorRes(res, error, "Error on creating education");
    }
    }

// Get education
exports.getEducation = async (req, res) => {
        console.log('helo from education controller', req.query);
        try {
            let query = {};
            let data;
            if(req.query){
                query.where = req.query;
                //data = await education.find(req.query).exec();
                data = await education.find(req.query)
                .populate({
                    path: 'employeeProfileId',
                    model: 'employeeProfile', // Model of the application collection
                    select: 'batch' // Fields to select from the application collection
                })  
                .exec();
            }
            else
                //data = await education.find();
                data = await education.find()
                .populate({
                    path: 'employeeProfileId',
                    model: 'employeeProfile', // Model of the application collection
                    select: 'batch' // Fields to select from the application collection
                })  
                .exec();
            successRes(res, data, 'education listed Successfully');
        } catch (error) {
            console.log('error', error);
            errorRes(res, error, "Error on listing education");
        }
    }

    exports.updateEducation = async (req, res) => {
        try {
            console.log('try update block', req.body);
            const query = req.body;
            if(req.file){
                req.body.orderFile = req.file.path
                query.orderFile = req.file.path
                console.log('Uploaded file path:', req.file.path);
            }
            let filter;
            let update = {};
            update = req.body;
            if(query.id){
                console.log('id coming');
                console.log(query.id);
                filter = {
                    _id : query.id
                }
            }
            else{
                console.log('id coming');
                throw 'pls provide id field';
            }
                
            console.log('update ', update);
            console.log('filter ', filter);
            // Check if the update object is empty or not
            if (Object.keys(update).length > 0) {
                console.log('value got');
                const data = await education.findOneAndUpdate(filter, update, {
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
    
        exports.updateEducationApprovalStatus = async (req, res) => {
            try {
                console.log('try update block', req.body);
                const query = req.body;
                let update = {};
                const currentDate = new Date();
                if(query.approvedBy){
                    update.approvedBy = query.approvedBy;
                    update.approvalStatus = true;
                    update.approvedDate = currentDate;
                } 
                else    
                    throw 'Pls provide inputs';
                let filter;
                if(query.id){
                    console.log('id coming');
                    console.log(query.id);
                    filter = {
                        _id : query.id
                    }
                }
                else{
                    console.log('id coming');
                    throw 'pls provide id field';
                }
                    
                console.log('update ', update);
                console.log('filter ', filter);
                // Check if the update object is empty or not
                if (Object.keys(update).length > 0) {
                    console.log('value got');
                    const data = await education.findOneAndUpdate(filter, update, {
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
                errorRes(res, error, error);
            }
            }