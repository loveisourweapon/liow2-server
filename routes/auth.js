var config = require('../config'),
    _ = require('lodash'),
    moment = require('moment'),
    jwt = require('jsonwebtoken'),
    request = require('request'),
    router = require('express').Router(),
    mailUtils = require('../utils/mail'),
    HttpError = require('../utils/general').HttpError,
    User = require('../models/User');

/**
 * @apiIgnore Facebook login not available through public API
 * @api {post} /auth/facebook Login with Facebook
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
          User.findOne({ 'facebook.id': profile.id }).exec()
            .then(() => next(new HttpError('There is already a Facebook account that belongs to you', 409)))
            .catch(() => {
              var token = req.headers.authorization.split(' ')[1];
              jwt.verify(token, config.secret, (err, userId) => {
                if (err) { return next(err); }

                User.findById(userId).exec()
                  .then(user => {
                    user.confirmed = true;
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
          User.findOne({ email: profile.email }).exec()
            .catch(err => {
              if (err.message !== 'Not Found') { return next(err); }

              return Promise.resolve(new User({ email: profile.email }));
            })
            .then(user => {
              user.confirmed = true;
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
/**
 * @api {post} /auth/login Login with email and password
 * @apiVersion 1.0.0
 * @apiName PostAuthLogin
 * @apiGroup Auth
 * @apiPermission none
 *
 * @apiParam (Body) {string} email    User email address
 * @apiParam (Body) {string} password User password
 *
 * @apiParamExample {json} Request
 *   {
 *     "email": "user@example.com"
 *     "password": "password123"
 *   }
 *
 * @apiSuccess {string} token JWT token
 *
 * @apiSuccessExample {json} Response
 *   HTTP/1.1 200 OK
 *   {
 *     "token": "valid.jwt.token"
 *   }
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

            if (!user.confirmed && moment().isAfter(moment(user.created).add(3, 'days'))) {
              throw new HttpError('Please confirm your email address', 403);
            }

            user.lastSeen = new Date();
            return user.save();
          })
          .then(user => res.send({ token: jwt.sign(user.id, config.secret) }));
      })
      .catch(err => next(err.status === 403 ? err : new HttpError('Invalid email and/or password', 401)));
  }
);

/**
 * @api {get} /auth/forgot Forgot email address
 * @apiVersion 1.7.0
 * @apiName GetAuthForgot
 * @apiGroup Auth
 * @apiPermission none
 *
 * @apiParam {string} email User's email address
 *
 * @apiUse NoContentResponse
 */
router.get(
  '/forgot',
  (req, res, next) => {
    if (!req.query.email) {
      return next(new HttpError('Email address required'));
    }

    User.findOne({ email: req.query.email }).exec()
      .then(user => mailUtils.sendPasswordReset(user))
      .then(() => res.status(204).send())
      .catch(err => (
        err.message === 'Not Found' ?
          res.status(204).send() : // Don't disclose if user wasn't found
          next(err)
      ));
  }
);

/**
 * @api {get} /auth/confirm Re-send confirm email address
 * @apiVersion 1.7.0
 * @apiName GetAuthConfirm
 * @apiGroup Auth
 * @apiPermission none
 *
 * @apiParam {string} email User's email address
 *
 * @apiUse NoContentResponse
 */
router.get(
  '/confirm',
  (req, res, next) => {
    if (!req.query.email) {
      return next(new HttpError('Email address required'));
    }

    User.findOne({ email: req.query.email }).exec()
      .then(user => mailUtils.sendConfirmEmail(user))
      .then(() => res.status(204).send())
      .catch(err => (
        err.message === 'Not Found' ?
          res.status(204).send() : // Don't disclose if user wasn't found
          next(err)
      ));
  }
);

module.exports = router;
