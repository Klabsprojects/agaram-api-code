module.exports = (app) => {
    const value = require("../../controllers/forms/idCard.controller");
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
    "/addIdcard",
    [jwt.verifyToken],
    upload.fields([
      { name: 'orderFile', maxCount: 1 },
      { name: 'idCardApplication', maxCount: 1 },
      { name: 'finalIdCard', maxCount: 1}
  ]),
    value.addIdcard
  );

  app.get(
    "/getIdCard",
    [jwt.verifyToken],
    value.getIdCard
  );

  app.put(
    "/updateIdCard",
    [jwt.verifyToken],
    //upload.single('orderFile'),
    upload.fields([
      { name: 'orderFile', maxCount: 1 },
      { name: 'idCardApplication', maxCount: 1 },
      { name: 'finalIdCard', maxCount: 1}
  ]),
    value.updateIdCard
  );

  app.put(
    "/updateIdCardApprovalStatus",
    [jwt.verifyToken],
    value.updateIdCardApprovalStatus
  );
}