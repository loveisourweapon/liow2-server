var _ = require('lodash'),
    express = require('express'),
    router = express.Router(),
    route = require('../utils/route');

var Like = require('../models/Like');

router.param('like', _.partialRight(route.paramHandler, Like));

/**
 * GET /likes
 */
router.get('/', _.partialRight(route.getAll, Like));

/**
 * DELETE /likes/:like
 */
router.delete('/:like', _.partialRight(route.deleteByParam, 'like'));

module.exports = router;
