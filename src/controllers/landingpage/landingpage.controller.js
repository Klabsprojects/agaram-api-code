const employeeProfile = require('../../models/employee/employeeProfile.model');
const categories = require('../../models/categories/categories.model');
const empProfile = require('../employee/employeeProfile.controller');
const { successRes, errorRes } = require("../../middlewares/response.middleware");
const { ObjectId, ObjectID } = require('mongodb');


exports.GetCardDetails = async (req, res) => {
    try {
        let query = {};
        let TotalEmpCount = 0;
        let ActiveEmpCount = 0;
        let RetiredEmpCount = 0;
        let DeputationEmpCount = 0;
        

        const data = await employeeProfile.find(query).exec();
        TotalEmpCount = data.length;

        const data1 = await employeeProfile.find({ serviceStatus: '65f43649a4a01c1cbbd6c9d6' }).exec();
        ActiveEmpCount = data1.length;

        const data2 = await employeeProfile.find({ serviceStatus: '65f43649a4a01c1cbbd6c9d7' }).exec();
        RetiredEmpCount = data2.length;

        return res.status(200).json({ TotalEmpCount, ActiveEmpCount, RetiredEmpCount , DeputationEmpCount });

    } catch (error) {
        console.error("Error fetching active employees count:", error);
        return res.status(500).json({ message: "Error fetching active employees count", error });
    }
};