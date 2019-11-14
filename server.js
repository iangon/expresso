const express = require("express");
const sqlite3 = require("sqlite3");
const app = express();
const db = new sqlite3.Database("./database.sqlite");
const PORT = process.env.TEST_DATABASE || 4000;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

module.exports = app;
