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

  app.get(
    "/getEmployeeByFilter",
    value.getEmployeeByFilter
  );

  app.put(
    "/updateEmployeeProfile",
    value.updateEmployeeProfile
  );

  app.get(
    "/getMaleEmployees",
    value.getMaleEmployees
  )

  app.get(
    "/getFemaleEmployees",
    value.getFemaleEmployees
  )

  app.get(
    "/getActiveEmployees",
    value.getActiveEmployees
  )
  
  app.get(
    "/getRetiredEmployees",
    value.getRetiredEmployees
  )

  app.get(
    "/getByLocation",
    value.getByLocation
  )

  app.get(
    "/getByLocation",
    value.getByLocation
  )

  app.get(
    "/getBySecretariat",
    value.getBySecretariat
  )

  app.get(
    "/getByDesignation",
    value.getByDesignation
  )
  
  app.get(
    "/getEmployeeHistory",
    value.getEmployeeHistory
  );

  app.post(
    "/getEmployeeSearch",
    value.getEmployeeSearch
  );

  app.get(
    "/getEmployeeCurrentPosting",
    value.getEmployeeCurrentPosting
  );

}