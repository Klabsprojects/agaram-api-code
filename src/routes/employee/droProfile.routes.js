module.exports = (app) => {
    const value = require("../../controllers/employee/droProfile.controller");
    const {  jwt, ERRORS, SUCCESS, Op } = require("../../helpers/index.helper");
    const upload = require("../../middlewares/upload")
    //const uploadImage = require("../../middlewares/uploadImage");
    const CommonFileUpload = require("../../middlewares/commonfileupload");
   app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/addDroProfile",
    //[jwt.verifyToken],
    CommonFileUpload("droProfile").fields([
        { name: "imagePath", maxCount: 1 },
        { name: "orderFile", maxCount: 1 },
    ]),
    value.addDroProfile
  );

}