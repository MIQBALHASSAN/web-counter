var createError = require('http-errors');
var express = require('express');
var path = require('path');
let fs = require('fs');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');

var app = express();

// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  '/images',
  express.static(path.join(__dirname, 'public/images/counter-style'))
);

// Function to get image paths
const getImagePaths = () => {
  const imagesDir = path.join(__dirname, 'public/images/counter-style');
  return fs.readdirSync(imagesDir).map((file) => ({
    path: `/images/counter-style/${file}`,
    name: path.basename(file, path.extname(file)),
  }));
};

app.locals.getImagePaths = getImagePaths;

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
