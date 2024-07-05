const {  ERRORS, SUCCESS, Op } = require("../../helpers/index.helper");
const login = require('../../models/login/login.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
let file = "login.controller";
let Jkey = process.env.JWT_SECRET_KEY;
const expire = process.env.EXPIRE;

exports.getLogin = async (req, res) => {
    console.log('helo from login controller');
    try {
        let query = {};
        query.where = req.query;
         console.log('query ', query);
        let results;
        if (req.query._id || req.query.username) {
            console.log('if');
            //results = await commonService.findOne(db.login, query);
            results = await login.find(req.query).exec();
        }
        console.log('success');
        console.log(results);
        successRes(res, results, 'Login listed Successfully');
    } catch (error) {
        console.log('error');
        const message = error.message ? error.message : ERRORS.LISTED;
        errorRes(res, error, "Error on listing login");
    }
}
 
exports.register = async (req, res) => {
    try {
        console.log('try');
        console.log(req.body);
        let username; let password; let loginAs; let inputQuery; let activeStatus;
        username = req.body.username;
        loginAs = req.body.loginAs;
        activeStatus = req.body.activeStatus;
        const salt = await bcrypt.genSalt(10);
        // Hash the password with the salt
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        // Replace the plain text password with the hashed password
        password = hashedPassword;
        console.log(password);
        inputQuery = { username, password: password, loginAs: loginAs, activeStatus: activeStatus };
        const data = await login.create(inputQuery);
        successRes(res, data, 'Login registered successfully');
    } catch (error) {
        if (error.code === 11000) {
            // Duplicate key error
            const duplicatedKey = Object.keys(error.keyValue)[0];
            const errorMessage = `The ${duplicatedKey} '${error.keyValue[duplicatedKey]}' is already exist.`;
            errorRes(res, error, errorMessage);
        }else{
            console.log('catch', error);
            errorRes(res, error, "Error on Login Registration");
        }
    }
    }

    exports.login = async (req, res) => {
    try {
        console.log('try');
        console.log('Jkey => ',Jkey)
        console.log('expire => ',expire)
        console.log(req.body);
        let query = {};
        query = {
            username: req.body.username,
        };
        console.log('query ', query);
       let user = [];
       if (req.body.username && req.body.password) {
           console.log('if');
           user = await login.find(query).exec();
           console.log(user);
       }
    if (user.length == 0) {
        errorRes(res, user, "Authentication failed user not exist");
    }
    else if(user.length == 1){
        console.log('else => ',user);
        if(bcrypt.compareSync(req.body.password, user[0].password)){
            const token = jwt.sign({ username: req.body.username,
            password: req.body.password }, Jkey, { expiresIn: expire });
            let result = {
                data: user,
                token: token
            }
            successRes(res, result, 'Login success');
        }
        else 
            errorRes(res, user, "Password wrong");
    }
    } catch (error) {
        console.log('catch', error);
        errorRes(res, error, "Login failed");
    }
    }

    // Get getUserTypesFromLogin
exports.getUserTypesFromLogin = async (req, res) => {
    console.log('helo from getUserTypesFromLogin controller', req.query);
    try {
        let query = {};
        let data;
            query.where = req.query;
            data = await login.aggregate([
                {
                    $group: {
                        _id: { loginAs: '$loginAs', username: '$username', activeStatus: '$activeStatus' },
                    }
                },
                {
                    $project: {
                        _id: 0, // Exclude the default _id field
                        loginAs: '$_id.loginAs', // Rename _id.loginAs to loginAs
                        activeStatus: '$_id.activeStatus', // Rename _id.status to activeStatus
                        username: '$_id.username', // Rename _id.status to username
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

    // Get getUniqueUserTypesFromLogin
    exports.getUniqueUserTypesFromLogin = async (req, res) => {
        console.log('helo from getUniqueUserTypesFromLogin controller', req.query);
        try {
            let query = {};
            let data;
                query.where = req.query;
                data = await login.aggregate([
                    {
                        $group: {
                            _id: { loginAs: '$loginAs'},
                        }
                    },
                    {
                        $project: {
                            _id: 0, // Exclude the default _id field
                            loginAs: '$_id.loginAs', // Rename _id.loginAs to loginAs
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

// block updation
exports.updateActiveStatus = async (req, res) => {
    try {
        console.log('try update block');
        const query = req.body;
        let filter;
        let update = {};
        if(query.activeStatus != undefined){
            update.activeStatus = query.activeStatus;
        }
        if(query.loginAs && query.username){
            filter = {
                loginAs: query.loginAs,
                username : query.username
            }
        }
        else
            throw 'pls provide loginAs and username field';
        console.log('update ', update);
        console.log('filter ', filter);
        // Check if the update object is empty or not
        if (Object.keys(update).length > 0) {
            console.log('value got');
            const data = await login.findOneAndUpdate(filter, update, {
                new: true
              });
            console.log('data updated ', data);
            successRes(res, data, 'activeStatus updated Successfully');
        } else {
            console.log('empty');
            throw 'Update value missing';
        }
    } catch (error) {
        console.log('catch activeStatus updation', error);
        errorRes(res, error, "Error on activeStatus updation");
    }
    }