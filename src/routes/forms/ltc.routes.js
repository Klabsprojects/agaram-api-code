module.exports = (app) => {
    const value = require("../../controllers/forms/ltc.controller");
    const {  jwt, ERRORS, SUCCESS, Op } = require("../../helpers/index.helper");

   const upload = require("../../middlewares/upload")
   app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/getLtc",
    [jwt.verifyToken],
    value.getLtc
  );

  app.post(
    "/addLtc",
    [jwt.verifyToken],
    upload.single('orderFile'),
    //upload.single('fcraClearance'),
    value.addLtc
  );

  app.put(
    "/updateLtc",
    [jwt.verifyToken],
    upload.single('orderFile'),
    value.updateLtc
  );

  app.put(
    "/updateLtcApprovalStatus",
    [jwt.verifyToken],
    value.updateLtcApprovalStatus
  );
}