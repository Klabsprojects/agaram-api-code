const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categoriesSchema = new Schema({
    category_type: String,
      order_for: String,
      order_for_code: String,
      post_type: String,
      post_code: String,
      suspension_status: String,
      suspension_status_code: String,
      training_type: String,
      training_code: String,
      promotion_grade: String,
      promotion_grade_code: String, 
      posting_in: String,
      posting_in_code: String,
      district: String,
      district_code: String,
      qualification_theme: String,
      qualification_theme_code: String,
      gender: String,
      gender_code: String,
      recruitment_type: String,
      recruitment_code: String,
      class: String,
    class_code: String,
    designation: String,
    designation_code: String,
    state: String,
    state_code: String,
    country: String,
    country_code: String,
    service_status: String,
    service_status_code: String,
    order_type: String,
    order_type_code: String,
    suspension_order_for: String,
    suspension_order_code: String,
    location_change: String,
	createdAt: {
		type: Date, 
		default: Date.now
	},
});

module.exports = mongoose.model('categories', categoriesSchema);