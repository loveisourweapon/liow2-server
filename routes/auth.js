var jwt = require('jsonwebtoken'),
    express = require('express'),
    router = express.Router();

var LocalStrategy = require('passport-local').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
    BearerStrategy = require('passport-http-bearer').Strategy;

var User = require('../models/User');

module.exports = function __setupAuthRouter(config, passport) {
  // Configure passport LocalStrategy
  passport.use(new LocalStrategy({
      usernameField: 'email',
      passReqToCallback: false // TODO: Investigate this
    }, function __verifyLocal(email, password, done) {
      User.findOne({ email: email }, function __userFindOne(err, user) {
        if (err) { return done(err); }

        if (!user) {
          return done(null, false, { message: 'Incorrect email' });
        }

        user.validatePassword(password, function __userValidatePassword(err, isMatch) {
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
      clientID: config.auth.facebook.clientID,
      clientSecret: config.auth.facebook.clientSecret,
      callbackURL: config.auth.facebook.callbackURL,
      enableProof: false // TODO: Investigate this
    }, function __verifyFacebook(accessToken, refreshToken, profile, done) {
      User.findOrCreate({
        email: profile.emails[0].value,
        name: profile.displayName,
        facebook: {
          id: profile.id,
          accessToken: accessToken,
          refreshToken: refreshToken
        }
      }, function(err, user) {
        if (err) { return done(err); }

        done(null, user);
      });
    }
  ));

  // Configure passport BearerStrategy
  passport.use(new BearerStrategy(
    function __verifyBearer(token, done) {
      User.findOne({ accessToken: token }, function __userFindOne(err, user) {
        if (err) { return done(err); }

        if (!user) {
          return done(null, false, { message: 'Invalid token' });
        }

        done(null, user, { scope: 'all' });
      });
    }
  ));

  // Receive normal form login requests at /auth/login
  router.post('/login', function __postLogin(req, res, next) {
    passport.authenticate('local', { session: false }, function __localAuthanticate(err, user, response) {
      if (err) { return next(err); }

      if (!user) {
        return res.status(401).json({ message: response.message || 'Not logged in' });
      }

      // TODO: set token expiry?
      var token = jwt.sign(user.email, config.secret);
      user.accessToken = token;
      user.save(function __userSave(err, user) {
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
      failureRedirect: config.loginPage,
      session: false
    }),
    function __getFacebookCallback(req, res, next) {
      // TODO: set token expiry?
      var token = jwt.sign(req.user.email, config.secret);
      req.user.accessToken = token;
      req.user.save(function __userSave(err, user) {
        if (err) { return next(err); }

        res.redirect(config.loginPage + '?access_token=' + user.accessToken);
      });
    }
  );

  return router;
};
