module.exports = (app) => {
    const value = require("../../controllers/forms/intimation.controller");
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
    "/getIntimation",
    value.getIntimation
  );

  app.post(
    "/addIntimation",
    upload.single('orderFile'),
    value.addIntimation
  );

  app.put(
    "/updateIntimation",
    upload.single('orderFile'),
    value.updateIntimation
  );
  
  app.put(
    "/updateIntimationApprovalStatus",
    value.updateIntimationApprovalStatus
  );
}