var _ = require('lodash'),
    routeUtils = require('../utils/route'),
    express = require('express'),
    router = express.Router(),
    Like = require('../models/Like');

router.param('like', _.partialRight(routeUtils.paramHandler, Like));

/**
 * @api {get} /likes List likes
 * @apiVersion 1.5.0
 * @apiName GetLikes
 * @apiGroup Likes
 * @apiPermission none
 *
 * @apiUse LikesResponse
 */
router.get(
  '/',
  _.partialRight(routeUtils.getAll, Like)
);

/**
 * @api {delete} /likes/:like Remove like
 * @apiVersion 1.3.0
 * @apiName DeleteLike
 * @apiGroup Likes
 * @apiPermission owner
 *
 * @apiParam {string} like Like ObjectId
 *
 * @apiUse NoContentResponse
 */
router.delete(
  '/:like',
  routeUtils.ensureAuthenticated,
  _.partialRight(routeUtils.ensureSameUser, 'like.user'),
  _.partialRight(routeUtils.deleteByParam, 'like')
);

module.exports = router;
