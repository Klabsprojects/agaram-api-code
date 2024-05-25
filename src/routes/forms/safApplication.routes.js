module.exports = (app) => {
    const value = require("../../controllers/forms/safApplication.controller");
   app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/getSafApplication",
    value.getSafApplication
  );

  app.post(
    "/addSafApplication",
    value.addSafApplication
  );
}