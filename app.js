var config = require('./utils/config')();
var express = require('express');
var app = express();
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');
var mongoose = require('mongoose');
var HttpError = require('./utils/general').HttpError;

// Configure routes
var auth = require('./routes/auth');
var users = require('./routes/users');
var deeds = require('./routes/deeds');
var acts = require('./routes/acts');
var countries = require('./routes/countries');
var groups = require('./routes/groups');
var campaigns = require('./routes/campaigns');
var likes = require('./routes/likes');
var comments = require('./routes/comments');
var feeds = require('./routes/feeds');
var salvationTestimonies = require('./routes/salvationTestimonies');

// Connect to database
var db = mongoose.connection;
var dbUrl = config.db.url;
var debug = require('debug')('liow2:mongo');
mongoose.connect(dbUrl);
mongoose.Promise = Promise;

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
app.use(cors({ origin: config.client_urls }));
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
app.use('/salvations', salvationTestimonies);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  return next(new HttpError('Not Found', 404));
});

// Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 400).json({
    message: err.message,
    error: err,
  });
});

module.exports = app;
