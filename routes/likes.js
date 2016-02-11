var _ = require('lodash'),
    routeUtils = require('../utils/route'),
    express = require('express'),
    router = express.Router(),
    Like = require('../models/Like');

router.param('like', _.partialRight(routeUtils.paramHandler, Like));

/**
 * GET /likes
 */
router.get('/', _.partialRight(routeUtils.getAll, Like));

/**
 * DELETE /likes/:like
 */
router.delete('/:like', _.partialRight(routeUtils.deleteByParam, 'like'));

module.exports = router;
