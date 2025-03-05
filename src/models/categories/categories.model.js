const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categoriesSchema = new Schema({
    category_type: String,
    category_name: String,
    category_code: String,
	payscale: String,
	courseType: {
        type: Schema.Types.ObjectId,   // ObjectId type for referencing
        ref: 'categories',             // Referring to the same 'categories' model
        required: false               // This can be optional, depending on your use case
    },
	stateType: {
        type: Schema.Types.ObjectId,   // ObjectId type for referencing
        ref: 'categories',             // Referring to the same 'categories' model
        required: false               // This can be optional, depending on your use case
    },
	createdAt: {
		type: Date, 
		default: Date.now
	},
});

module.exports = mongoose.model('categories', categoriesSchema);