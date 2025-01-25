module.exports = (app) => {
    const value = require("../../controllers/landingpage/landingpage.controller");
    const {  jwt, ERRORS, SUCCESS, Op } = require("../../helpers/index.helper");
    const CommonFileUpload = require("../../middlewares/commonfileupload");

   app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/GetCardDetails",
    value.GetCardDetails
  );

}