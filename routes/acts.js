var partialRight = require('lodash/partialRight');
var router = require('express').Router();
var routeUtils = require('../utils/route');
var utils = require('../utils/general');
var HttpError = utils.HttpError;

var Act = require('../models/Act');
var Like = require('../models/Like');
var Comment = require('../models/Comment');
var FeedItem = require('../models/FeedItem');
var Group = require('../models/Group');

router.param('act', partialRight(routeUtils.paramHandler, Act));
router.param('like', partialRight(routeUtils.paramHandler, Like));
router.param('comment', partialRight(routeUtils.paramHandler, Comment));

/**
 * @api {get} /acts List acts
 * @apiVersion 1.27.0
 * @apiName GetActs
 * @apiGroup Acts
 * @apiPermission none
 *
 * @apiUse ActsResponse
 */
router.get('/', partialRight(routeUtils.getAll, Act));

/**
 * @api {post} /acts Create act
 * @apiVersion 1.27.0
 * @apiName PostActs
 * @apiGroup Acts
 * @apiPermission user
 *
 * @apiUse ActRequestBody
 * @apiUse CreateActResponse
 */
router.post('/', routeUtils.ensureAuthenticated, (req, res, next) => {
  req.body = routeUtils.filterProperties(req.body, Act);
  req.body.user = req.authUser._id;

  routeUtils.getCurrentCampaign(req).then((req) => {
    new Act(req.body)
      .save()
      .then((act) => res.status(201).location(`/acts/${act._id}`).json(act))
      .catch((err) => next(err));
  });
});

/**
 * @api {post} /acts/bulk Create bulk acts
 * @apiVersion 1.27.0
 * @apiName PostActsBulk
 * @apiGroup Acts
 * @apiPermission groupAdmin
 *
 * @apiDescription Create multiple acts for a deed as a group admin. All acts will be grouped into a single FeedItem.
 *
 * @apiParam (Body) {string} deed  Deed ObjectId (required)
 * @apiParam (Body) {string} group  Group ObjectId (required)
 * @apiParam (Body) {number} count  Number of acts to create (required, must be > 0)
 *
 * @apiParamExample {json} Request
 *   {
 *     "deed": "55f6c58b86b959ac12490e1b",
 *     "group": "55f6c58086b959ac12490e1c",
 *     "count": 20
 *   }
 *
 * @apiSuccess (201) {object}   result              Result object
 * @apiSuccess (201) {number}   result.count       Number of acts created
 * @apiSuccess (201) {string[]} result.actIds      Array of created Act ObjectIds
 * @apiSuccess (201) {string}   result.feedItemId   Created FeedItem ObjectId
 *
 * @apiSuccessExample {json} Response
 *   HTTP/1.1 201 Created
 *   {
 *     "count": 20,
 *     "actIds": ["55f6c56186b959ac12490e1e", "..."],
 *     "feedItemId": "55f6c56186b959ac12490e1f"
 *   }
 */
router.post('/bulk', routeUtils.ensureAuthenticated, (req, res, next) => {
  var deedId = req.body.deed;
  var groupId = req.body.group;
  var count = parseInt(req.body.count, 10);

  // Validate required fields
  if (!deedId || !groupId || !count) {
    return next(new HttpError('deed, group, and count are required', 400));
  }
  if (!utils.isValidObjectId(deedId) || !utils.isValidObjectId(groupId)) {
    return next(new HttpError('Invalid deed or group ObjectId', 400));
  }
  if (!Number.isInteger(count) || count <= 0) {
    return next(new HttpError('count must be a positive integer', 400));
  }

  // Validate group admin permissions
  Group.findById(groupId)
    .exec()
    .then((group) => {
      if (!group) {
        return next(new HttpError('Group not found', 404));
      }

      // Check if user is admin (superAdmin can bypass)
      if (
        !req.authUser.superAdmin &&
        !group.admins.some((admin) => admin.equals(req.authUser._id))
      ) {
        return next(new HttpError('Must be an admin of the group', 403));
      }

      // Get current campaign for the group
      return routeUtils.getCurrentCampaign(req).then((req) => {
        var campaignId = req.body.campaign;

        // Create all acts
        var acts = [];
        for (var i = 0; i < count; i++) {
          acts.push({
            deed: deedId,
            group: groupId,
            campaign: campaignId,
            bulk: true,
          });
        }

        return Act.insertMany(acts)
          .then((createdActs) => {
            var actIds = createdActs.map((act) => act._id);

            // Create a single FeedItem for all bulk acts
            var feedItem = new FeedItem({
              user: req.authUser._id, // Use admin's ID for display purposes
              group: groupId,
              campaign: campaignId,
              target: { deed: deedId },
              bulk: true,
              count: count,
            });

            return feedItem.save().then((savedFeedItem) => {
              res.status(201).json({
                count: count,
                actIds: actIds,
                feedItemId: savedFeedItem._id,
              });
            });
          })
          .catch((err) => next(err));
      });
    })
    .catch((err) => next(err));
});

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
  partialRight(routeUtils.ensureSameUser, 'act.user'),
  partialRight(routeUtils.deleteByParam, 'act')
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
router.get('/:act/likes', partialRight(routeUtils.getByTarget, Like, 'act'));

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
router.post('/:act/likes', routeUtils.ensureAuthenticated, (req, res, next) => {
  req.body = routeUtils.filterProperties(req.body, Like);
  req.body.user = req.authUser._id;
  req.body.target = { act: req.act._id };

  routeUtils.getCurrentCampaign(req).then((req) => {
    new Like(req.body)
      .save()
      .then((like) => res.status(201).location(`/acts/${req.act._id}/likes/${like._id}`).json(like))
      .catch((err) => next(err));
  });
});

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
  partialRight(routeUtils.ensureSameUser, 'like.user'),
  partialRight(routeUtils.deleteByParam, 'like')
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
router.get('/:act/comments', partialRight(routeUtils.getByTarget, Comment, 'act'));

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
router.post('/:act/comments', routeUtils.ensureAuthenticated, (req, res, next) => {
  req.body = routeUtils.filterProperties(req.body, Comment);
  req.body.user = req.authUser._id;
  req.body.target = { act: req.act._id };

  routeUtils.getCurrentCampaign(req).then((req) => {
    new Comment(req.body)
      .save()
      .then((comment) =>
        res.status(201).location(`/acts/${req.act._id}/comments/${comment._id}`).json(comment)
      )
      .catch((err) => next(err));
  });
});

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
  partialRight(routeUtils.ensureSameUser, 'comment.user'),
  partialRight(routeUtils.putByParam, Comment, 'comment')
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
  partialRight(routeUtils.ensureSameUser, 'comment.user'),
  partialRight(routeUtils.deleteByParam, 'comment')
);

module.exports = router;
