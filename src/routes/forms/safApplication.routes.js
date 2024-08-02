module.exports = (app) => {
    const value = require("../../controllers/forms/safApplication.controller");
    const {  jwt, ERRORS, SUCCESS, Op } = require("../../helpers/index.helper");
   app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/getSafApplication",
    [jwt.verifyToken],
    value.getSafApplication
  );

  app.post(
    "/addSafApplication",
    [jwt.verifyToken],
    value.addSafApplication
  );

  app.put(
    "/updateSafApplication",
    [jwt.verifyToken],
    value.updateSafApplication
  );

  app.put(
    "/updateSafApplicationApprovalStatus",
    [jwt.verifyToken],
    value.updateSafApplicationApprovalStatus
  );
}