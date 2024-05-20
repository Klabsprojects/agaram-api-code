const categories = require('../../models/categories/categories.model');

//const { successRes, errorRes } = require("../../middlewares/response.middleware")
const { successRes, errorRes } = require("../../middlewares/response.middleware")
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

// Get getCategoryTypes
exports.getCategoryTypes = async (req, res) => {
    console.log('helo from getCategoryTypes controller', req.query);
    try {
        let query = {};
        let data;
            query.where = req.query;
            data = await categories.aggregate([
                {
                    $group: {
                        _id: '$category_type'
                    }
                },
                {
                    $project: {
                        _id: 0, // Exclude the default _id field
                        category_type: '$_id', // Rename _id field to categoryName
                        count: 1 // Include the count field
                    }
                }
            ]).exec((err, categories) => {
                if (err) {
                    console.error('Error:', err);
                    throw err;
                }
                console.log('Categories:', categories);
                //res.json(categories);
                successRes(res, categories, 'Category types listed Successfully');
            });
    } catch (error) {
        console.log('error', error);
        //res.json(error);
        const message = error.message ? error.message : ERRORS.LISTED;
        errorRes(res, error, message);
    }
}