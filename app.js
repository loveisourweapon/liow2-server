var config = require('./config'),
    express = require('express'),
    app = express(),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    mongoose = require('mongoose');

// Configure routes
var auth = require('./routes/auth'),
    deeds = require('./routes/deeds'),
    news = require('./routes/news'),
    acts = require('./routes/acts'),
    countries = require('./routes/countries'),
    groups = require('./routes/groups'),
    likes = require('./routes/likes'),
    comments = require('./routes/comments');

// Connect to database
var db = mongoose.connection,
    dbUrl = process.env.LIOW_DB_URL || config.db.url,
    debug = require('debug')('liow2:mongo');
mongoose.connect(dbUrl);

db.on('error', (err) => {
  debug(`Connection error: ${err.message}`);
});
db.once('open', () => {
  debug(`Connected to ${dbUrl}`);
});

// Add express middleware
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Ignore logging for testing environments
if (app.get('env') !== 'testing') {
  app.use(logger('dev'));
}

// Add CORS (Cross-origin Resource Sharing) support
app.use(cors());
app.options('*', cors()); // CORS OPTIONS pre-flight request

// Add non-authenticated routes
app.use('/deeds', deeds);
app.use('/news', news);
app.use('/acts', acts);
app.use('/countries', countries);
app.use('/groups', groups);
app.use('/likes', likes);
app.use('/comments', comments);

// Add auth routes then use bearer auth for remaining routes
app.use('/auth', auth);

// Add authenticated routes
// TODO: add authentication to individual routes instead of whole routers?

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('Not Found');
  err.status = 404;
  return next(err);
});

// Error handlers
// Development error handler, will print stacktrace
app.use((err, req, res, next) => {
  if (app.get('env') !== 'development') {
    return next(err);
  }

  res.status(err.status || 400).json({
    message: err.message,
    error: err
  });
});

// Production error handler, no stacktraces leaked to user
app.use((err, req, res, next) => { // jshint ignore:line
  res.status(err.status || 400).json({
    message: err.message,
    error: {}
  });
});

module.exports = app;
