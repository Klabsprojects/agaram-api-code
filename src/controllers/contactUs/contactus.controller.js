const contactus = require('../../models/contactUs/contactus.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")

// contactus creation
exports.addContactus = async (req, res) => {
    try {
        // console.log('try create Contactus', req.body);
        const query = req.body;
        const data = await contactus.create(query);
        successRes(res, data, 'contactus created Successfully');
    } catch (error) {
        console.log('catch create contactus', error);
        errorRes(res, error, "Error on creating contactus");
    }
    }

// Get Contactus
exports.getContactus = async (req, res) => {
        console.log('helo from Contactus controller', req.query);
        try {
            let data;
            data = await contactus.find({}).sort({ createdAt: -1 });;
            successRes(res, data, 'contactus listed Successfully');
        } catch (error) {
            console.log('error', error);
            errorRes(res, error, "Error on listing contactus");
        }
}

// GET API to get count of isRead == true
exports.getReadCount = async (req, res) => {
    try {
        const count = await contactus.countDocuments({ IsRead: true });
        successRes(res, count, 'Count of read contactus entries fetched successfully');
    } catch (error) {
        console.log('Error fetching read count:', error);
        errorRes(res, error, 'Error fetching read count');
    }
};

// PUT API to update isRead = true by _id
exports.markAsRead = async (req, res) => {
    try {
        console.log('req.params ', req.params);
        const { id } = req.params; // Get _id from URL parameter
        const updatedData = await contactus.findByIdAndUpdate(
            id,
            { IsRead: true },
            { new: true } // Return the updated document
        );

        if (!updatedData) {
            return errorRes(res, null, 'No contactus entry found with this ID');
        }

        successRes(res, updatedData, 'contactus marked as read successfully');
    } catch (error) {
        console.log('Error updating isRead:', error);
        errorRes(res, error, 'Error updating isRead');
    }
};
