var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var jsonwebtoken = require("jsonwebtoken");
var mongoose = require('mongoose');
mongoose.connect('mongodb://192.168.1.119:27017/coindelta',  { useMongoClient: true });

var index = require('./routes/index');
var users = require('./routes/UserRoute');
var transaction = require('./routes/TransactionRoute');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "POST, GET, DELETE, PUT, PATCH, OPTIONS");
  next();
});

app.use(function(req, res, next){
  if(req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0]==='JWT'){
    jsonwebtoken.verify(req.headers.authorization.split(' ')[1], 'SALT_KEY', function(err, decode){
      if(err) req.user = undefined;
      req.user = decode;
      next();
    });
  }else{
    req.user = undefined;
    next();
  }
});

app.use('/', index);
app.use('/user', users);
app.use('/admin', users);
app.use('/transaction', transaction);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;