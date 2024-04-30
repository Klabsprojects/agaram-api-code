//const {  jwt, ERRORS, SUCCESS, Op } = require("../../helpers/index.helper");
const login = require('../../models/login/login.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//const bcrypt = require('bcrypt');

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
        let username; let password; let loginAs; let inputQuery;
        username = req.body.username;
        loginAs = req.body.loginAs;
        const salt = await bcrypt.genSalt(10);
        // Hash the password with the salt
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        // Replace the plain text password with the hashed password
        password = hashedPassword;
        console.log(password);
        inputQuery = { username, password: password, loginAs: loginAs };
        const data = await login.create(inputQuery);
        successRes(res, data, 'Login registered successfully');
    } catch (error) {
        console.log('catch', error);
        errorRes(res, error, "Error on Login Registration");
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

        // password Edit
/*exports.update = async (req, res) => {
    try {
        let query = {};
        let password = req.body.password;
        //const hashedPassword = await bcrypt.hash(password, 10);
        query.body = { password: password}
        query.where = {id: req.body.id};
        
        const results = await commonService.update(db.login, query);
        console.log('results => ', results);
        successRes(res, results, SUCCESS.UPDATED);
    } catch (error) {
        console.log('error => ', error);
        const message = error.message ? error.message : ERRORS.UPDATED;
        errorRes(res, error, message, file);
    }
}
*/