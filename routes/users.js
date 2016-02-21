var _ = require('lodash'),
    jsonpatch = require('fast-json-patch'),
    routeUtils = require('../utils/route'),
    express = require('express'),
    router = express.Router(),
    User = require('../models/User');

router.param('user', _.partialRight(routeUtils.paramHandler, User));

/**
 * GET /users
 */
router.get(
  '/',
  (req, res, next) => {
    // TODO: sanitize public API data
    // For now, only allow counting users
    req.query.count = 'true';
    next();
  },
  _.partialRight(routeUtils.getAll, User)
);

/**
 * Get the current logged in user
 * GET /users/me
 */
router.get('/me', routeUtils.ensureAuthenticated, (req, res, next) => {
  req.authUser
    .populate('country groups', '_id name urlName admins')
    .execPopulate()
    .then(user => res.status(200).json(user))
    .catch(err => next(err));
});

/**
 * PATCH /users/:user
 */
router.patch(
  '/:user',
  routeUtils.ensureAuthenticated,
  _.partialRight(routeUtils.ensureSameUser, 'user'),
  (req, res, next) => {
    jsonpatch.apply(req.user, routeUtils.filterJsonPatch(req.body, User.getFilter()));

    req.user.save()
      .then(user => res.status(200).json(user))
      .catch(err => next(err));
  }
);

module.exports = router;
