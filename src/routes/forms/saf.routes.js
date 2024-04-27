module.exports = (app) => {
    const value = require("../../controllers/forms/saf.controller");
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
    "/getSaf",
    value.getSaf
  );

  app.post(
    "/addSaf",
    value.addSaf
  );
}