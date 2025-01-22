module.exports = (app) => {
    const value = require("../../controllers/services/other_type_go.controller");
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
    "/addgo",
    [jwt.verifyToken],
    CommonFileUpload('GoFile').single('GoFile'),
    value.addgo
  );

  app.get(
    "/getgo",
    [jwt.verifyToken],
    value.getgo
  );

  app.delete('/deletego/:id',
    [jwt.verifyToken],
     value.deletego);


    app.put(
    "/updateGo",
    [jwt.verifyToken],
    CommonFileUpload('GoFile').single('GoFile'),
    value.updateGo
    );

}