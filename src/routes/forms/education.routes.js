module.exports = (app) => {
    const value = require("../../controllers/forms/education.controller");
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
    "/getEducation",
    value.getEducation
  );

  app.post(
    "/addEducation",
    //upload.single('orderFile'),
    value.addEducation
  );
}