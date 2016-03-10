var _ = require('lodash'),
    router = require('express').Router(),
    routeUtils = require('../utils/route');

var Act = require('../models/Act'),
    Like = require('../models/Like'),
    Comment = require('../models/Comment'),
    Campaign = require('../models/Campaign');

router.param('act', _.partialRight(routeUtils.paramHandler, Act));
router.param('like', _.partialRight(routeUtils.paramHandler, Like));
router.param('comment', _.partialRight(routeUtils.paramHandler, Comment));

/**
 * @api {get} /acts List acts
 * @apiVersion 1.5.0
 * @apiName GetActs
 * @apiGroup Acts
 * @apiPermission none
 *
 * @apiUse ActsResponse
 */
router.get(
  '/',
  _.partialRight(routeUtils.getAll, Act)
);

/**
 * @api {post} /acts Create act
 * @apiVersion 1.5.0
 * @apiName PostActs
 * @apiGroup Acts
 * @apiPermission user
 *
 * @apiUse ActRequestBody
 * @apiUse CreateActResponse
 */
router.post(
  '/',
  routeUtils.ensureAuthenticated,
  (req, res, next) => {
    req.body = routeUtils.filterProperties(req.body, Act);
    req.body.user = req.authUser._id;

    routeUtils.getCurrentCampaign(req)
      .then(req => {
        new Act(req.body).save()
          .then(act => res.status(201).location(`/acts/${act._id}`).json(act))
          .catch(err => next(err));
      });
  }
);

/**
 * @api {delete} /acts/:act Remove act
 * @apiVersion 1.3.0
 * @apiName DeleteAct
 * @apiGroup Acts
 * @apiPermission owner
 *
 * @apiParam {string} act Act ObjectId
 *
 * @apiUse NoContentResponse
 */
router.delete(
  '/:act',
  routeUtils.ensureAuthenticated,
  _.partialRight(routeUtils.ensureSameUser, 'act.user'),
  _.partialRight(routeUtils.deleteByParam, 'act')
);

/**
 * @api {get} /acts/:act/likes List act likes
 * @apiVersion 1.5.0
 * @apiName GetActLikes
 * @apiGroup Acts
 * @apiPermission none
 *
 * @apiParam {string} act Act ObjectId
 *
 * @apiUse LikesResponse
 */
router.get(
  '/:act/likes',
  _.partialRight(routeUtils.getByTarget, Like, 'act')
);

/**
 * @api {post} /acts/:act/likes Create act like
 * @apiVersion 1.5.0
 * @apiName PostActLikes
 * @apiGroup Acts
 * @apiPermission user
 *
 * @apiParam {string} act Act ObjectId
 *
 * @apiUse LikeRequestBody
 * @apiUse CreateLikeResponse
 */
router.post(
  '/:act/likes',
  routeUtils.ensureAuthenticated,
  (req, res, next) => {
    req.body = routeUtils.filterProperties(req.body, Like);
    req.body.user = req.authUser._id;
    req.body.target = { act: req.act._id };

    routeUtils.getCurrentCampaign(req)
      .then(req => {
        new Like(req.body).save()
          .then(like => res.status(201).location(`/acts/${req.act._id}/likes/${like._id}`).json(like))
          .catch(err => next(err));
      });
  }
);

/**
 * @api {delete} /acts/:act/likes/:like Remove act like
 * @apiVersion 1.3.0
 * @apiName DeleteActLike
 * @apiGroup Acts
 * @apiPermission owner
 *
 * @apiParam {string} act  Act ObjectId
 * @apiParam {string} like Like ObjectId
 *
 * @apiUse NoContentResponse
 */
router.delete(
  '/:act/likes/:like',
  routeUtils.ensureAuthenticated,
  _.partialRight(routeUtils.ensureSameUser, 'like.user'),
  _.partialRight(routeUtils.deleteByParam, 'like')
);

/**
 * @api {get} /acts/:act/comments List act comments
 * @apiVersion 1.5.0
 * @apiName GetActComments
 * @apiGroup Acts
 * @apiPermission none
 *
 * @apiParam {string} act Act ObjectId
 *
 * @apiUse CommentsResponse
 */
router.get(
  '/:act/comments',
  _.partialRight(routeUtils.getByTarget, Comment, 'act')
);

/**
 * @api {post} /acts/:act/comments Create act comment
 * @apiVersion 1.5.0
 * @apiName PostActComments
 * @apiGroup Acts
 * @apiPermission user
 *
 * @apiParam {string} act Act ObjectId
 *
 * @apiUse CommentRequestBody
 * @apiUse CreateCommentResponse
 */
router.post(
  '/:act/comments',
  routeUtils.ensureAuthenticated,
  (req, res, next) => {
    req.body = routeUtils.filterProperties(req.body, Comment);
    req.body.user = req.authUser._id;
    req.body.target = { act: req.act._id };

    routeUtils.getCurrentCampaign(req)
      .then(req => {
        new Comment(req.body).save()
          .then(comment => res.status(201).location(`/acts/${req.act._id}/comments/${comment._id}`).json(comment))
          .catch(err => next(err));
      });
  }
);

/**
 * @api {put} /acts/:act/comments/:comment Update act comment
 * @apiVersion 1.5.0
 * @apiName PutActComment
 * @apiGroup Acts
 * @apiPermission owner
 *
 * @apiParam {string} act     Act ObjectId
 * @apiParam {string} comment Comment ObjectId
 *
 * @apiUse CommentRequestBody
 * @apiUse CommentResponse
 */
router.put(
  '/:act/comments/:comment',
  routeUtils.ensureAuthenticated,
  _.partialRight(routeUtils.ensureSameUser, 'comment.user'),
  _.partialRight(routeUtils.putByParam, Comment, 'comment')
);

/**
 * @api {delete} /acts/:act/comments/:comment Remove act comment
 * @apiVersion 1.3.0
 * @apiName DeleteActComment
 * @apiGroup Acts
 * @apiPermission owner
 *
 * @apiParam {string} act     Act ObjectId
 * @apiParam {string} comment Comment ObjectId
 *
 * @apiUse NoContentResponse
 */
router.delete(
  '/:act/comments/:comment',
  routeUtils.ensureAuthenticated,
  _.partialRight(routeUtils.ensureSameUser, 'comment.user'),
  _.partialRight(routeUtils.deleteByParam, 'comment')
);

module.exports = router;
