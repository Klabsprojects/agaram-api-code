module.exports = (app) => {
    const value = require("../../controllers/employee/employeeProfile.controller");
   //const { joi, cache } = require("../../helpers/index.helper");
   //const {  jwt, ERRORS, SUCCESS, Op } = require("../../helpers/index.helper");

   app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/getEmployeeProfile",
    value.getEmployeeProfile
  );

  app.post(
    "/addEmployeeProfile",
    value.addEmployeeProfile
  );


}