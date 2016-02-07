var _ = require('lodash'),
    express = require('express'),
    router = express.Router(),
    route = require('../utils/route'),
    HttpError = require('../utils/general').HttpError;

var User = require('../models/User');

/**
 * Get the current logged in user
 * GET /users/me
 */
router.get('/me', route.ensureAuthenticated, (req, res, next) => {
  User.findById(req.user, (err, user) => {
    if (err) { return next(err); }

    if (!user) {
      return next(new HttpError('Not Found', 404));
    }

    res.status(200).json(user);
  });
});

module.exports = router;
