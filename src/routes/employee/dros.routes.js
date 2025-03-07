module.exports = (app) => {
    const value = require("../../controllers/employee/dros.controller");
    const {  jwt, ERRORS, SUCCESS, Op } = require("../../helpers/index.helper");
   const CommonFileUpload = require("../../middlewares/commonfileupload");
   app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/getDros",
    [jwt.verifyToken],
    value.getDros
  );

  app.get(
    "/getDrosCountByDate",
    [jwt.verifyToken],
    value.getDrosCountByDate
  );

  app.post(
    "/addDros",
    [jwt.verifyToken],
    CommonFileUpload('DroFile').single('DroFile'),
    value.addDros
  );

  app.put(
    "/updateDRO",
    [jwt.verifyToken],
    CommonFileUpload('DroFile').single('DroFile'),
    value.updateDRO
  );

  app.delete('/DeleteDro/:id',
    [jwt.verifyToken],
  value.deleteDRO);
    
 
}