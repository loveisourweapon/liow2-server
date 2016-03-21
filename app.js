var config = require('./utils/config')(),
    express = require('express'),
    app = express(),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    mongoose = require('mongoose'),
    HttpError = require('./utils/general').HttpError;

// Configure routes
var auth = require('./routes/auth'),
    users = require('./routes/users'),
    deeds = require('./routes/deeds'),
    acts = require('./routes/acts'),
    countries = require('./routes/countries'),
    groups = require('./routes/groups'),
    campaigns = require('./routes/campaigns'),
    likes = require('./routes/likes'),
    comments = require('./routes/comments'),
    feeds = require('./routes/feeds');

// Connect to database
var db = mongoose.connection,
    dbUrl = config.db.url,
    debug = require('debug')('liow2:mongo');
mongoose.connect(dbUrl);
mongoose.Promise = Promise;

db.on('error', err => {
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

// Add routes
app.use('/auth', auth);
app.use('/users', users);
app.use('/deeds', deeds);
app.use('/acts', acts);
app.use('/countries', countries);
app.use('/groups', groups);
app.use('/campaigns', campaigns);
app.use('/likes', likes);
app.use('/comments', comments);
app.use('/feeds', feeds);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  return next(new HttpError('Not Found', 404));
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
