module.exports = (app) => {
    const value = require("../../controllers/employee/training.controller");
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
    "/getTraining",
    [jwt.verifyToken],
    value.getTraining
  );

  app.post(
    "/addTraining",
    [jwt.verifyToken],
    upload.single('orderFile'),
    value.addTraining
  );
    
  app.put(
    "/updateTraining",
    [jwt.verifyToken],
    upload.single('orderFile'),
    value.updateTraining
  );

  app.put(
    "/updateTrainingApprovalStatus",
    [jwt.verifyToken],
    value.updateApprovalStatus
  );
}