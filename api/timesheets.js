const express = require("express");
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || "./database.sqlite"
);

const timesheetsRouter = express.Router({ mergeParams: true });

timesheetsRouter.get("/", (req, res, next) => {
  const employeeId = req.params.employeeId;

  const sql = `SELECT * FROM Timesheet WHERE employee_id = ${employeeId}`;
  db.all(sql, (err, timesheets) => {
    if (err) {
      next(err);
    } else {
      res.send({ timesheets: timesheets });
    }
  });
});

timesheetsRouter.post("/", (req, res, next) => {
  const employeeId = req.params.employeeId;
  const hours = req.body.timesheet.hours;
  const rate = req.body.timesheet.rate;
  const date = req.body.timesheet.date;

  if (!hours || !rate || !date) {
    return res.status(400).send();
  }

  const sql = `INSERT INTO Timesheet (employee_id, hours, rate, date) 
    VALUES ($employeeId, $hours, $rate, $date)`;
  const values = {
    $employeeId: employeeId,
    $hours: hours,
    $rate: rate,
    $date: date
  };
  db.run(sql, values, function(err) {
    if (err) {
      next(err);
    } else {
      const newTimesheetSql = `SELECT * FROM Timesheet WHERE id = ${this.lastID}`;
      db.get(newTimesheetSql, (err, timesheet) => {
        if (err) {
          next(err);
        } else {
          res.status(201).send({ timesheet: timesheet });
        }
      });
    }
  });
});

timesheetsRouter.param("timesheetId", (req, res, next, timesheetId) => {
  const sql = `SELECT * FROM Timesheet WHERE id = ${timesheetId}`;
  db.get(sql, (err, timesheet) => {
    if (err) {
      next(err);
    } else if (!timesheet) {
      res.status(404).send();
    } else {
      req.timesheet = timesheet;
      next();
    }
  });
});

timesheetsRouter.put("/:timesheetId", (req, res, next) => {
  const employeeId = req.params.employeeId;
  const timesheetId = req.params.timesheetId;
  const hours = req.body.timesheet.hours;
  const rate = req.body.timesheet.rate;
  const date = req.body.timesheet.date;

  if (!hours || !rate || !date) {
    return res.status(400).send();
  }

  const sql = `UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date, employee_id = $employeeId WHERE id = $timesheetId`;
  const values = {
    $employeeId: employeeId,
    $timesheetId: timesheetId,
    $hours: hours,
    $rate: rate,
    $date: date
  };

  db.run(sql, values, function(err) {
    if (err) {
      next(err);
    } else {
      const updatedTimesheetSql = `SELECT * FROM Timesheet WHERE id = ${timesheetId}`;
      db.get(updatedTimesheetSql, (err, timesheet) => {
        if (err) {
          next(err);
        } else {
          res.status(200).send({ timesheet: timesheet });
        }
      });
    }
  });
});

timesheetsRouter.delete("/:timesheetId", (req, res, next) => {
  const timesheetId = req.params.timesheetId;
  const sql = `DELETE FROM Timesheet WHERE id = $timesheetId`;
  const values = { $timesheetId: timesheetId };

  db.run(sql, values, err => {
    if (err) {
      next(err);
    } else {
      if (err) {
        next(err);
      } else {
        res.status(204).send();
      }
    }
  });
});

module.exports = timesheetsRouter;
