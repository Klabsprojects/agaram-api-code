module.exports = (app) => {
    const value = require("../../controllers/forms/education.controller");
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
    "/getEducation",
    [jwt.verifyToken],
    value.getEducation
  );

  app.post(
    "/addEducation",
    [jwt.verifyToken],
    upload.single('orderFile'),
    value.addEducation
  );

  app.put(
    "/updateEducation",
    [jwt.verifyToken],
    upload.single('orderFile'),
    value.updateEducation
  );

  app.put(
    "/updateEducationApprovalStatus",
    [jwt.verifyToken],
    value.updateEducationApprovalStatus
  );
  
}