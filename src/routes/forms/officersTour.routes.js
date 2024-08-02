module.exports = (app) => {
    const value = require("../../controllers/forms/officersTour.controller");
    const {  jwt, ERRORS, SUCCESS, Op } = require("../../helpers/index.helper");

   app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/getOfficersTour",
    [jwt.verifyToken],
    value.getOfficersTour
  );

  app.post(
    "/addOfficersTour",
    [jwt.verifyToken],
    value.addOfficersTour
  );
}