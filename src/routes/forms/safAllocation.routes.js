module.exports = (app) => {
    const value = require("../../controllers/forms/safAllocation.controller");
    const upload = require("../../middlewares/upload")
   app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/getSafAllocation",
    value.getSafAllocation
  );

  app.post(
    "/addSafAllocation",
    upload.single('orderFile'),
    value.addSafAllocation
  );

  app.put(
    "/updateSafAllocation",
    value.updateSafAllocation
  );

  app.put(
    "/editSafAllocation",
    value.editSafAllocation
  );

  app.put(
    "/updateSafAllocationApprovalStatus",
    value.updateSafAllocationApprovalStatus
  );
}