module.exports = (app) => {
    const value = require("../../controllers/forms/hba.controller");
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
    "/addHba",
    [jwt.verifyToken],
    upload.single('orderFile'),
    value.addHba
  );

  app.get(
    "/getHba",
    [jwt.verifyToken],
    value.getHba
  );

  app.put(
    "/updateHba",
    [jwt.verifyToken],
    upload.single('orderFile'),
    value.updateHba
  );

}