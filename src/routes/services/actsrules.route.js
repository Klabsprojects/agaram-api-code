module.exports = (app) => {
    const value = require("../../controllers/services/actsrules.controller");
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
    "/addActsrules",
    [jwt.verifyToken],
    CommonFileUpload('actsrulesFile').single('actsrulesFile'),
    value.addActsrules
  );

  app.get(
    "/getActsrules",
    [jwt.verifyToken],
    value.getActsrules
  );

  app.delete('/deleteActsrules/:id',
    [jwt.verifyToken],
     value.deleteActsrules);


    app.put(
    "/updateaActsrules",
    [jwt.verifyToken],
    CommonFileUpload('actsrulesFile').single('actsrulesFile'),
    value.updateaActsrules
    );

}