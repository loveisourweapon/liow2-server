var config = require('./config/config'),
    express = require('express'),
    app = express(),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    mongoose = require('mongoose'),
    passport = require('passport');

// Configure routes
var auth = require('./routes/auth')(config, passport),
    routes = require('./routes/index');

// Connect to database
var db = mongoose.connection,
    debug = require('debug')('liow2:mongo');
mongoose.connect(config.db.url);

db.on('error', function(err) {
  debug('Connection error: ' + err.message);
});
db.once('open', function() {
  debug('Connected to ' + config.db.url);
});

// Add express middleware
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());

// Ignore logging for testing and Travis CI environments
if (app.get('env') !== 'testing' && app.get('env') !== 'travis') {
  app.use(logger('dev'));
}

// Add CORS (Cross-origin Resource Sharing) support
app.use(cors());
app.options('*', cors()); // CORS OPTIONS pre-flight request

// Add auth routes then use bearer auth for remaining routes
app.use('/auth', auth);
app.use(passport.authenticate('bearer', { session: false }));

// Add remaining routes
app.use('/', routes);

// Catch 404 and forward to error handler
app.use(function __catch404(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  return next(err);
});

// Error handlers
// Development error handler, will print stacktrace
app.use(function __errorHandlerDev(err, req, res, next) { // jshint ignore:line
  if (app.get('env') !== 'development') {
    return next(err);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: err
  });
});

// Production error handler, no stacktraces leaked to user
app.use(function __errorHandlerProd(err, req, res, next) { // jshint ignore:line
  res.status(err.status || 500).json({
    message: err.message,
    error: {}
  });
});

module.exports = app;
