module.exports = (app) => {
    const value = require("../../controllers/services/faq.controller");
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
    "/addfaq",
    [jwt.verifyToken],
    value.addfaq
  );

  app.get(
    "/getfaq",
    //[jwt.verifyToken],
    value.getfaq
  );

  app.delete('/deletefaq/:id',
    [jwt.verifyToken],
     value.deletefaq);


    app.put(
    "/updatefaq",
    [jwt.verifyToken],
    value.updatefaq
    );

}