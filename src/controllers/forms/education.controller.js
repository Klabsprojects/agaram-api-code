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
                data = await education.find(req.query).exec();
            }
            else
                data = await education.find();
            successRes(res, data, 'education listed Successfully');
        } catch (error) {
            console.log('error', error);
            errorRes(res, error, "Error on listing education");
        }
    }