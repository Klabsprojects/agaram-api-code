module.exports = (app) => {
    const value = require("../../controllers/contactUs/contactus.controller");
    const {  jwt, ERRORS, SUCCESS, Op } = require("../../helpers/index.helper");
    const CommonFileUpload = require("../../middlewares/commonfileupload");

   app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/addContactus",
    value.addContactus
  );

  app.get(
    "/getContactus",
    [jwt.verifyToken],
    value.getContactus
  );

  app.get(
    "/getReadCount",
    [jwt.verifyToken],
    value.getReadCount
  );

  app.put(
    "/markAsRead/:id",
    [jwt.verifyToken],
    value.markAsRead
  );

}