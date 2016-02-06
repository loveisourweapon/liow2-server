var config = require('../config'),
    jwt = require('jsonwebtoken'),
    moment = require('moment'),
    request = require('request'),
    express = require('express'),
    router = express.Router();

var User = require('../models/User');

/**
 * Middleware to ensure authenticated user
 * TODO: move to utils/route.js
 *
 * @param req
 * @param res
 * @param next
 *
 * @returns {*}
 */
function ensureAuthenticated(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: 'Please make sure your request has an Authorization header' });
  }

  var token = req.headers.authorization.split(' ')[1];

  var payload = null;
  try {
    payload = jwt.decode(token, config.secret);
  } catch (err) {
    return res.status(401).send({ message: err.message });
  }

  if (payload.exp <= moment().unix()) {
    return res.status(401).send({ message: 'Token has expired' });
  }
  req.user = payload.sub;
  next();
}

/**
 * Login with Facebook
 * POST /auth/facebook
 */
router.post('/facebook', function(req, res) {
  var fields = ['id', 'email', 'first_name', 'last_name', 'link', 'name'];
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
      return res.status(500).send({ message: accessToken.error.message });
    }

    // Step 2. Retrieve profile information about the current user.
    request.get({ url: graphApiUrl, qs: accessToken, json: true }, function(err, response, profile) {
      if (response.statusCode !== 200) {
        return res.status(500).send({ message: profile.error.message });
      }

      if (req.headers.authorization) {
        User.findOne({ 'facebook.id': profile.id }, function(err, existingUser) {
          if (existingUser) {
            return res.status(409).send({ message: 'There is already a Facebook account that belongs to you' });
          }
          var token = req.headers.authorization.split(' ')[1];
          var payload = jwt.decode(token, config.secret);
          User.findById(payload.sub, function(err, user) {
            if (!user) {
              return res.status(400).send({ message: 'User not found' });
            }
            user.facebook = { id: profile.id };
            user.picture = user.picture || 'https://graph.facebook.com/' + profile.id + '/picture?type=large';
            user.name = user.displayName || profile.name;
            user.save(function() {
              var token = jwt.sign(user._id, config.secret);
              res.send({ token: token });
            });
          });
        });
      } else {
        // Step 3b. Create a new user account or return an existing one.
        User.findOne({ email: profile.email }, function(err, existingUser) {
          var user;
          if (existingUser) {
            user = existingUser;
          } else {
            user = new User();
            user.name = profile.name;
          }

          user.facebook = { id: profile.id };
          user.picture = 'https://graph.facebook.com/' + profile.id + '/picture?type=large';
          user.save(function() {
            var token = jwt.sign(user._id, config.secret);
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
router.post('/login', function(req, res) {
  User.findOne({ email: req.body.email }, function(err, user) {
    if (!user) {
      return res.status(401).send({ message: 'Invalid email and/or password' });
    }

    user.validatePassword(req.body.password, function(err, isMatch) {
      if (!isMatch) {
        return res.status(401).send({ message: 'Invalid email and/or password' });
      }

      res.send({ token: jwt.sign(user._id, config.secret) });
    });
  });
});

module.exports = router;
