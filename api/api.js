const express = require("express");
const apiRouter = express.Router();
const employeesRouter = require("./employees");
const menusRouter = require("./menus");

apiRouter.use("/api/employees", employeesRouter);
apiRouter.use("/api/menus", menusRouter);

module.exports = apiRouter;
