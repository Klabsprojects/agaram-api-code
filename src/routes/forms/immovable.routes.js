module.exports = (app) => {
    const value = require("../../controllers/forms/immovable.controller");
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
    "/getImmovable",
    [jwt.verifyToken],
    value.getImmovable
  );

  app.post(
    "/addImmovable",
    [jwt.verifyToken],
    upload.single('orderFile'),
    value.addImmovable
  );
    
  app.put(
    "/updateImmovable",
    [jwt.verifyToken],
    upload.single('orderFile'),
    value.updateImmovable
  );

  app.put(
    "/updateImmovableApprovalStatus",
    [jwt.verifyToken],
    value.updateImmovableApprovalStatus
  );
}