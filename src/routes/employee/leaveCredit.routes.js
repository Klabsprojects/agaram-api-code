module.exports = (app) => {
    const value = require("../../controllers/employee/leaveCredit.controller");
    const {  jwt, ERRORS, SUCCESS, Op } = require("../../helpers/index.helper");
   const upload = require("../../middlewares/upload")
   app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  
  app.put(
    "/updateLeaveCredit",
    [jwt.verifyToken],
    value.updateLeaveCredit
  );

  app.get(
    "/getLeaveCredit",
    [jwt.verifyToken],
    value.getLeaveCredit
  );

}