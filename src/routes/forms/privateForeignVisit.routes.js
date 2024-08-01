module.exports = (app) => {
    const value = require("../../controllers/forms/privateForeignVisit.controller");
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
    "/getPrivateForeignVisit",
    value.getPrivateForeignVisit
  );

  app.post(
    "/addPrivateForeignVisit",
    upload.single('orderFile'),
    value.addPrivateForeignVisit
  );
 
  app.put(
    "/updatePrivateVisit",
    upload.single('orderFile'),
    value.updatePrivateVisit
  );

  app.put(
    "/updatePrivateVisitApprovalStatus",
    value.updatePrivateVisitApprovalStatus
  );
}