var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var ticketsRouter = require("./routes/tickets");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  cors({
    origin: [process.env.APP_URL, "http://localhost:3000"],
    credentials: true,
  })
);

app.use("/api", indexRouter);
app.use("/api/users", usersRouter);
app.use("/api/tickets", ticketsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.status(err.status || 500).json({
    message: err.message,
    error: req.app.get("env") === "development" ? err : {},
  });
});

module.exports = app;
