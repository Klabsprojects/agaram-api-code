const safAllocation = require('../../models/forms/safAllocation.model');
const block = require('../../models/forms/block.model');
const safApplication = require('../../models/forms/safApplication.model');
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
        if(req.body.dateOfAccomodation){
            if(req.body.dateOfAccomodation){
                const today = new Date();
                const dateOfAccomodation = new Date(req.body.dateOfAccomodation);
                const millisecondsInADay = 1000 * 60 * 60 * 24;
                const daysDifference = Math.floor((dateOfAccomodation - today) / millisecondsInADay);
    
                // Update waiting period count
                await updateWaitingPeriodCount(daysDifference);
                successRes(res, data, 'safAllocation created Successfully');
            }
        }
        
    } catch (error) {
        console.log('catch create safAllocation', error);
        errorRes(res, error, "Error on creating safAllocation");
    }
    }

// Function to update waiting period count
async function updateWaitingPeriodCount(daysDifference) {
    const applications = await safApplication.find().exec();
    applications.forEach(async (application) => {
        if (application.applicationStatus != 'closed') {
            const currentCount = application.waitingPeriod || 0;
            application.waitingPeriod = currentCount + daysDifference;
            application.applicationStatus = "alloted"
            await application.save();
        }
    });
}

// Get safAllocation
exports.getSafAllocation = async (req, res) => {
        console.log('helo from safAllocation controller', req.query);
        try {
            let query = {};
            let data;
            if(req.query){
                query.where = req.query;
                data = await safAllocation.find(req.query)
                .populate({
                    path: 'blockId',
                    //select: 'field1 field2', // Fields to select from the block collection
                })
                .populate({
                    path: 'applicationId',
                    model: 'safApplication', // Model of the application collection
                    //select: 'fieldA fieldB' // Fields to select from the application collection
                })  
                .exec();
            }
            else
                data = await safAllocation.find()
                .populate({
                    path: 'blockId',
                    //select: 'field1 field2', // Fields to select from the block collection
                })
                .populate({
                    path: 'applicationId',
                    model: 'safApplication', // Model of the application collection
                    //select: 'fieldA fieldB' // Fields to select from the application collection
                })            
                .exec();
            successRes(res, data, 'safAllocation listed Successfully');
        } catch (error) {
            console.log('error', error);
            errorRes(res, error, "Error on listing safAllocation");
        }
    }

    // safAllocation1 updation
/*exports.updateSafAllocation1 = async (req, res) => {
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
                    //blockId: null
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
                    //blockId: null
                    dateOfAccomodation: Date,
	                dateOfVacating: Date,
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
*/

// safAllocation updation
exports.updateSafAllocation = async (req, res) => {
    try {
        console.log('try update safAllocation', req.body);
        const query = req.body;
        let updateBlock = {};
        let filterBlock;
        let updateAlloc = {};
        let filterAlloc;
        let updateApply = {};
        let filterApply;
        if(query.dateOfVacating && query.blockId && query.id && query.employeeProfileId){
            updateAlloc = {
                dateOfVacating : query.dateOfVacating
                }
            filterAlloc = {
                _id : query.id
                }
            
            updateBlock = {
                allocationStatus : false,
                allocationTo : "null"
                }
            filterBlock = {
                _id : query.blockId
                }
            
            updateApply = {
                applicationStatus : "closed"
                }
            filterApply = {
                employeeProfileId : query.employeeProfileId,
                applicationStatus : "open"
            }
        }
        else throw 'allocstatus not coming';
        console.log('updateAlloc ', updateAlloc);
        console.log('filterAlloc ', filterAlloc);
        console.log('updateBlock ', updateBlock);
        console.log('filterBlock ', filterBlock);
        // Check if the update object is empty or not
        if (Object.keys(updateAlloc).length > 0 && Object.keys(updateBlock).length > 0 
        && Object.keys(updateApply).length > 0) {
            console.log('value got');
            const data = await safAllocation.findOneAndUpdate(filterAlloc, updateAlloc, {
                new: true
            });
            const data1 = await block.findOneAndUpdate(filterBlock, updateBlock, {
                new: true
            });
            const data2 = await safApplication.findOneAndUpdate(filterApply, updateApply, {
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