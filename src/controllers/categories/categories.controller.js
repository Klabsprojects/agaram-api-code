const categories = require('../../models/categories/categories.model');

// Categories creation
exports.addCategories = async (req, res) => {
    try {
        console.log('try create categories');
        const query = req.body;
        const data = await categories.create(query);
        res.json(data);
    } catch (error) {
        console.log('catch create categories');
        res.json(error);
    }
    }

// Get Categories
exports.getCategories = async (req, res) => {
        console.log('helo from categories controller', req.query);
        try {
            let query = {};
            let data;
            if(req.query){
                query.where = req.query;
                data = await categories.find(req.query).exec();
            }
            else
                data = await categories.find();
            res.json(data);
        } catch (error) {
            console.log('error', error);
            res.json(error);
        }
    }