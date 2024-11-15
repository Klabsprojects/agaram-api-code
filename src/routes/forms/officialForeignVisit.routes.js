module.exports = (app) => {
    const value = require("../../controllers/forms/officialForeignVisit.controller");
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
    "/getVisit",
    [jwt.verifyToken],
    value.getVisit
  );

  app.post(
    "/addVisit",
    [jwt.verifyToken],
    upload.fields([
      { name: 'politicalClearance', maxCount: 1 }, 
      { name: 'fcraClearance', maxCount: 1 },
      { name: 'orderFile', maxCount: 1 },
      { name: 'invitationFile', maxCount: 1}
  ]),

    value.addVisit
  );
    
  app.put(
    "/updateVisit",
    [jwt.verifyToken],
    //upload.single('orderFile'),
    upload.fields([
      { name: 'politicalClearance', maxCount: 1 }, 
      { name: 'fcraClearance', maxCount: 1 },
      { name: 'orderFile', maxCount: 1 },
      { name: 'invitationFile', maxCount: 1}
  ]),
    value.updateVisit
  );

  app.put(
    "/updateVisitApprovalStatus",
    [jwt.verifyToken],
    value.updateVisitApprovalStatus
  );
}