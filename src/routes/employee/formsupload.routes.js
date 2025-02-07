module.exports = (app) => {
    const value = require("../../controllers/employee/formsupload.controller");
    const {  jwt, ERRORS, SUCCESS, Op } = require("../../helpers/index.helper");
   const upload = require("../../middlewares/upload")
   const CommonFileUpload = require("../../middlewares/commonfileupload");
   app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/getFormsupload",
    [jwt.verifyToken],
    value.getFormsupload
  );

  app.post(
    "/addFormsupload",
    [jwt.verifyToken],
    CommonFileUpload('formsupload').single('formFile'),
    value.addFormsupload
  );
  
}