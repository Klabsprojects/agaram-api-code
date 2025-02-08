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
    