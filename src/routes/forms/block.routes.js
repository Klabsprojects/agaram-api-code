module.exports = (app) => {
    const value = require("../../controllers/forms/block.controller");
   app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/getBlock",
    value.getBlock
  );

  app.post(
    "/addBlock",
    value.addBlock
  );

  app.put(
    "/updateBlock",
    value.updateBlock
  );
}