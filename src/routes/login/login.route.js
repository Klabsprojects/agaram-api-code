module.exports = (app) => {
    const value = require("../../controllers/login/login.controller");
   //const { joi, cache } = require("../../helpers/index.helper");
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
    value.getLogin
  );

  app.post(
    "/loginRegister",
    //[jwt.verifyToken],
    value.register
  );

  app.route("/login")
    .post(value.login)

  app.route("/getUserTypesFromLogin")
    .get(value.getUserTypesFromLogin)

  app.route("/getUniqueUserTypesFromLogin")
    .get(value.getUniqueUserTypesFromLogin)

  app.route("/updateActiveStatus")
    .put(value.updateActiveStatus)

  app.route("/getUniqueUserTypesWithoutRole")
    .get(value.getUniqueUserTypesWithoutRole)

}