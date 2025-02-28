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
exports.getCategoryTypesOld = async (req, res) => {
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

// Get getCategoryTypes
exports.getCategoryTypes = async (req, res) => {
    console.log('helo from getCategoryTypes controller', req.query);
    try {
        let query = {};
        let data;
        query.where = req.query; // Although it's not being used in the aggregation pipeline directly

        // Perform the aggregation using async/await
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
        ]);

        console.log('Categories:', data);
        successRes(res, data, 'Category types listed Successfully');
    } catch (error) {
        console.log('error', error);
        const message = error.message ? error.message : ERRORS.LISTED;
        errorRes(res, error, message);
    }
};


// Update Category API
exports.updateCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const updateData = req.body; // The fields to update

        console.log('Updating category:', categoryId, updateData);

        const updatedCategory = await categories.findByIdAndUpdate(
            categoryId,
            { $set: updateData },
            { new: true, runValidators: true } // Returns updated document & validates
        );

        if (!updatedCategory) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        successRes(res, updatedCategory, "Category updated successfully");
    } catch (error) {
        console.error("Error updating category:", error);
        errorRes(res, error, "Error updating category");
    }
};
