const app = require('express')();

require("./categories/categories.routes")(app);
require("./categories/department.routes")(app);
require("./categories/designation.routes")(app);
module.exports = app;

