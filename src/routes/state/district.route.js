module.exports = (app) => {
    const value = require("../../controllers/state/district.controller");
    const {  jwt, ERRORS, SUCCESS, Op } = require("../../helpers/index.helper");

   app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/getDistrict",
    [jwt.verifyToken],
    value.getDistrict
  );

  app.post(
    "/addDistrict",
    [jwt.verifyToken],
    value.addDistrict
  );

}