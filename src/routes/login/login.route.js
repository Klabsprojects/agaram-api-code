module.exports = (app) => {
    const value = require("../../controllers/login/login.controller");
   const {  jwt, ERRORS, SUCCESS, Op } = require("../../helpers/index.helper");
   app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/getLoginDetails",
    [jwt.verifyToken],
    value.getLogin
  );

  app.post(
    "/loginRegister",
    [jwt.verifyToken],
    value.register
  );

  app.route("/login")
    .post(value.login)

  app.route("/getUserTypesFromLogin")
    .get([jwt.verifyToken], value.getUserTypesFromLogin)

  app.route("/getUniqueUserTypesFromLogin")
    .get([jwt.verifyToken], value.getUniqueUserTypesFromLogin)

  app.route("/updateActiveStatus")
    .put([jwt.verifyToken], value.updateActiveStatus)

  app.route("/getUniqueUserTypesWithoutRole")
    .get([jwt.verifyToken], value.getUniqueUserTypesWithoutRole)

}