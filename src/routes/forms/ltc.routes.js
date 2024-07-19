module.exports = (app) => {
    const value = require("../../controllers/forms/ltc.controller");
   //const { joi, cache } = require("../../helpers/index.helper");
   //const {  jwt, ERRORS, SUCCESS, Op } = require("../../helpers/index.helper");

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
    value.getLtc
  );

  app.post(
    "/addLtc",
    upload.single('orderFile'),
    //upload.single('fcraClearance'),
    value.addLtc
  );

  app.put(
    "/updateLtc",
    value.updateLtc
  );

  app.put(
    "/updateLtcApprovalStatus",
    value.updateLtcApprovalStatus
  );
}