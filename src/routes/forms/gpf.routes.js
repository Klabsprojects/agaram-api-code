module.exports = (app) => {
    const value = require("../../controllers/forms/gpf.controller");
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
    "/addGpf",
    [jwt.verifyToken],
    upload.single('orderFile'),
    value.addGpf
  );

  app.get(
    "/getGpf",
    [jwt.verifyToken],
    value.getGpf
  );

  app.put(
    "/updateGpf",
    [jwt.verifyToken],
    upload.single('orderFile'),
    value.updateGpf
  );

  app.put(
    "/updateGpfApprovalStatus",
    [jwt.verifyToken],
    value.updateGpfApprovalStatus
  );
}