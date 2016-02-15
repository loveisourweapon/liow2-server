var _ = require('lodash'),
    routeUtils = require('../utils/route'),
    express = require('express'),
    router = express.Router();

var ObjectId = require('mongoose').Types.ObjectId,
    User = require('../models/User');

router.param('user', _.partialRight(routeUtils.paramHandler, User));

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
    req.body = _.pick(req.body, User.getFilter());

    _.each(req.body, (value, field) => {
      // Convert valid ObjectId's to actual ObjectId's
      if (ObjectId.isValid(value)) {
        value = ObjectId(value);
      }

      // If the field is an array, push the new value
      if (User.schema.path(field).instance === 'Array') {
        req.user[field].push(value);
      } else {
        req.user[field] = value;
      }
    });

    req.user.save()
      .then(user => res.status(200).json(user))
      .catch(err => next(err));
  }
);

module.exports = router;
