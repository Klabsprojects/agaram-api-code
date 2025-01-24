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
