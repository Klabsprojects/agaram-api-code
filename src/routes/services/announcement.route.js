module.exports = (app) => {
    const value = require("../../controllers/services/announcement.controller");
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
    "/addAnnouncement",
    //[jwt.verifyToken],
    value.addAnnouncement
  );

  app.get(
    "/getRecentAnnouncements",
    //[jwt.verifyToken],
    value.getRecentAnnouncements
  );

    app.put(
    "/updateAnnouncement/:id",
    value.updateAnnouncement
    );

    app.delete('/deleteAnnouncement/:id',
     // [jwt.verifyToken],
    value.deleteAnnouncement);
      

}