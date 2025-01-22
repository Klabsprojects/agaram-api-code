module.exports = (app) => {
    const value = require("../../controllers/forms/officersTour.controller");
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
    "/getOfficersTour",
    [jwt.verifyToken],
    value.getOfficersTour
  );

  app.get('/getOfficersTourById/:id',
    [jwt.verifyToken],
     value.getOfficersTourById);

  app.post(
    "/addOfficersTour",
    [jwt.verifyToken],
    upload.single('orderFile'),
    value.addOfficersTour
  );

  app.put(
    "/updateOfficersTour/:id",
    [jwt.verifyToken],
    upload.single('orderFile'),
    value.updateOfficersTour
  );

  app.delete('/deleteOfficersTour/:id',
    [jwt.verifyToken],
     value.deleteOfficersTour);


}