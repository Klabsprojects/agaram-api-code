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
                data = await safAllocation.find(req.query).populate('blockId').exec();
            }
            else
                data = await safAllocation.find().populate('blockId').exec();
            successRes(res, data, 'safAllocation listed Successfully');
        } catch (error) {
            console.log('error', error);
            errorRes(res, error, "Error on listing safAllocation");
        }
    }

    // safAllocation updation
exports.updateSafAllocation = async (req, res) => {
    try {
        console.log('try update safAllocation', req.body);
        const query = req.body;
        let updateBlock = {};
        let filterBlock;
        let updateAlloc = {};
        let filterAlloc;
        if(query.allocationStatus && query.allocationTo){
            if(query.allocationStatus == "false"){
                console.log('false');
                updateAlloc = {
                    blockId: null
                }
                updateBlock = {
                    allocationStatus : false,
                    allocationTo : null
                }
            }else
            {
                updateBlock = {
                    allocationStatus : query.allocationStatus,
                    allocationTo : query.allocationTo
                }
            }
        }
        else throw 'allocstatus not coming';
        if(query.blockId){
            if(query.allocationStatus == "false"){
                console.log('false');
                updateAlloc = {
                    blockId: null
                }
                updateBlock = {
                    allocationStatus : false,
                    allocationTo : null
                }
                filterBlock = {
                    _id : query.blockId
                }
            }else
            {
            filterBlock = {
                _id : query.blockId
            }
            updateAlloc = {
                blockId: query.blockId
            }
        }
        }

        if(query.id){
            filterAlloc = {
                _id : query.id
            }
        }
        else
            throw 'pls provide id field';
        console.log('updateAlloc ', updateAlloc);
        console.log('filterAlloc ', filterAlloc);
        console.log('updateBlock ', updateBlock);
        console.log('filterBlock ', filterBlock);
        // Check if the update object is empty or not
        if (Object.keys(updateAlloc).length > 0 && Object.keys(updateBlock).length > 0) {
            console.log('value got');
            const data = await safAllocation.findOneAndUpdate(filterAlloc, updateAlloc, {
                new: true
            });
            const data1 = await block.findOneAndUpdate(filterBlock, updateBlock, {
                new: true
            });
            console.log('data updated ', data);
            successRes(res, data, 'safAllocation updated Successfully');
        } else {
            console.log('empty');
            throw 'Update value missing';
        }
    } catch (error) {
        console.log('catch update safAllocation updation', error);
        errorRes(res, error, error);
    }
    }