module.exports = (app) => {
    const value = require("../../controllers/forms/medicalReimbursement.controller");
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
    "/getMedicalReimbursement",
    [jwt.verifyToken],
    value.getMedicalReimbursement
  );

  app.post(
    "/addMedicalReimbursement",
    [jwt.verifyToken],
    //upload.single('orderFile'),
    upload.fields([
      { name: 'orderFile', maxCount: 1 },
      { name: 'dischargeOrTestFile', maxCount: 1 },
  ]),
    value.addMedicalReimbursement
  );

    
  app.put(
    "/updateMedicalReimbursement",
    [jwt.verifyToken],
    //upload.single('orderFile'),
    upload.fields([
      { name: 'orderFile', maxCount: 1 },
      { name: 'dischargeOrTestFile', maxCount: 1 },
  ]),
    value.updateMedicalReimbursement
  );

  app.put(
    "/updateMedicalReimbursementApprovalStatus",
    [jwt.verifyToken],
    value.updateMedicalReimbursementApprovalStatus
  );
}