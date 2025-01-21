module.exports = (app) => {
    const value = require("../../controllers/services/circulars.controller");
    const {  jwt, ERRORS, SUCCESS, Op } = require("../../helpers/index.helper");
    const CommonFileUpload = require("../../middlewares/commonfileupload");

   app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/addCircular",
    [jwt.verifyToken],
    CommonFileUpload('CircularFile').single('CircularFile'),
    value.addCircular
  );
  
}