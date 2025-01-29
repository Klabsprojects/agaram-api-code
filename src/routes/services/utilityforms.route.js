module.exports = (app) => {
    const value = require("../../controllers/services/utilityform.controller");
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
    "/addUtilityforms",
    [jwt.verifyToken],
    CommonFileUpload('UtilityFile').single('UtilityFile'),
    value.addUtilityforms
  );

  app.get(
    "/getUtilityforms",
    //[jwt.verifyToken],
    value.getUtilityforms
  );

  app.delete('/deleteUtilityforms/:id',
    [jwt.verifyToken],
     value.deleteUtilityforms);


    app.put(
    "/updateUtilityforms",
    [jwt.verifyToken],
    CommonFileUpload('UtilityFile').single('UtilityFile'),
    value.updateUtilityforms
    );

}