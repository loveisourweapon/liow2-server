var partialRight = require('lodash/partialRight'),
    routeUtils = require('../utils/route'),
    express = require('express'),
    router = express.Router(),
    Like = require('../models/Like');

router.param('like', partialRight(routeUtils.paramHandler, Like));

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
  partialRight(routeUtils.getAll, Like)
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
  partialRight(routeUtils.ensureSameUser, 'like.user'),
  partialRight(routeUtils.deleteByParam, 'like')
);

module.exports = router;
