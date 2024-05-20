const app = require('express')();

require("./categories/categories.routes")(app);
require("./categories/department.routes")(app);
require("./categories/designation.routes")(app);
require("./employee/employeeProfile.routes")(app);
require("./employee/employeeUpdate.routes")(app);
require("./employee/degree.routes")(app);
require("./forms/officialForeignVisit.routes")(app);
require("./forms/saf.routes")(app);
require("./forms/privateForeignVisit.routes")(app);
require("./forms/immovableMovable.routes")(app);
require("./forms/officersTour.routes")(app);
require("./login/login.route")(app);
require("./forms/ltc.routes")(app);
module.exports = app;

