const app = require('express')();

require("./categories/categories.routes")(app);
module.exports = app;

