module.exports = (app) => {
    const value = require("../../controllers/employee/leave.controller");
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
    "/getLeave",
    [jwt.verifyToken],
    value.getLeave
  );

  app.post(
    "/addLeave",
    [jwt.verifyToken],
    upload.single('orderFile'),
    value.addLeave
  );
  
  app.put(
    "/updateLeave",
    [jwt.verifyToken],
    upload.single('orderFile'),
    value.updateLeave
  );

  app.put(
    "/updateLeaveApprovalStatus",
    [jwt.verifyToken],
    value.updateApprovalStatus
  );
}