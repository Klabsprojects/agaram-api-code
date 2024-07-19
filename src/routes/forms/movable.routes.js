module.exports = (app) => {
    const value = require("../../controllers/forms/movable.controller");
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
    "/getMovable",
    value.getMovable
  );

  app.post(
    "/addMovable",
    upload.single('orderFile'),
    value.addMovable
  );
    
  app.put(
    "/updateMovable",
    value.updateMovable
  );

  app.put(
    "/updateMovableApprovalStatus",
    value.updateMovableApprovalStatus
  );
}