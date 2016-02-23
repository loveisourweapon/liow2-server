var _ = require('lodash'),
    jwt = require('jsonwebtoken'),
    config = require('../config'),
    request = require('supertest-as-promised'),
    mongoose = require('mongoose'),
    app = require('../app'),
    User = require('../models/User');

// Default login credentials
var credentials = {
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  password: 'password'
};

/**
 * Create a new database connection if there isn't an existing connection
 *
 * @returns {MongooseThenable}
 */
function dbConnect() {
  if (mongoose.connection.readyState === 0) {
    return mongoose.connect(config.db.url);
  } else {
    return Promise.resolve();
  }
}

/**
 * Disconnect database connection
 *
 * @returns {MongooseThenable}
 */
function dbDisconnect() {
  return mongoose.disconnect();
}

/**
 * Save a User to the database
 *
 * @param {object} credentials
 *
 * @returns {Promise}
 */
function saveUser(credentials) {
  return User.findOrCreate(credentials);
}

/**
 * Remove all Users from the database
 *
 * @returns {Promise}
 */
function removeUsers() {
  return User.remove({});
}

/**
 * Get a token for testing the API
 * Connects to the database and saves a testing User
 *
 * @returns {Promise}
 */
function getApiToken(extraCredentials) {
  return dbConnect()
    .then(() => saveUser(_.merge({}, extraCredentials || {}, credentials)))
    .then(user => jwt.sign(user.id, config.secret));
}

module.exports = {
  credentials,
  dbConnect,
  dbDisconnect,
  saveUser,
  removeUsers,
  getApiToken
};
