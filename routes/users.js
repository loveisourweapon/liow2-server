var _ = require('lodash'),
    express = require('express'),
    router = express.Router(),
    route = require('../utils/route');

var User = require('../models/User');

/**
 * Get the current logged in user
 * GET /users/me
 */
router.get('/me', route.ensureAuthenticated, (req, res, next) => {
  User.findById(req.user, (err, user) => {
    if (err) { return next(err); }

    res.status(200).json(user);
  });
});

module.exports = router;
