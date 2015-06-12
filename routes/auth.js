var express = require('express'),
    router = express.Router();

var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/User');

module.exports = function(config, passport) {
  // Configure passport LocalStrategy
  passport.use(new LocalStrategy({
    usernameField: 'email'
  }, function(email, password, done) {
    User.findOne({ email: email }, function(err, user) {
      if (err) return done(err);

      if (!user) {
        return done(null, false, { message: 'Incorrect email.' });
      }

      user.validatePassword(password, function(err, isMatch) {
        if (err) return done(err);

        if (!isMatch) {
          return done(null, false, { message: 'Incorrect password.' });
        }

        return done(null, user);
      });
    });
  }));

  // Get normal form login requests at /auth/login
  router.post('/login',
    passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/login.html',
      session: false
    })
  );

  return router;
};
