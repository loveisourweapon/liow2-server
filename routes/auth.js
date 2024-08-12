var config = require('../utils/config')(),
    has = require('lodash/has'),
    some = require('lodash/some'),
    moment = require('moment'),
    jwt = require('jsonwebtoken'),
    request = require('request'),
    router = require('express').Router(),
    mailUtils = require('../utils/mail'),
    HttpError = require('../utils/general').HttpError,
    User = require('../models/User'),
    Token = require('../models/Token');

/**
 * @apiIgnore Facebook login not available through public API
 * @api {post} /auth/facebook Login with Facebook
 */
router.post(
  '/facebook',
  (req, res, next) => {
    var fields = ['id', 'email', 'first_name', 'last_name', 'name'];
    var baseUrl = 'https://graph.facebook.com/v2.5';
    var accessTokenUrl = `${baseUrl}/oauth/access_token`;
    var graphApiUrl = `${baseUrl}/me?fields=${fields.join(',')}`;
    var params = {
      code: req.body.code,
      client_id: req.body.clientId,
      client_secret: config.auth.facebook.clientSecret,
      redirect_uri: req.body.redirectUri
    };

    // Step 1. Exchange authorization code for access token.
    request.get({ url: accessTokenUrl, qs: params, json: true }, (err, response, accessToken) => {
      if (err || response.statusCode !== 200) {
        return next(new HttpError(err.message || accessToken.error.message, 500));
      }

      // Step 2. Retrieve profile information about the current user.
      request.get({ url: graphApiUrl, qs: accessToken, json: true }, (err, response, profile) => {
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
                    user.picture = user.picture || `${baseUrl}/${profile.id}/picture?width=200&height=200`;

                    if (!has(user, 'firstName')) {
                      user.firstName = profile.first_name;
                      user.lastName = profile.last_name;
                    }

                    if (
                      has(req.body, 'group') &&
                      !some(user.groups, group => String(group) === String(req.body.group))
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
              user.picture = user.picture || `${baseUrl}/${profile.id}/picture?width=200&height=200`;

              if (!has(user, 'firstName')) {
                user.firstName = profile.first_name;
                user.lastName = profile.last_name;
              }

              if (
                has(req.body, 'group') &&
                !some(user.groups, group => String(group) === String(req.body.group))
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
 * @api {post} /auth/login Login with email and password
 * @apiVersion 1.7.5
 * @apiName PostAuthLogin
 * @apiGroup Auth
 * @apiPermission none
 *
 * @apiParam (Body) {string} email    User email address
 * @apiParam (Body) {string} password User password
 * @apiParam (Body) {string} [group]  Group ObjectId to add user to
 *
 * @apiParamExample {json} Request
 *   {
 *     "email": "user@example.com",
 *     "password": "password123",
 *     "group": "55f6c56186b959ac12490e1b"
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

            if (
              has(req.body, 'group') &&
              !some(user.groups, group => String(group) === String(req.body.group))
            ) {
              user.groups.push(req.body.group);
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
      .then(user => mailUtils.sendPasswordReset(user, req.headers.origin))
      .then(() => res.status(204).send())
      .catch(err => (
        err.message === 'Not Found' ?
          res.status(204).send() : // Don't disclose if user wasn't found
          next(err)
      ));
  }
);

/**
 * @api {post} /auth/reset Reset user's password
 * @apiVersion 1.7.0
 * @apiName PostAuthReset
 * @apiGroup Auth
 * @apiPermission none
 *
 * @apiParam (Body) {string} password New password
 * @apiParam (Body) {string} token    Password reset token
 *
 * @apiUse NoContentResponse
 */
router.post(
  '/reset',
  (req, res, next) => {
    Token.findOne({ token: req.body.token, expires: { $gt: new Date() } }).exec()
      .then(token => {
        return User.findById(token.user).exec()
          .then(user => {
            user.password = req.body.password;
            user.confirmed = true; // Reset password link also delivered to email
            return user.save();
          })
          .then(() => token.remove())
          .then(() => res.status(204).send());
      })
      .catch(err => next(err));
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
      .then(user => mailUtils.sendConfirmEmail(user, req.headers.origin))
      .then(() => res.status(204).send())
      .catch(err => (
        err.message === 'Not Found' ?
          res.status(204).send() : // Don't disclose if user wasn't found
          next(err)
      ));
  }
);

/**
 * @api {post} /auth/confirm Handle confirm email address
 * @apiVersion 1.7.0
 * @apiName PostAuthConfirm
 * @apiGroup Auth
 * @apiPermission none
 *
 * @apiParam (Body) {string} token Email confirmation token
 *
 * @apiUse NoContentResponse
 */
router.post(
  '/confirm',
  (req, res, next) => {
    Token.findOne({ token: req.body.token, expires: { $gt: new Date() } }).exec()
      .then(token => {
        return User.findByIdAndUpdate(token.user, { confirmed: true }).exec()
          .then(() => token.remove())
          .then(() => res.status(204).send());
      })
      .catch(err => next(err));
  }
);

/**
 * @apiIgnore Don't document this endpoint
 * @api {post} /auth/contact Send a contact email
 * 
 * I don't have a good home for this, so I'm putting it here for now
 */
router.post(
  '/contact',
  (req, res, next) => {
    mailUtils.sendContactEmail(req.body)
      .then(() => res.status(204).send())
      .catch(err => next(err));
  }
)

module.exports = router;
