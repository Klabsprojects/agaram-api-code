const department = require('../../models/categories/department.model');

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