module.exports = (app) => {
    const value = require("../../controllers/categories/department.controller");
   //const { joi, cache } = require("../../helpers/index.helper");
   //const {  jwt, ERRORS, SUCCESS, Op } = require("../../helpers/index.helper");

   app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/getDepartments",
    value.getDepartments
  );

  app.post(
    "/addDepartments",
    value.addDepartments
  );


}