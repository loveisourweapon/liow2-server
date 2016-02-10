var express = require('express'),
    router = express.Router(),
    route = require('../utils/route');

/**
 * Get the current logged in user
 * GET /users/me
 */
router.get('/me', route.ensureAuthenticated, (req, res, next) => {
  req.user
    .populate('country groups', '_id name urlName admins')
    .execPopulate()
    .then(user => res.status(200).json(user))
    .catch(err => next(err));
});

module.exports = router;
