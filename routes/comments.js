var partialRight = require('lodash/partialRight'),
    routeUtils = require('../utils/route'),
    express = require('express'),
    router = express.Router(),
    Comment = require('../models/Comment');

router.param('comment', partialRight(routeUtils.paramHandler, Comment));

/**
 * @api {get} /comments List comments
 * @apiVersion 1.5.0
 * @apiName GetComments
 * @apiGroup Comments
 * @apiPermission none
 *
 * @apiUse CommentsResponse
 */
router.get(
  '/',
  partialRight(routeUtils.getAll, Comment, [{
    path: 'user',
    select: 'firstName lastName name picture'
  }, {
    path: 'target.deed',
    model: 'Deed',
    select: 'title urlTitle logo'
  }])
);

/**
 * @api {put} /comments/:comment Update comment
 * @apiVersion 1.5.0
 * @apiName PutComment
 * @apiGroup Comments
 * @apiPermission owner
 *
 * @apiParam {string} comment Comment ObjectId
 *
 * @apiUse CommentRequestBody
 * @apiUse CommentResponse
 */
router.put(
  '/:comment',
  routeUtils.ensureAuthenticated,
  partialRight(routeUtils.ensureSameUser, 'comment.user'),
  partialRight(routeUtils.ensureCleanText, 'content.text'),
  partialRight(routeUtils.putByParam, Comment, 'comment')
);

/**
 * @api {delete} /comments/:comment Remove comment
 * @apiVersion 1.3.0
 * @apiName DeleteComment
 * @apiGroup Comments
 * @apiPermission owner
 *
 * @apiParam {string} comment Comment ObjectId
 *
 * @apiUse NoContentResponse
 */
router.delete(
  '/:comment',
  routeUtils.ensureAuthenticated,
  partialRight(routeUtils.ensureSameUser, 'comment.user'),
  partialRight(routeUtils.deleteByParam, 'comment')
);

module.exports = router;
