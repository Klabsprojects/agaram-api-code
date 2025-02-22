module.exports = (app) => {
    const value = require("../../controllers/categories/designation.controller");
    const {  jwt, ERRORS, SUCCESS, Op } = require("../../helpers/index.helper");

   app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/getDesignations",
    //[jwt.verifyToken],
    value.getDesignations
  );

  app.post(
    "/addDesignations",
    [jwt.verifyToken],
    value.addDesignations
  );

  app.put(
    "/updateDesignation", 
    //[jwt.verifyToken], 
    value.updateDesignation
  );

}