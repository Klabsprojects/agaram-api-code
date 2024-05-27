const safAllocation = require('../../models/forms/safAllocation.model');
const block = require('../../models/forms/block.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")

// safAllocation creation
exports.addSafAllocation = async (req, res) => {
    try {
        console.log('try create safAllocation', req.body);
        const query = req.body;
        if (req.file) {
            query.orderFile = req.file.path;
            console.log('Uploaded file path:', req.file.path);
        } else {
            throw new Error('File upload failed: No file uploaded');
        }
        const data = await safAllocation.create(query);

        if(req.body.blockId && Object.keys(data).length > 0)
            await block.updateOne({ _id: req.body.blockId }, { $set: { allocationStatus: true, allocationTo: data.employeeProfileId } });

        successRes(res, data, 'safAllocation created Successfully');
    } catch (error) {
        console.log('catch create safAllocation', error);
        errorRes(res, error, "Error on creating safAllocation");
    }
    }

// Get safAllocation
exports.getSafAllocation = async (req, res) => {
        console.log('helo from safAllocation controller', req.query);
        try {
            let query = {};
            let data;
            if(req.query){
                query.where = req.query;
                data = await safAllocation.find(req.query).exec();
            }
            else
                data = await safAllocation.find();
            successRes(res, data, 'safAllocation listed Successfully');
        } catch (error) {
            console.log('error', error);
            errorRes(res, error, "Error on listing safAllocation");
        }
    }
