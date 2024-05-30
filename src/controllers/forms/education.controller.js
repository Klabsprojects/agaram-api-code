const education = require('../../models/forms/education.model');
const employeeProfile = require('../../models/employee/employeeProfile.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")

// education creation
exports.addEducation = async (req, res) => {
    try {
        console.log('try create education', req.body);
        const query = req.body;
        //console.log('Uploaded file path:', req.file.path);
        /*if (req.file) {
            query.orderFile = req.file.path;
            console.log('Uploaded file path:', req.file.path);
        } else {
            throw new Error('File upload failed: No file uploaded');
        }*/
        const data = await education.create(query);
        for(let data of query.degreeData){
            const newDegreeData = {
                courseLevel: data.courseLevel,
                specialisation: data.specialisation,
                instituteName: data.instituteName,
                locationState: data.locationState,
                locationCountry: data.locationCountry,
                durationOfCourse: data.durationOfCourse,
                fund: data.fund,
                fees: data.fees,
                courseCompletedYear: data.courseCompletedYear,
                courseCompletedDate: data.courseCompletedDate,
                addedBy: "educationForm"
              };
            const result = await employeeProfile.updateOne(
                { _id: query.employeeProfileId }, // Specify the document by _id
                { $push: { degreeData: newDegreeData } } // Use $push to add new degree data
              );
          
              console.log('Update successful:', result.modifiedCount, 'document(s) updated.');
        }
        
        successRes(res, data, 'education created Successfully');
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