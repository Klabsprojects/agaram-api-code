module.exports = (app) => {
    const value = require("../../controllers/contactUs/visitor.controller");
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
    "/addOrUpdateVisitor",
    value.addOrUpdateVisitor
  );

  app.get(
    "/getLatestVisitor",
    value.getLatestVisitor
  );

}