module.exports = (app) => {
    const value = require("../../controllers/employee/employeeUpdate.controller");
    const {  jwt, ERRORS, SUCCESS, Op } = require("../../helpers/index.helper");

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
    [jwt.verifyToken],
    value.getEmployeeUpdate
  );

  app.post(
    "/addEmployeeUpdate",
    [jwt.verifyToken],
    upload.single('orderFile'),
    value.addEmployeeUpdate
  );

  app.post(
    "/addTransferOrPostingManyEmployees",
    [jwt.verifyToken],
    upload.single('orderFile'),
    value.addTransferOrPostingManyEmployees
  );

  app.put(
    "/updateTransferPosting",
    [jwt.verifyToken],
    value.updateTransferPosting
  );

  app.put(
    "/updateApprovalStatus",
    [jwt.verifyToken],
    value.updateApprovalStatus
  );

}