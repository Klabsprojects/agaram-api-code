const dros = require('../../models/employee/dros.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")

// dros creation
exports.addDros = async (req, res) => {
    try {
        // console.log('try create circular', req.body);
        const query = req.body;
        const data = await dros.create(query);
        successRes(res, data, 'dros created Successfully');
    } catch (error) {
        console.log('catch create dros', error);
        errorRes(res, error, "Error on creating dros");
    }
    }

// Get dros
exports.getDros = async (req, res) => {
    try {
        let query = {};
        let data;
        if (req.query) {
            query.where = req.query;
            data = await dros.find(req.query).sort({ createdAt: -1 }).exec(); // Sort by createdAt desc
        } else {
            data = await dros.find().sort({ createdAt: -1 }); // Sort by createdAt desc
        }
        successRes(res, data, 'Dros listed successfully');
    } catch (error) {
        console.log('error', error);
        errorRes(res, error, 'Error on listing dros');
    }
};

exports.getDrosCountByDate = async (req, res) => {
    try {
        const data = await dros.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, // Group by date
                    count: { $sum: 1 }, // Count the number of records
                },
            },
            { $sort: { _id: -1 } }, // Sort by date in descending order
        ]);
        successRes(res, data, 'Dros count grouped by date retrieved successfully');
    } catch (error) {
        console.log('error', error);
        errorRes(res, error, 'Error on retrieving dros count grouped by date');
    }
};

