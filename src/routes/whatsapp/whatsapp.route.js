module.exports = (app) => {
    const value = require("../../controllers/whatsapp/whatsapp.controller");
   const {  jwt, ERRORS, SUCCESS, Op } = require("../../helpers/index.helper");
   app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/sendWhatsapp",
    //[jwt.verifyToken],
    value.sendWhatsapp
  );
}