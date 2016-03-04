var _ = require('lodash'),
    jwt = require('jsonwebtoken'),
    request = require('request'),
    config = require('../config'),
    express = require('express'),
    router = express.Router(),
    HttpError = require('../utils/general').HttpError,
    User = require('../models/User');

/**
 * Login with Facebook
 * POST /auth/facebook
 */
router.post(
  '/facebook',
  (req, res, next) => {
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
    request.get({ url: accessTokenUrl, qs: params, json: true }, function (err, response, accessToken) {
      if (err || response.statusCode !== 200) {
        return next(new HttpError(err.message || accessToken.error.message, 500));
      }

      // Step 2. Retrieve profile information about the current user.
      request.get({ url: graphApiUrl, qs: accessToken, json: true }, function (err, response, profile) {
        if (err || response.statusCode !== 200) {
          return next(new HttpError(err.message || profile.error.message, 500));
        }

        if (req.headers.authorization) {
          User.findOne({ 'facebook.id': profile.id })
            .exec()
            .then(() => next(new HttpError('There is already a Facebook account that belongs to you', 409)))
            .catch(() => {
              var token = req.headers.authorization.split(' ')[1];
              jwt.verify(token, config.secret, (err, userId) => {
                if (err) { return next(err); }

                User.findById(userId)
                  .exec()
                  .then(user => {
                    user.lastSeen = new Date();
                    user.facebook = {
                      id: profile.id,
                      accessToken: accessToken.access_token
                    };
                    user.picture = `https://graph.facebook.com/v2.5/${profile.id}/picture?width=200&height=200`;
                    user.firstName = profile.first_name;
                    user.lastName = profile.last_name;
                    if (
                      _.has(req.body, 'group') &&
                      !_.some(user.groups, group => String(group) === String(req.body.group))
                    ) {
                      user.groups.push(req.body.group);
                    }

                    return user.save();
                  })
                  .then(user => res.send({ token: jwt.sign(user.id, config.secret) }))
                  .catch(err => next(err));
              });
            });
        } else {
          // Step 3b. Create a new user account or return an existing one.
          User.findOne({ email: profile.email })
            .exec()
            .catch(err => {
              if (err.message !== 'Not Found') { return next(err); }

              var user = new User();
              user.email = profile.email;
              return Promise.resolve(user);
            })
            .then(user => {
              user.lastSeen = new Date();
              user.facebook = {
                id: profile.id,
                accessToken: accessToken.access_token
              };
              user.picture = `https://graph.facebook.com/v2.5/${profile.id}/picture?width=200&height=200`;
              user.firstName = profile.first_name;
              user.lastName = profile.last_name;
              if (
                _.has(req.body, 'group') &&
                !_.some(user.groups, group => String(group) === String(req.body.group))
              ) {
                user.groups.push(req.body.group);
              }

              return user.save();
            })
            .then(user => res.send({ token: jwt.sign(user.id, config.secret) }))
            .catch(err => next(err));
        }
      });
    });
  }
);

/**
 * Login with email and password
 * POST /auth/login
 */
router.post(
  '/login',
  (req, res, next) => {
    User.findOne({ email: req.body.email }).exec()
      .then(user => {
        return user.validatePassword(req.body.password)
          .then(isMatch => {
            if (!isMatch) {
              throw new HttpError('Invalid email and/or password', 401);
            }

            user.lastSeen = new Date();
            return user.save();
          })
          .then(user => res.send({ token: jwt.sign(user.id, config.secret) }))
          .catch(err => next(err));
      })
      .catch(() => next(new HttpError('Invalid email and/or password', 401)));
  }
);

module.exports = router;
