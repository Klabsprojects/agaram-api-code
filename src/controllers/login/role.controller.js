const {  jwt, ERRORS, SUCCESS, Op } = require("../../helpers/index.helper");
const role = require('../../models/login/role.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")
let file = "role.controller";

exports.register = async (req, res) => {
    try {
        console.log('try');
        console.log(req.body);
        let inputQuery = req.body;
        data = await role.insertMany(inputQuery, { fields: ['roleName', 'menu', 'allAccess', 'entryAccess', 'viewAccess', 'editAccess', 'approvalAccess'] });
        successRes(res, data, 'Role registered successfully');

        /*console.log(req.body);
        let data;
        let roleName; let menu; let allAccess; let entryAccess; let viewAccess; let approvalAccess;
        if(req.body.roleName && req.body.menu && req.body.allAccess && req.body.entryAccess && req.body.viewAccess && req.body.approvalAccess){
            inputQuery = {
                roleName : req.body.roleName,
                menu : req.body.menu,
                allAccess : req.body.allAccess,
                entryAccess : req.body.entryAccess,
                viewAccess : req.body.viewAccess,
                approvalAccess : req.body.approvalAccess
            }
            data = await role.create(inputQuery);*/
        /*}
        else{
            console.log('Pls provide valid inputs');
            throw 'Pls provide valid inputs';
        }*/
    } catch (error) {
        console.log('catch', error);
        errorRes(res, error, "Error on Role Registration");
    }
}

exports.update = async (req, res) => {
    try {
        console.log('try');
        console.log(req.body);
        let query = req.body;
        let result = [];
        for(let input = 0; input < query.length; input++){
            console.log('query[input] ', query[input]);
            console.log('query[input] ', query[input].entryAccess);
            console.log('query[input] ', query[input].allAccess);
            console.log('query[input] ', query[input].viewAccess);
            console.log('query[input] ', query[input].editAccess);
            console.log('query[input] ', query[input].approvalAccess);

            let data;
            let update = {};
            if(query[input].entryAccess != undefined){
                console.log('entryAccess coming ', query[input].entryAccess);
                update.entryAccess = query[input].entryAccess;
            }
            if(query[input].allAccess != undefined){
                console.log('allAccess coming ', query[input].allAccess);
                update.allAccess = query[input].allAccess;
            }
            if(query[input].viewAccess != undefined){
                console.log('viewAccess coming ', query[input].viewAccess);
                update.viewAccess = query[input].viewAccess;
            }
            if(query[input].editAccess != undefined){
                console.log('editAccess coming ', query[input].editAccess);
                update.editAccess = query[input].editAccess;
            }
            
            if(query[input].approvalAccess != undefined){
                console.log('approvalAccess coming ', query[input].approvalAccess);
                update.approvalAccess = query[input].approvalAccess;
            }
            let filter = {
                _id : query[input].id
            }
            console.log('update ', update);
            console.log('filter ', filter);
            data = await role.findOneAndUpdate(filter, update, {
                new: true
              });
            console.log('data updated ', data);
            result.push(data);
            if (input === query.length - 1) {
                console.log('last loop ');
                successRes(res, result, SUCCESS.UPDATED);
            }
        }
    } catch (error) {
        console.log('error => ', error);
        const message = error.message ? error.message : ERRORS.UPDATED;
        errorRes(res, error, message, file);
    }
}

// Get Role
exports.getRole = async (req, res) => {
    console.log('helo from role controller', req.query);
    try {
        let query = {};
        let data;
        if(req.query){
            query.where = req.query;
            data = await role.find(req.query).exec();
        }
        else
            data = await role.find();
        successRes(res, data, SUCCESS.LISTED);
    } catch (error) {
        console.log('error', error);
        errorRes(res, error, ERRORS.LISTED);
    }
}

// Get getRoleClassified
exports.getRoleClassified = async (req, res) => {
    console.log('helo from role controller', req.query);
    try {
        let query = {};
        let data;
            query.where = req.query;
            data = await role.aggregate([
                {
                    $group: {
                        _id: { roleName: '$roleName', menu: '$menu', 
                            allAccess: '$allAccess', 
                            entryAccess: '$entryAccess',
                            viewAccess: '$viewAccess',
                            editAccess: '$editAccess',
                            approvalAccess: '$approvalAccess'
                        },
                    }
                },
                {
                    $project: {
                        _id: 0, // Exclude the default _id field
                        roleName: '$_id.roleName', // Rename _id.loginAs to loginAs
                        menu: '$_id.menu', // Rename _id.status to activeStatus
                        allAccess: '$_id.allAccess', // Rename _id.status to username
                        entryAccess: '$_id.entryAccess', // Rename _id.status to username
                        viewAccess: '$_id.viewAccess', // Rename _id.status to username
                        editAccess: '$_id.editAccess',
                        approvalAccess: '$_id.approvalAccess', // Rename _id.status to username
                        count: 1 // Include the count field

                    }
                }
            ]).exec((err, userTypes) => {
                if (err) {
                    console.error('Error:', err);
                    throw err;
                }
                console.log('userTypes:', userTypes);
                let data = userTypes;
                // Function to transform the data
function transformData(data) {
    // Use an object to store results temporarily
    let result = {};

    // Iterate over each document in the original data
    data.forEach(item => {
        // Check if roleName already exists in result
        if (result[item.roleName]) {
            // If exists, push the menu object into the existing roleName
            result[item.roleName].menu.push({ menu: item.menu, 
                allAccess: item.allAccess,
                entryAccess: item.entryAccess,
                viewAccess: item.viewAccess,
                editAccess: item.editAccess,
                approvalAccess: item.approvalAccess
             });
        } else {
            // If not exists, create a new roleName entry with an array containing the first menu object
            result[item.roleName] = {
                roleName: item.roleName,
                menu: [{ menu: item.menu, 
                allAccess: item.allAccess,
                entryAccess: item.entryAccess,
                viewAccess: item.viewAccess,
                editAccess: item.editAccess,
                approvalAccess: item.approvalAccess
                }]
            };
        }
    });

    // Convert result object to an array of values
    return Object.values(result);
}

// Call the function to transform the data
let transformedData = transformData(data);

// Output the transformed data
console.log(transformedData);
                successRes(res, transformedData, 'User types listed Successfully');
            });
    } catch (error) {
        console.log('error', error);
        errorRes(res, error, ERRORS.LISTED);
    }
}

// Get getUserTypes
exports.getUserTypes = async (req, res) => {
    console.log('helo from getUserTypes controller', req.query);
    try {
        let query = {};
        let data;
            query.where = req.query;
            data = await role.aggregate([
                {
                    $group: {
                        _id: '$roleName'
                    }
                },
                {
                    $project: {
                        _id: 0, // Exclude the default _id field
                        roleName: '$_id', // Rename _id field to categoryName
                        count: 1 // Include the count field
                    }
                }
            ]).exec((err, userTypes) => {
                if (err) {
                    console.error('Error:', err);
                    throw err;
                }
                console.log('userTypes:', userTypes);
                successRes(res, userTypes, 'User types listed Successfully');
            });
    } catch (error) {
        console.log('error', error);
        const message = error.message ? error.message : ERRORS.LISTED;
        errorRes(res, error, message);
    }
}