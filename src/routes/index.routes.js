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
require("./forms/movable.routes")(app);
require("./forms/immovable.routes")(app);
require("./forms/officersTour.routes")(app);
require("./forms/medicalReimbursement.routes")(app);
require("./forms/education.routes")(app);
require("./forms/intimation.routes")(app);
require("./login/login.route")(app);
require("./login/role.route")(app);
require("./forms/ltc.routes")(app);
require("./forms/safApplication.routes")(app);
require("./forms/block.routes")(app);
require("./forms/safAllocation.routes")(app);
require("./employee/leave.routes")(app);
require("./employee/training.routes")(app);
module.exports = app;

