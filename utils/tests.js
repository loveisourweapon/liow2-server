var config = require('../config'),
    request = require('supertest'),
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
 * @param {Function} done
 */
function dbConnect(done) {
  if (mongoose.connection.readyState === 0) {
    mongoose.connect(config.db.url)
      .then(() => done())
      .catch(err => done(err));
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
    .catch(err => done(err));
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

/**
 * Get a token for testing the API
 * Connects to the database and saves a testing User
 *
 * @param {Function} done
 */
function getApiToken(done) {
  dbConnect((err) => {
    if (err) { return done(err); }

    saveUser(credentials, (err) => {
      if (err) { return done(err); }

      request(app)
        .post('/auth/login')
        .send(`email=${credentials.email}`)
        .send(`password=${credentials.password}`)
        .end((err, res) => {
          if (err) { return done(err); }

          if (!res.body.token) {
            return done(new Error('Failed getting accessing token'));
          }

          done(null, res.body.token);
        });
    });
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
