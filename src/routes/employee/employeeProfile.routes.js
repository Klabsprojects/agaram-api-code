module.exports = (app) => {
    const value = require("../../controllers/employee/employeeProfile.controller");
    const {  jwt, ERRORS, SUCCESS, Op } = require("../../helpers/index.helper");
    const upload = require("../../middlewares/upload")
    const uploadImage = require("../../middlewares/uploadImage")
   app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/getEmployeeProfile",
    [jwt.verifyToken],
    value.getEmployeeProfile
  );

  app.get(
    "/getEmployeeForLogin",
    // [jwt.verifyToken],
    value.getEmployeeForLogin
  );

  app.post(
    "/addEmployeeProfile",
   [jwt.verifyToken],
   uploadImage.single('imagePath'),
    value.addEmployeeProfile
  );

  app.get(
    "/getEmployeeByFilter",
    [jwt.verifyToken],
    value.getEmployeeByFilter
  );

  app.get(
    "/getEmployeeByFilterOfficer",
    [jwt.verifyToken],
    value.getEmployeeByFilterOfficer
  );

  app.put(
    "/updateEmployeeProfile",
    [jwt.verifyToken],
    value.updateEmployeeProfile
  );

  app.put(
    "/updateProfileApprovalStatus",
    [jwt.verifyToken],
    value.updateApprovalStatus
  );

  app.get(
    "/getMaleEmployees",
    [jwt.verifyToken],
    value.getMaleEmployees
  )

  app.get(
    "/getFemaleEmployees",
    [jwt.verifyToken],
    value.getFemaleEmployees
  )

  app.get(
    "/getActiveEmployees",
    [jwt.verifyToken],
    value.getActiveEmployees
  )
  
  app.get(
    "/getRetiredEmployees",
    [jwt.verifyToken],
    value.getRetiredEmployees
  )

  app.get(
    "/getByLocation",
    [jwt.verifyToken],
    value.getByLocation
  )

  app.get(
    "/getByLocation",
    [jwt.verifyToken],
    value.getByLocation
  )

  app.get(
    "/getBySecretariat",
    [jwt.verifyToken],
    value.getBySecretariat
  )

  app.get(
    "/getByDesignation",
    [jwt.verifyToken],
    value.getByDesignation
  )
  
  app.get(
    "/getEmployeeHistory",
    [jwt.verifyToken],
    value.getEmployeeHistory
  );

  app.post(
    "/getEmployeeSearch",
    [jwt.verifyToken],
    value.getEmployeeSearch
  );

  app.post(
    "/getEmployeeSearchOfficer",
    [jwt.verifyToken],
    value.getEmployeeSearchOfficer
  );

  app.get(
    "/getEmployeeCurrentPosting",
    [jwt.verifyToken],
    value.getEmployeeCurrentPosting
  );

  app.post(
    "/getEmployeeAdvancedSearch",
    [jwt.verifyToken],
    value.getEmployeeAdvancedSearch
  );

}