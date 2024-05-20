module.exports = (app) => {
    const value = require("../../controllers/forms/officialForeignVisit.controller");
   //const { joi, cache } = require("../../helpers/index.helper");
   //const {  jwt, ERRORS, SUCCESS, Op } = require("../../helpers/index.helper");

   const upload = require("../../middlewares/upload")
   app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/getVisit",
    value.getVisit
  );

  app.post(
    "/addVisit",
    //upload.single('politicalClearance'),
    upload.fields([
      { name: 'politicalClearance', maxCount: 1 }, 
      { name: 'fcraClearance', maxCount: 1 },
      { name: 'orderFile', maxCount: 1 }
  ]),

    value.addVisit
  );
}