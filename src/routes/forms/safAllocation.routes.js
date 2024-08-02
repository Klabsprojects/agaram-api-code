module.exports = (app) => {
    const value = require("../../controllers/forms/safAllocation.controller");
    const upload = require("../../middlewares/upload")
    const {  jwt, ERRORS, SUCCESS, Op } = require("../../helpers/index.helper");
   app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/getSafAllocation",
    [jwt.verifyToken],
    value.getSafAllocation
  );

  app.post(
    "/addSafAllocation",
    [jwt.verifyToken],
    upload.single('orderFile'),
    value.addSafAllocation
  );

  app.put(
    "/updateSafAllocation",
    [jwt.verifyToken],
    upload.single('orderFile'),
    value.updateSafAllocation
  );

  app.put(
    "/editSafAllocation",
    [jwt.verifyToken],
    value.editSafAllocation
  );

  app.put(
    "/updateSafAllocationApprovalStatus",
    [jwt.verifyToken],
    value.updateSafAllocationApprovalStatus
  );
}