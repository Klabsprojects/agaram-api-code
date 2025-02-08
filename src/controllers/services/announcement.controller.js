const announcement = require('../../models/services/announcement.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware");
const { Op } = require("sequelize");

// announcement creation
exports.addAnnouncement = async (req, res) => {
    try {
        console.log('try create announcement', req.body);
        const query = req.body;
        const data = await announcement.create(query);
        successRes(res, data, 'announcement created Successfully');
    } catch (error) {
        console.log('catch create announcement', error);
        errorRes(res, error, "Error on creating announcement");
    }
    }

    exports.getRecentAnnouncements = async (req, res) => {
        try {
            // Calculate the date 3 months ago
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
            // Fetch announcements from the last 3 months
            const announcements = await announcement.find({
                announcementDate: { $gte: threeMonthsAgo }
            }).sort({ announcementDate: -1 }); // Sort by latest first
    
            successRes(res, announcements, 'Announcements from the last 3 months fetched successfully');
        } catch (error) {
            console.log('Error fetching announcements:', error);
            errorRes(res, error, "Error fetching recent announcements");
        }
    };

exports.updateAnnouncement = async (req, res) => {
    try {
        const id  = req.params.id; // Get the announcement ID from URL params
        const updateData = req.body; // Get updated data from request body
        console.log(req.params.id, req.body);
        // Find and update the announcement
        const updatedAnnouncement = await announcement.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true, runValidators: true } // Return updated doc & validate fields
        );

        // If no announcement found
        if (!updatedAnnouncement) {
            return errorRes(res, null, "Announcement not found", 404);
        }

        successRes(res, updatedAnnouncement, "Announcement updated successfully");
    } catch (error) {
        console.log("Error updating announcement:", error);
        errorRes(res, error, "Error updating announcement");
    }
};

exports.deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params; // Get the announcement ID from URL params

        console.log("Deleting Announcement ID:", id); // Debugging log

        // Find and delete the announcement
        const deletedAnnouncement = await announcement.findByIdAndDelete(id);

        // If no announcement found
        if (!deletedAnnouncement) {
            return res.status(404).json({ success: false, message: "Announcement not found" });
        }

        res.status(200).json({ success: true, message: "Announcement deleted successfully" });
    } catch (error) {
        console.log("Error deleting announcement:", error);
        res.status(500).json({ success: false, message: "Error deleting announcement" });
    }
};
