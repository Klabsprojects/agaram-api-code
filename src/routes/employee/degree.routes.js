module.exports = (app) => {
    const value = require("../../controllers/employee/degree.controller");
    const {  jwt, ERRORS, SUCCESS, Op } = require("../../helpers/index.helper");

   app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/getDegree",
    [jwt.verifyToken],
    value.getDegree
  );

  app.post(
    "/addDegree",
    [jwt.verifyToken],
    value.addDegree
  );

  app.put(
    "/updateDegree",
    [jwt.verifyToken],
    value.updateDegree
  );
}