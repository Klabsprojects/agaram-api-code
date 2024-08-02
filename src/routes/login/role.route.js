module.exports = (app) => {
    const value = require("../../controllers/login/role.controller");
   //const { joi, cache } = require("../../helpers/index.helper");
   const {  jwt, ERRORS, SUCCESS, Op } = require("../../helpers/index.helper");
   app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  /*app.get(
    "/getRoles",
    value.getRole
  );*/

  app.route("/addRole")
    .post([jwt.verifyToken], value.register)

  app.route("/updateRole")
    .put([jwt.verifyToken], value.update)

  app.route("/getRole")
    .get([jwt.verifyToken], value.getRole)

  app.route("/getUserTypes")
    .get([jwt.verifyToken], value.getUserTypes)
  
  app.route("/getRoleClassified")
    .get([jwt.verifyToken], value.getRoleClassified)

}