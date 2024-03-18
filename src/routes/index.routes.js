const app = require('express')();

require("./categories/categories.routes")(app);
require("./categories/department.routes")(app);
require("./categories/designation.routes")(app);
require("./employee/employeeProfile.routes")(app);
module.exports = app;

