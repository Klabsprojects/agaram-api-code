module.exports = (app) => {
    const value = require("../../controllers/forms/privateForeignVisit.controller");
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
    "/getPrivateForeignVisit",
    [jwt.verifyToken],
    value.getPrivateForeignVisit
  );

  app.post(
    "/addPrivateForeignVisit",
    [jwt.verifyToken],
    upload.single('orderFile'),
    value.addPrivateForeignVisit
  );
 
  app.put(
    "/updatePrivateVisit",
    [jwt.verifyToken],
    upload.single('orderFile'),
    value.updatePrivateVisit
  );

  app.put(
    "/updatePrivateVisitApprovalStatus",
    [jwt.verifyToken],
    value.updatePrivateVisitApprovalStatus
  );
}