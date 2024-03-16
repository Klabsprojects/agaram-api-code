const designations = require('../../models/categories/designation.model');

// Designations creation
exports.addDesignations = async (req, res) => {
    try {
        console.log('try create departments');
        const query = req.body;
        const data = await designations.create(query);
        res.json(data);
    } catch (error) {
        console.log('catch create departments');
        res.json(error);
    }
    }

// Get Designations
exports.getDesignations = async (req, res) => {
        console.log('helo from department controller', req.query);
        try {
            let query = {};
            let data;
            if(req.query){
                query.where = req.query;
                data = await designations.find(req.query).exec();
            }
            else
                data = await designations.find();
            res.json(data);
        } catch (error) {
            console.log('error', error);
            res.json(error);
        }
    }