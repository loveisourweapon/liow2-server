var routeUtils = require('../utils/route'),
    express = require('express'),
    router = express.Router();

/**
 * Get the current logged in user
 * GET /users/me
 */
router.get('/me', routeUtils.ensureAuthenticated, (req, res, next) => {
  req.user
    .populate('country groups', '_id name urlName admins')
    .execPopulate()
    .then(user => res.status(200).json(user))
    .catch(err => next(err));
});

module.exports = router;
