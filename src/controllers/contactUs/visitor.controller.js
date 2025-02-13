const visitor = require('../../models/contactUs/visitor.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")

// POST or PUT API to add/update visitor entry
exports.addOrUpdateVisitor = async (req, res) => {
    try {
        const { count } = req.body; // Get count from request body
        const currentDate = new Date();
        
        // Check if a visitor entry already exists
        const existingEntry = await visitor.findOne({});
        
        if (!existingEntry) {
            // If no entry exists, create one with count = 1
            const newEntry = await visitor.create({
                visitUpdateDate: currentDate,
                count: 1,
                createdAt: currentDate
            });
            successRes(res, newEntry, 'Visitor entry created with count = 1');
        } else {
            // If an entry exists, update the count if provided
            if (count !== undefined) {
                existingEntry.count = count;
                existingEntry.visitUpdateDate = currentDate;
                await existingEntry.save();
                successRes(res, existingEntry, 'Visitor count updated successfully');
            } else {
                successRes(res, existingEntry, 'No count provided, nothing updated');
            }
        }
    } catch (error) {
        console.log('Error adding/updating visitor:', error);
        errorRes(res, error, 'Error adding/updating visitor');
    }
};

// GET API to get the latest visitor entry by visitUpdateDate
exports.getLatestVisitor = async (req, res) => {
    try {
        const latestEntry = await visitor.findOne({}).sort({ visitUpdateDate: -1 });
        
        if (!latestEntry) {
            return successRes(res, null, 'No visitor entries found');
        }

        successRes(res, latestEntry, 'Latest visitor entry fetched successfully');
    } catch (error) {
        console.log('Error fetching latest visitor entry:', error);
        errorRes(res, error, 'Error fetching latest visitor entry');
    }
};

