module.exports = (app) => {
    const value = require("../../controllers/employee/previousPosting.controller");
    const {  jwt, ERRORS, SUCCESS, Op } = require("../../helpers/index.helper");
   const upload = require("../../middlewares/upload")
   app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/addPreviousPosting",
    //[jwt.verifyToken],
    value.addPreviousPosting
  );

  app.get(
    "/getPreviousPosting",
    // [jwt.verifyToken],
    value.getPreviousPosting
  );
  
  app.put(
    "/updatePreviousPosting",
    // [jwt.verifyToken],
    value.updatePreviousPosting
  );
}