module.exports = (app) => {
    const value = require("../../controllers/categories/department.controller");
    const {  jwt, ERRORS, SUCCESS, Op } = require("../../helpers/index.helper");

   app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/getDepartments",
    //[jwt.verifyToken],
    value.getDepartments
  );

  app.post(
    "/addDepartments",
    [jwt.verifyToken],
    value.addDepartments
  );

  app.put(
    "/updateDepartment", 
    //[jwt.verifyToken], 
    value.updateDepartment
  );
}