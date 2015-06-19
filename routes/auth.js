var config = require('../config/config'),
    jwt = require('jsonwebtoken'),
    express = require('express'),
    router = express.Router();

var LocalStrategy = require('passport-local').Strategy,
    BearerStrategy = require('passport-http-bearer').Strategy;

var User = require('../models/User');

module.exports = function(config, passport) {
  // Configure passport LocalStrategy
  passport.use(new LocalStrategy({
      usernameField: 'email',
      passReqToCallback: false // TODO: Investigate this
    }, function __verifyLocal(email, password, done) {
      User.findOne({ email: email }, function(err, user) {
        if (err) return done(err);

        if (!user) return done(null, false, { message: 'Incorrect email.' });

        user.validatePassword(password, function(err, isMatch) {
          if (err) return done(err);

          if (!isMatch) return done(null, false, { message: 'Incorrect password.' });

          return done(null, user);
        });
      });
    }
  ));

  // Configure passport BearerStrategy
  passport.use(new BearerStrategy(
    function __verifyBearer(token, done) {
      User.findOne({ accessToken: token }, function (err, user) {
        if (err) return done(err);

        if (!user) return done(null, false, { message: 'Invalid token.' });

        return done(null, user, { scope: 'all' });
      });
    }
  ));

  // Receive normal form login requests at /auth/login
  router.post('/login', function(req, res, next) {
    passport.authenticate('local', { session: false }, function(err, user, info) {
      if (err) return next(err);

      if (!user) return res.status(401).json({ message: 'Not logged in' });

      // TODO: set token expiry?
      var token = jwt.sign(user.email, config.secret);
      user.accessToken = token;
      user.save(function __save(err, user) {
        if (err) return next(err);

        res.status(200).json({ message: 'Logged in', accessToken: user.accessToken });
      });
    })(req, res, next);
  });

  return router;
};
