const dros = require('../../models/employee/dros.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")

// dros creation
exports.addDros = async (req, res) => {
    try {
        const query = req.body;
        if (req.file) {
            query.DroFile = req.file.path;
        } else {
            throw new Error('File upload failed: No file uploaded');
        }
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



    exports.deleteDRO = async (req, res) => {
        // console.log('Hello from delete DRO controller', req.params);
        try {
            let query = {};
            
            if (req.params.id) {
                // Delete by ID (assumes you are passing the ID in the URL params)
                query = { _id: req.params.id };
            } else {
                errorRes(res, error, "connot get Id");
            }
    
            const deletedCircular = await dros.findOneAndDelete(query);
    
            if (!deletedCircular) {
                return errorRes(res, null, 'DRO not found or already deleted');
            }
    
            successRes(res, deletedCircular, 'DRO deleted successfully');
        } catch (error) {
            console.log('Error', error);
            errorRes(res, error, "Error occurred while deleting the DRO");
        }
    }
    


    
    // dros updation
    exports.updateDRO = async (req, res) => {
        try {
            console.log('try update dros');
            const query = req.body;
            let filter;
            let update = {};
            if(query.DateOfUpload){
                update.DateOfUpload = query.DateOfUpload;
            }
    
            if (req.file) {
                update.DroFile = req.file.path;
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
                const data = await dros.findOneAndUpdate(filter, update, {
                    new: true
                  });
                console.log('data updated ', data);
                successRes(res, data, 'dros updated Successfully');
            } else {
                console.log('empty');
                throw 'Update value missing';
            }
        } catch (error) {
            console.log('catch update dros updation', error);
            errorRes(res, error, "Error on dros updation");
        }
        }