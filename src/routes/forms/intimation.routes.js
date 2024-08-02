module.exports = (app) => {
    const value = require("../../controllers/forms/intimation.controller");
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
    "/getIntimation",
    [jwt.verifyToken],
    value.getIntimation
  );

  app.post(
    "/addIntimation",
    [jwt.verifyToken],
    upload.single('orderFile'),
    value.addIntimation
  );

  app.put(
    "/updateIntimation",
    [jwt.verifyToken],
    upload.single('orderFile'),
    value.updateIntimation
  );
  
  app.put(
    "/updateIntimationApprovalStatus",
    [jwt.verifyToken],
    value.updateIntimationApprovalStatus
  );
}