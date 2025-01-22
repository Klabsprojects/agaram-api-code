module.exports = (app) => {
    const value = require("../../controllers/services/special_entries.controller");
    const {  jwt, ERRORS, SUCCESS, Op } = require("../../helpers/index.helper");
    const CommonFileUpload = require("../../middlewares/commonfileupload");

   app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/addSpecialEntries",
    [jwt.verifyToken],
    CommonFileUpload('SpecialEntiriesFile').single('SpecialEntiriesFile'),
    value.addSpecialEntries
  );

  app.get(
    "/getSpecialEntries",
    [jwt.verifyToken],
    value.getSpecialEntries
  );

  app.delete('/deleteSpecialEntries/:id',
    [jwt.verifyToken],
     value.deleteSpecialEntries);


    app.put(
    "/updateSpecialEntries",
    [jwt.verifyToken],
    CommonFileUpload('SpecialEntiriesFile').single('SpecialEntiriesFile'),
    value.updateSpecialEntries
    );

}