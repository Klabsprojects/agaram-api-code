const department = require('../../models/categories/department.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")

// department creation
exports.addDepartments = async (req, res) => {
    try {
        console.log('try create departments');
        const query = req.body;
        const data = await department.create(query);
        res.json(data);
    } catch (error) {
        console.log('catch create departments');
        res.json(error);
    }
    }

// Get department
exports.getDepartments = async (req, res) => {
        console.log('helo from department controller', req.query);
        try {
            let query = {};
            let data;
            if(req.query){
                query.where = req.query;
                data = await department.find(req.query).exec();
            }
            else
                data = await department.find();
            res.json(data);
        } catch (error) {
            console.log('error', error);
            res.json(error);
        }
    }

exports.handledepartmentEdit = async (req) => {
    let query = {};
    let where = {};
    query = req.body;
    where = req.where;
    const data = await department.findOneAndUpdate(where, query, {
        new: true
      });
    console.log('data updated ', data);

    return data;  // return the data for further use
};

// exports.updateDepartment = async (req, res) => {
//     console.log('Hello from department update controller', req.query);

//     try {
//         const { category_code, department_name } = req.body; // Get the values to update from the request body

//         // Validate the required fields
//         // if (!category_code || !department_name) {
//         //     return res.status(400).json({ message: 'category_code and department_name are required' });
//         // }

//         // If _id is provided in the query (for a specific department), use it
//         const departmentId = req.query._id;

//         if (!departmentId) {
//             return res.status(400).json({ message: 'Department ID is required' });
//         }

//         // Update the department by _id using the query parameters
//         const updatedDepartment = await department.findByIdAndUpdate(
//             departmentId,
//             { category_code, department_name },
//             { new: true } // Ensure the updated department is returned
//         );

//         if (!updatedDepartment) {
//             return res.status(404).json({ message: 'Department not found' });
//         }

//         // Return the updated department
//         res.status(200).json(updatedDepartment);

//     } catch (error) {
//         console.log('Error:', error);
//         res.status(500).json({ message: 'Server error', error });
//     }
// };

exports.updateDepartment = async (req, res) => {
    console.log('Hello from department update controller', req.query);

    try {
        // Get the data to update from the request body
        const { category_code, department_name } = req.body;
        
        // If neither category_code nor department_name is provided, return a 400 error
        if (!category_code && !department_name) {
            return res.status(400).json({ message: 'At least one of category_code or department_name is required to update' });
        }

        // Get the department _id from the query string
        const departmentId = req.query._id;
        
        if (!departmentId) {
            return res.status(400).json({ message: 'Department ID (_id) is required in the query string' });
        }

        // Build an update object based on what fields are provided
        const updateData = {};
        if (category_code) {
            updateData.category_code = category_code;
        }
        if (department_name) {
            updateData.department_name = department_name;
        }

        // Update the department by _id
        const updatedDepartment = await department.findByIdAndUpdate(
            departmentId,
            updateData,
            { new: true } // Ensure the updated department is returned
        );

        if (!updatedDepartment) {
            return res.status(404).json({ message: 'Department not found' });
        }

        // Return the updated department
        successRes(res, updatedDepartment, 'Department updated Successfully');

    } catch (error) {
        console.log('Error:', error);
        const message = error.message ? error.message : ERRORS.LISTED;
        errorRes(res, error, message);
    }
};
