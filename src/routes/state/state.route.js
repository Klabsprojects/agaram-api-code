module.exports = (app) => {
    const value = require("../../controllers/state/state.controller");
    const {  jwt, ERRORS, SUCCESS, Op } = require("../../helpers/index.helper");

   app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/getState",
    [jwt.verifyToken],
    value.getState
  );

  app.post(
    "/addState",
    [jwt.verifyToken],
    value.addState
  );


}