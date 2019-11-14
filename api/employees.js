const express = require("express");
const sqlite3 = require("sqlite3");
const employeesRouter = express.Router();
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || "./database.sqlite"
);

employeesRouter.get("/", (req, res, next) => {
  const sql = `SELECT * FROM Employee WHERE is_current_employee = 1`;
  db.all(sql, (err, employees) => {
    if (err) {
      next(err);
    } else if (!employees) {
      res.status(404).send();
    } else {
      res.send({ employees: employees });
    }
  });
});

employeesRouter.param("employeeId", (req, res, next, employeeId) => {
  const sql = `SELECT * FROM Employee WHERE id = $employeeId`;
  const values = { $employeeId: employeeId };

  db.get(sql, values, (err, employee) => {
    if (err) {
      next(err);
    } else if (!employee) {
      res.status(404).send();
    } else {
      req.employee = employee;
      next();
    }
  });
});

employeesRouter.get("/:employeeId", (req, res, next) => {
  res.send({ employee: req.employee });
});

employeesRouter.post("/", (req, res, next) => {
  const name = req.body.employee.name;
  const position = req.body.employee.position;
  const wage = req.body.employee.wage;

  if (!name || !position || !wage) {
    return res.status(400).send();
  }

  const sql = `INSERT INTO 
    Employee (name, position, wage) 
    VALUES ($name, $position, $wage)`;
  const values = { $name: name, $position: position, $wage: wage };

  db.run(sql, values, function(err) {
    if (err) {
      next(err);
    } else {
      const employeeSql = `SELECT * FROM Employee WHERE id = ${this.lastID}`;
      db.get(employeeSql, (err, employee) => {
        if (err) {
          next(err);
        } else {
          res.status(201).send({ employee: employee });
        }
      });
    }
  });
});

employeesRouter.put("/:employeeId", (req, res, next) => {
  const name = req.body.employee.name;
  const position = req.body.employee.position;
  const wage = req.body.employee.wage;
  const employeeId = req.params.employeeId;

  if (!name || !position || !wage) {
    return res.status(400).send();
  }

  const sql = `UPDATE Employee SET 
    name = $name, 
    position = $position, 
    wage = $wage
    WHERE id = $employeeId
  `;

  const values = {
    $name: name,
    $position: position,
    $wage: wage,
    $employeeId: employeeId
  };

  db.run(sql, values, function(err) {
    if (err) {
      next(err);
    } else {
      const employeeSql = `SELECT * FROM Employee WHERE id = ${employeeId}`;
      db.get(employeeSql, (err, employee) => {
        if (err) {
          next(err);
        } else {
          res.status(200).send({ employee: employee });
        }
      });
    }
  });
});

employeesRouter.delete("/:employeeId", (req, res, next) => {
  const employeeId = req.params.employeeId;
  const sql = `UPDATE Employee SET is_current_employee = 0 WHERE id = $employeeId`;
  const values = { $employeeId: employeeId };

  db.run(sql, values, err => {
    if (err) {
      next(err);
    } else {
      const employeeSql = `SELECT * FROM Employee WHERE id = ${employeeId}`;
      db.get(employeeSql, (err, employee) => {
        if (err) {
          next(err);
        } else {
          res.status(200).send({ employee: employee });
        }
      });
    }
  });
});

module.exports = employeesRouter;
