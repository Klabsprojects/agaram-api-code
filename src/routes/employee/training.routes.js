module.exports = (app) => {
    const value = require("../../controllers/employee/training.controller");
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
    "/getTraining",
    value.getTraining
  );

  app.post(
    "/addTraining",
    upload.single('orderFile'),
    value.addTraining
  );
    
  app.put(
    "/updateTraining",
    value.updateTraining
  );

  app.put(
    "/updateTrainingApprovalStatus",
    value.updateApprovalStatus
  );
}