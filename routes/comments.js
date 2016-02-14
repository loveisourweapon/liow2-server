var _ = require('lodash'),
    routeUtils = require('../utils/route'),
    express = require('express'),
    router = express.Router(),
    Comment = require('../models/Comment');

router.param('comment', _.partialRight(routeUtils.paramHandler, Comment));

/**
 * GET /comments
 */
router.get('/', _.partialRight(routeUtils.getAll, Comment));

/**
 * PUT /comments/:comment
 */
router.put('/:comment', _.partialRight(routeUtils.putByParam, Comment, 'comment'));

/**
 * DELETE /comments/:comment
 */
router.delete('/:comment', _.partialRight(routeUtils.deleteByParam, 'comment'));

module.exports = router;
