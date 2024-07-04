const {  jwt, ERRORS, SUCCESS, Op } = require("../../helpers/index.helper");
const role = require('../../models/login/role.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")
let file = "role.controller";
 
exports.register = async (req, res) => {
    try {
        console.log('try');
        console.log(req.body);
        let inputQuery = req.body;
        data = await role.insertMany(inputQuery, { fields: ['roleName', 'menu', 'allAccess', 'entryAccess', 'viewAccess', 'approvalAccess'] });
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
        let data;
        let update = {};
        if(req.body.entryAccess){
            console.log('entryAccess coming ', req.body.entryAccess);
            update.entryAccess = req.body.entryAccess;
        }
        if(req.body.allAccess){
            console.log('allAccess coming ', req.body.allAccess);
            update.allAccess = req.body.allAccess;
        }
        if(req.body.viewAccess){
            console.log('viewAccess coming ', req.body.viewAccess);
            update.viewAccess = req.body.viewAccess;
        }
        let filter = {
            _id : query.id
        }
        console.log('update ', update);
        console.log('filter ', filter);

        data = await role.findOneAndUpdate(filter, update, {
            new: true
          });
        console.log('data updated ', data);
        successRes(res, data, SUCCESS.UPDATED);
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