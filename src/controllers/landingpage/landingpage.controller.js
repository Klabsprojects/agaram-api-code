const employeeProfile = require('../../models/employee/employeeProfile.model');
const categories = require('../../models/categories/categories.model');
const empProfile = require('../employee/employeeProfile.controller');
const { successRes, errorRes } = require("../../middlewares/response.middleware");
const { ObjectId, ObjectID } = require('mongodb');
const employeeProfileController = require('../../controllers/employee/employeeProfile.controller')


exports.GetCardDetails = async (req, res) => {
    try {
        let query = {};
        let TotalEmpCount = 0;
        let ActiveEmpCount = 0;
        let RetiredEmpCount = 0;
        let DeputationEmpCount = 0;
        let request = {}

        console.log(DeputationEmpCount,'deputation emp count brfore')
        

        const data = await employeeProfile.find(query).exec();
        TotalEmpCount = data.length;

        const data1 = await employeeProfile.find({ serviceStatus: '65f43649a4a01c1cbbd6c9d6' }).exec();
        ActiveEmpCount = data1.length;

        const data2 = await employeeProfile.find({ serviceStatus: '65f43649a4a01c1cbbd6c9d7' }).exec();
        RetiredEmpCount = data2.length;

        //const data3 = await employeeProfileController.getByDeputation(request);         
        const data3 = await employeeProfile.find({ serviceStatus: '65f43b3da4a01c1cbbd6ca05' }).exec();
        DeputationEmpCount = data3;

        console.log(DeputationEmpCount,'deputation emp count after')

        return res.status(200).json({ TotalEmpCount, ActiveEmpCount, RetiredEmpCount , DeputationEmpCount });

    } catch (error) {
        console.error("Error fetching count:", error);
        return res.status(500).json({ message: "Error fetching count", error });
    }
};


exports.getWallOfHouner = async (req, res) => {
    console.log('Starting getCurrentPosting API...', req.query);
  
    try {
      const { designationId } = req.query; // Get designationId from the request query
      if (!designationId) {
        return errorRes(res, null, 'Designation ID is required');
      }
  
      const resultData = [];
  
      // Step 1: Find distinct employeeProfile IDs with the given designation ID
      const employeeUpdateDocs = await empProfile
        .find({ 'transferOrPostingEmployeesList.toDesignationId': designationId })
        .select('transferOrPostingEmployeesList')
        .lean();
  
      const distinctEmployeeProfileIds = new Set();
  
      // Extract unique employeeProfile IDs
      employeeUpdateDocs.forEach((doc) => {
        doc.transferOrPostingEmployeesList.forEach((transfer) => {
          if (transfer.toDesignationId.toString() === designationId) {
            distinctEmployeeProfileIds.add(transfer.empProfileId._id.toString());
          }
        });
      });
  
      console.log('Distinct Employee Profile IDs:', Array.from(distinctEmployeeProfileIds));
  
      // Step 2: Fetch employee details from employeeProfile for the distinct IDs
      const employeeProfiles = await employeeProfile
        .find({ _id: { $in: Array.from(distinctEmployeeProfileIds) } })
        .lean();
  
      for (const employee of employeeProfiles) {
        const stateInfo = await state.findById(employee.state).select(['stateName']);
        const dataAll = {
          fullName: employee.fullName,
          personalEmail: employee.personalEmail,
          dateOfBirth: employee.dateOfBirth,
          dateOfJoining: employee.dateOfJoining,
          stateInformation: stateInfo,
          officeEmail: employee.officeEmail,
          mobileNo1: employee.mobileNo1,
          mobileNo2: employee.mobileNo2,
          mobileNo3: employee.mobileNo3,
          addressLine: employee.addressLine,
          city: employee.city,
          pincode: employee.pincode,
        };
  
        resultData.push(dataAll);
      }
  
      console.log('Result Data:', resultData);
      return successRes(res, resultData, 'Employee details fetched successfully');
    } catch (error) {
      console.error('Error in getCurrentPosting:', error);
      return errorRes(res, error, 'Failed to fetch employee details');
    }
  };
  