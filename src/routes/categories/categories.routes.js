module.exports = (app) => {
    const value = require("../../controllers/categories/categories.controller");
    const {  jwt, ERRORS, SUCCESS, Op } = require("../../helpers/index.helper");

   app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/getCategories",
    [jwt.verifyToken],
    value.getCategories
  );

  app.post(
    "/addCategories",
    [jwt.verifyToken],
    value.addCategories
  );

  app.get(
    "/getCategoryTypes",
    [jwt.verifyToken],
    value.getCategoryTypes
  )

}