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
var db = mongoose.connection;
mongoose.connect(config.db.url);

db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', function() {
  console.log('Connected to ' + config.db.url);
});

// Add express middleware
app.use(express.static('public'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());

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
  next(err);
});

// Error handlers
// Development error handler, will print stacktrace
if (app.get('env') === 'development') {
  app.use(function __errorHandlerDev(err, req, res) {
    res.status(err.status || 500).json({
      message: err.message,
      error: err
    });
  });
}

// Production error handler, no stacktraces leaked to user
app.use(function __errorHandlerProd(err, req, res) {
  res.status(err.status || 500).json({
    message: err.message,
    error: {}
  });
});

module.exports = app;
