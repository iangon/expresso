const express = require("express");
const cors = require("cors");
const errorHandler = require("errorhandler");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const app = express();
const apiRouter = require("./api/api");

const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(errorHandler());
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use("/", apiRouter);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

module.exports = app;
