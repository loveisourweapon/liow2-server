var _ = require('lodash'),
    config = require('../config'),
    jwt = require('jsonwebtoken'),
    request = require('request'),
    express = require('express'),
    router = express.Router(),
    HttpError = require('../utils/general').HttpError;

var User = require('../models/User');

/**
 * Login with Facebook
 * POST /auth/facebook
 */
router.post('/facebook', function(req, res, next) {
  var fields = ['id', 'email', 'first_name', 'last_name', 'name'];
  var accessTokenUrl = 'https://graph.facebook.com/v2.5/oauth/access_token';
  var graphApiUrl = 'https://graph.facebook.com/v2.5/me?fields=' + fields.join(',');
  var params = {
    code: req.body.code,
    client_id: req.body.clientId,
    client_secret: config.auth.facebook.clientSecret,
    redirect_uri: req.body.redirectUri
  };

  // Step 1. Exchange authorization code for access token.
  request.get({ url: accessTokenUrl, qs: params, json: true }, function(err, response, accessToken) {
    if (response.statusCode !== 200) {
      return next(new HttpError(accessToken.error.message, 500));
    }

    // Step 2. Retrieve profile information about the current user.
    request.get({ url: graphApiUrl, qs: accessToken, json: true }, function(err, response, profile) {
      if (response.statusCode !== 200) {
        return next(new HttpError(profile.error.message, 500));
      }

      if (req.headers.authorization) {
        User.findOne({ 'facebook.id': profile.id }, function(err, existingUser) {
          if (existingUser) {
            return next(new HttpError('There is already a Facebook account that belongs to you', 409));
          }

          var token = req.headers.authorization.split(' ')[1];
          jwt.verify(token, config.secret, (err, userId) => {
            if (err) { return next(err); }

            User.findById(userId, function(err, user) {
              if (!user) {
                return next(new HttpError('User not found'));
              }

              user.facebook = { id: profile.id };
              user.picture = user.picture || `https://graph.facebook.com/v2.5/${profile.id}/picture?type=large`;
              user.name = user.name || profile.name;
              _.has(req.body, 'group') && user.groups.push(req.body.group);
              user.save(function(err, user) {
                if (err) { return next(err); }

                var token = jwt.sign(user.id, config.secret);
                res.send({ token: token });
              });
            });
          });
        });
      } else {
        // Step 3b. Create a new user account or return an existing one.
        User.findOne({ email: profile.email }, function(err, user) {
          if (!user) {
            user = new User();
            user.email = profile.email;
            user.username = profile.email;
            user.name = profile.name;
          }

          user.facebook = { id: profile.id };
          user.picture = `https://graph.facebook.com/v2.5/${profile.id}/picture?type=large`;
          _.has(req.body, 'group') && user.groups.push(req.body.group);
          user.save(function(err, user) {
            if (err) { return next(err); }

            var token = jwt.sign(user.id, config.secret);
            res.send({ token: token });
          });
        });
      }
    });
  });
});

/**
 * Login with email and password
 * POST /auth/login
 */
router.post('/login', function(req, res, next) {
  User.findOne({ email: req.body.email }, function(err, user) {
    if (!user) {
      return next(new HttpError('Invalid email and/or password', 401));
    }

    user.validatePassword(req.body.password, function(err, isMatch) {
      if (!isMatch) {
        return next(new HttpError('Invalid email and/or password', 401));
      }

      res.send({ token: jwt.sign(user.id, config.secret) });
    });
  });
});

module.exports = router;
