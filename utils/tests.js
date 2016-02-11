var config = require('../config'),
    request = require('supertest-as-promised'),
    mongoose = require('mongoose'),
    app = require('../app'),
    User = require('../models/User');

// Default login credentials
var credentials = {
  email: 'test@example.com',
  username: 'username',
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
  return new User(credentials).save();
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
function getApiToken() {
  return new Promise((resolve, reject) => {
    dbConnect()
      .then(() => saveUser(credentials))
      .then(() => {
        return request(app)
          .post('/auth/login')
          .send(`email=${credentials.email}`)
          .send(`password=${credentials.password}`)
          .then(res => {
            if (!res.body.token) {
              return reject(new Error('Failed getting accessing token'));
            }

            resolve(res.body.token);
          })
          .catch(err => reject(err));
      })
      .catch(err => reject(err));
  });
}

module.exports = {
  credentials,
  dbConnect,
  dbDisconnect,
  saveUser,
  removeUsers,
  getApiToken
};
