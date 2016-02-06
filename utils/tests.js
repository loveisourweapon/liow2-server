var config = require('../config'),
    request = require('supertest'),
    mongoose = require('mongoose'),
    app = require('../app');

var User = require('../models/User'),
    ObjectId = require('mongoose').Types.ObjectId;

// Default login credentials
var credentials = {
  email: 'test@example.com',
  username: 'username',
  password: 'password',
  groups: [ObjectId()]
};

/**
 * Create a new database connection if there isn't an existing connection
 *
 * @param {Function} done
 */
function dbConnect(done) {
  if (mongoose.connection.readyState === 0) {
    mongoose.connect(config.db.url)
      .then(() => done())
      .catch((err) => done(err));
  } else {
    done();
  }
}

/**
 * Disconnect database connection
 *
 * @param {Function} done
 */
function dbDisconnect(done) {
  mongoose.disconnect()
    .then(() => done())
    .catch((err) => done(err));
}

/**
 * Save a User to the database
 *
 * @param {Object} credentials
 * @param {Function} done
 */
function saveUser(credentials, done) {
  var user = new User(credentials);

  user.save((err, user) => {
    if (err) { return done(err); }

    done(null, user);
  });
}

/**
 * Remove all Users from the database
 *
 * @param {Function} done
 */
function removeUsers(done) {
  User.remove({}, (err) => {
    if (err) { return done(err); }

    done();
  });
}

module.exports = {
  credentials,
  dbConnect,
  dbDisconnect,
  saveUser,
  removeUsers
};
