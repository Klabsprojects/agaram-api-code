module.exports = (app) => {
    const value = require("../../controllers/forms/movable.controller");
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
    "/getMovable",
    [jwt.verifyToken],
    value.getMovable
  );

  app.post(
    "/addMovable",
    [jwt.verifyToken],
    upload.single('orderFile'),
    value.addMovable
  );
    
  app.put(
    "/updateMovable",
    [jwt.verifyToken],
    upload.single('orderFile'),
    value.updateMovable
  );

  app.put(
    "/updateMovableApprovalStatus",
    [jwt.verifyToken],
    value.updateMovableApprovalStatus
  );
}