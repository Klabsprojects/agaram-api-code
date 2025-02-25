const leaveCredit = require('../../models/employee/leaveCredit.model');
const login = require('../../models/login/login.model');
const { successRes, errorRes } = require("../../middlewares/response.middleware")
const whatsapp = require('../whatsapp/whatsapp.controller');
const employeeProfile = require('../../models/employee/employeeProfile.model');

    // leaveCredit updation
    exports.updateLeaveCredit = async (req, res) => {
        try {
            console.log('try update leaveCredit', req.body);
            const query = req.body;
            let filter;
            let update = {};
            update = req.body;
            if(Object.keys(req.body).length >0){
                if(query.id){
                    console.log('id coming');
                    console.log(query.id);
                    filter = {
                        _id : query.id
                    }
                    console.log('update ', update);
                    console.log('filter ', filter);
                    // Check if the update object is empty or not
                    if (Object.keys(update).length > 0) {
                        console.log('value got');
                        const data = await leaveCredit.findOneAndUpdate(filter, update, {
                            new: true
                        });
                        console.log('data updated ', data);
                        successRes(res, data, 'data updated Successfully');
                    } else {
                        console.log('empty');
                        throw 'Update value missing';
                    }
                }
                else{
                    console.log('id not coming');
                    //throw 'pls provide id field';
                    let leaveCreditData = {
                        casualLeave: req.body.casualLeave,
                        restrictedHoliday: req.body.restrictedHoliday,
                        earnedLeave: req.body.earnedLeave,
                        halfPayLeave: req.body.halfPayLeave,
                        empProfileId: req.body.empProfileId
                        }
                    console.log('leaveCreditData ', leaveCreditData)
                    const leaveCreditDataRes = await leaveCredit.create(leaveCreditData);
                    successRes(res, leaveCreditDataRes, 'data created Successfully');
                }

            }
            
            else{
                console.log('problem in input query');
                throw 'pls provide input query';
            }      
            
        } catch (error) {
            console.log('catch update', error);
            errorRes(res, error, "Error on updation");
        }
        }