module.exports = (app) => {
    const value = require("../../controllers/employee/employeeUpdate.controller");
   //const { joi, cache } = require("../../helpers/index.helper");
   //const {  jwt, ERRORS, SUCCESS, Op } = require("../../helpers/index.helper");

   const upload = require("../../middlewares/upload")
   app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/getEmployeeUpdate",
    value.getEmployeeUpdate
  );

  app.post(
    "/addEmployeeUpdate",
    upload.single('orderFile'),
    value.addEmployeeUpdate
  );

  app.post(
    "/addTransferOrPostingManyEmployees",
    upload.single('orderFile'),
    value.addTransferOrPostingManyEmployees
  );


}