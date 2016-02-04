var _ = require('lodash'),
    express = require('express'),
    router = express.Router(),
    route = require('../utils/route');

var Comment = require('../models/Comment');

router.param('comment', _.partialRight(route.paramHandler, Comment));

/**
 * GET /comments
 */
router.get('/', _.partialRight(route.getAll, Comment));

/**
 * PUT /comments/:comment
 */
router.put('/:comment', _.partialRight(route.putByParam, Comment, 'comment'));

/**
 * DELETE /comments/:comment
 */
router.delete('/:comment', _.partialRight(route.deleteByParam, 'comment'));

module.exports = router;
