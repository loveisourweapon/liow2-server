var config = require('../config/config'),
    request = require('supertest'),
    mongoose = require('mongoose'),
    app = require('../app'),
    User = require('../models/User');

// Default login credentials
var credentials = {
  email: 'test@example.com',
  password: 'password'
};

// Create a new database connection if there isn't an existing connection
function dbConnect(done) {
  if (mongoose.connection.readyState === 0) {
    mongoose.connect(config.db.url, function __mongooseConnect(err) {
      if (err) { return done(err); }

      return done();
    });
  } else {
    return done();
  }
} // dbConnect()

// Disconnect database connection
function dbDisconnect(done) {
  mongoose.disconnect(function __mongooseDisconnect(err) {
    if (err) { return done(err); }

    return done();
  });
} // dbDisconnect()

// Save a User to the database
function saveUser(credentials, done) {
  var user = new User(credentials);

  user.save(function __userSave(err, user) {
    if (err) { return done(err); }

    return done(null, user);
  });
} // saveUser()

// Remove all Users from the database
function removeUsers(done) {
  User.remove({}, function __userRemove(err) {
    if (err) { return done(err); }

    return done();
  });
} // removeUsers()

// Get an accessToken for testing the API
// Connects to the database and saves a testing User
function getAccessToken(done) {
  dbConnect(function __dbConnect(err) {
    if (err) { return done(err); }

    saveUser(credentials, function __saveUser(err) {
      if (err) { return done(err); }

      request(app)
        .post('/auth/login')
        .send('email=' + credentials.email)
        .send('password=' + credentials.password)
        .end(function __requestEnd(err, res) {
          if (err) { return done(err); }

          if (!res.body.accessToken) {
            return done(new Error('Failed getting accessing token'));
          }

          return done(null, res.body.accessToken);
        });
    });
  });
} // getAccessToken()

module.exports = {
  credentials: credentials,
  dbConnect: dbConnect,
  dbDisconnect: dbDisconnect,
  saveUser: saveUser,
  removeUsers: removeUsers,
  getAccessToken: getAccessToken
};
