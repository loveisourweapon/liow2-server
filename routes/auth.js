var jwt = require('jsonwebtoken'),
    express = require('express'),
    router = express.Router();

var LocalStrategy = require('passport-local').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
    BearerStrategy = require('passport-http-bearer').Strategy;

var User = require('../models/User');

module.exports = function(config, passport) {
  // Configure passport LocalStrategy
  passport.use(new LocalStrategy({
      usernameField: 'email',
      passReqToCallback: false // TODO: Investigate this
    }, (email, password, done) => {
      User.findOne({ email: email }, (err, user) => {
        if (err) { return done(err); }

        if (!user) {
          return done(null, false, { message: 'Incorrect email' });
        }

        user.validatePassword(password, (err, isMatch) => {
          if (err) { return done(err); }

          if (!isMatch) {
            return done(null, false, { message: 'Incorrect password' });
          }

          done(null, user);
        });
      });
    }
  ));

  // Configure passport FacebookStrategy
  passport.use(new FacebookStrategy({
      clientID: process.env.LIOW_AUTH_FACEBOOK_CLIENT_ID || config.auth.facebook.clientID,
      clientSecret: process.env.LIOW_AUTH_FACEBOOK_CLIENT_SECRET || config.auth.facebook.clientSecret,
      callbackURL: process.env.LIOW_AUTH_FACEBOOK_CALLBACK_URL || config.auth.facebook.callbackURL,
      enableProof: false // TODO: Investigate this
    }, (accessToken, refreshToken, profile, done) => {
      User.findOrCreate({
        email: profile.emails[0].value,
        name: profile.displayName,
        facebook: {
          id: profile.id,
          accessToken: accessToken,
          refreshToken: refreshToken
        }
      }, (err, user) => {
        if (err) { return done(err); }

        done(null, user);
      });
    }
  ));

  // Configure passport BearerStrategy
  passport.use(new BearerStrategy((token, done) => {
    User.findOne({ accessToken: token }, (err, user) => {
      if (err) { return done(err); }

      if (!user) {
        return done(null, false, { message: 'Invalid token' });
      }

      done(null, user, { scope: 'all' });
    });
  }));

  // Receive normal form login requests at /auth/login
  router.post('/login', (req, res, next) => {
    passport.authenticate('local', { session: false }, (err, user, response) => {
      if (err) { return next(err); }

      if (!user) {
        return res.status(401).json({ message: response.message || 'Not logged in' });
      }

      // TODO: set token expiry?
      user.accessToken = jwt.sign(user.email, process.env.LIOW_SECRET || config.secret);
      user.save((err, user) => {
        if (err) { return next(err); }

        res.status(200).json({ message: 'Logged in', accessToken: user.accessToken });
      });
    })(req, res, next);
  });

  // Redirect the user to Facebook for authentication. When complete,
  // Facebook will redirect the user back to the application at
  //   /auth/facebook/callback
  router.get('/facebook',
    passport.authenticate('facebook', { scope: ['email'] })
  );

  // Facebook will redirect the user to this URL after approval. Finish the
  // authentication process by attempting to obtain an access token. If
  // access was granted, the user will be logged in. Otherwise,
  // authentication has failed.
  router.get('/facebook/callback',
    passport.authenticate('facebook', {
      failureRedirect: '/',
      session: false
    }), (req, res, next) => {
      // TODO: set token expiry?
      req.user.accessToken = jwt.sign(req.user.email, process.env.LIOW_SECRET || config.secret);
      req.user.save((err, user) => {
        if (err) { return next(err); }

        res.redirect(`/?access_token=${user.accessToken}`);
      });
    }
  );

  return router;
};
