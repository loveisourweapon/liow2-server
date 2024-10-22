var assign = require('lodash/assign'),
    partialRight = require('lodash/partialRight'),
    routeUtils = require('../utils/route'),
    express = require('express'),
    router = express.Router();

var Deed = require('../models/Deed'),
    Like = require('../models/Like'),
    Comment = require('../models/Comment'),
    Act = require('../models/Act');

router.param('deed', partialRight(routeUtils.paramHandler, Deed));
router.param('like', partialRight(routeUtils.paramHandler, Like));
router.param('comment', partialRight(routeUtils.paramHandler, Comment));

/**
 * @api {get} /deeds List deeds
 * @apiVersion 1.20.0
 * @apiName GetDeeds
 * @apiGroup Deeds
 * @apiPermission none
 *
 * @apiUse DeedsResponse
 */
router.get(
  '/',
  (req, res, next) => {
    req.query.enabled = 'true';
    req.query.sort = req.query.sort || 'order';
    return routeUtils.getAll(req, res, next, Deed);
  }
);

/**
 * @api {post} /deeds Create deed
 * @apiVersion 1.20.0
 * @apiName PostDeeds
 * @apiGroup Deeds
 * @apiPermission superAdmin
 *
 * @apiUse DeedRequestBody
 * @apiUse CreateDeedResponse
 */
router.post(
  '/',
  routeUtils.ensureAuthenticated,
  routeUtils.ensureSuperAdmin,
  (req, res, next) => {
    req.body = routeUtils.filterProperties(req.body, Deed);

    new Deed(req.body).save()
      .then(deed => res.status(201).location(`/deeds/${deed._id}`).json(deed))
      .catch(err => next(err));
  }
);

/**
 * @api {get} /counters Get deed counters
 * @apiVersion 1.10.0
 * @apiName CountDeeds
 * @apiGroup Deeds
 * @apiPermission none
 *
 * @apiSuccess {object[]} counters       List of deed counters
 * @apiSuccess {string}   counters.deed  Deed ObjectId
 * @apiSuccess {number}   counters.count Deed counter
 *
 * @apiSuccessExample {json} Response
 *   HTTP/1.1 200 OK
 *   [{
 *     "deed": "55f6c56186b959ac12490e1a",
 *     "count": 1234
 *   }, {
 *     "deed": "55f6c56186b959ac12490e1b",
 *     "count": 5678
 *   }]
 */
router.get(
  '/counters',
  (req, res, next) => {
    let actQuery = {};
    if (req.query.campaign) {
      actQuery.campaign = req.query.campaign;
    } else if (req.query.group) {
      actQuery.group = req.query.group;
    }

    return Deed.find()
      .then(deeds =>
        Promise.all(deeds.map(deed => Act.find(assign(actQuery, { deed: deed._id })).count().exec()))
          .then(responses => res.send(responses.map((counter, i) => ({
            deed: deeds[i]._id,
            count: counter
          }))))
      )
      .catch(err => next(err));
  }
);

/**
 * @api {get} /deeds/:deed Get deed
 * @apiVersion 1.20.0
 * @apiName GetDeed
 * @apiGroup Deeds
 * @apiPermission none
 *
 * @apiParam {string} deed Deed ObjectId
 *
 * @apiUse DeedResponse
 */
router.get(
  '/:deed',
  partialRight(routeUtils.getByParam, 'deed')
);

/**
 * @api {put} /deeds/:deed Update deed
 * @apiVersion 1.20.0
 * @apiName PutDeed
 * @apiGroup Deeds
 * @apiPermission superAdmin
 *
 * @apiUse DeedRequestBody
 * @apiUse DeedResponse
 */
router.put(
  '/:deed',
  routeUtils.ensureAuthenticated,
  routeUtils.ensureSuperAdmin,
  partialRight(routeUtils.putByParam, Deed, 'deed')
);

/**
 * @api {delete} /deeds/:deed Remove deed
 * @apiVersion 1.3.0
 * @apiName DeleteDeed
 * @apiGroup Deeds
 * @apiPermission superAdmin
 *
 * @apiUse NoContentResponse
 */
router.delete(
  '/:deed',
  routeUtils.ensureAuthenticated,
  routeUtils.ensureSuperAdmin,
  partialRight(routeUtils.deleteByParam, 'deed')
);

/**
 * @api {get} /deeds/:deed/comments List deed comments
 * @apiVersion 1.5.0
 * @apiName GetDeedComments
 * @apiGroup Deeds
 * @apiPermission none
 *
 * @apiParam {string} deed Deed ObjectId
 *
 * @apiUse CommentsResponse
 */
router.get(
  '/:deed/comments',
  partialRight(routeUtils.getByTarget, Comment, 'deed')
);

/**
 * @api {post} /deeds/:deed/comments Create deed comment
 * @apiVersion 1.5.0
 * @apiName PostDeedComment
 * @apiGroup Deeds
 * @apiPermission user
 *
 * @apiParam {string} deed Deed ObjectId
 *
 * @apiUse CommentRequestBody
 * @apiUse CreateCommentResponse
 */
router.post(
  '/:deed/comments',
  routeUtils.ensureAuthenticated,
  (req, res, next) => {
    req.body = routeUtils.filterProperties(req.body, Comment);
    req.body.user = req.authUser._id;
    req.body.target = { deed: req.deed._id };

    routeUtils.getCurrentCampaign(req)
      .then(req => {
        new Comment(req.body).save()
          .then(comment => res.status(201).location(`/deeds/${req.deed._id}/comments/${comment._id}`).json(comment))
          .catch(err => next(err));
      });
  }
);

/**
 * @api {put} /deeds/:deed/comments/:comment Update deed comment
 * @apiVersion 1.5.0
 * @apiName PutDeedComment
 * @apiGroup Deeds
 * @apiPermission owner
 *
 * @apiParam {string} deed    Deed ObjectId
 * @apiParam {string} comment Comment ObjectId
 *
 * @apiUse CommentRequestBody
 * @apiUse CommentResponse
 */
router.put(
  '/:deed/comments/:comment',
  routeUtils.ensureAuthenticated,
  partialRight(routeUtils.ensureSameUser, 'comment.user'),
  partialRight(routeUtils.putByParam, Comment, 'comment')
);

/**
 * @api {delete} /deeds/:deed/comments/:comment Remove deed comment
 * @apiVersion 1.3.0
 * @apiName DeleteDeedComment
 * @apiGroup Deeds
 * @apiPermission owner
 *
 * @apiParam {string} deed    Deed ObjectId
 * @apiParam {string} comment Comment ObjectId
 *
 * @apiUse NoContentResponse
 */
router.delete(
  '/:deed/comments/:comment',
  routeUtils.ensureAuthenticated,
  partialRight(routeUtils.ensureSameUser, 'comment.user'),
  partialRight(routeUtils.deleteByParam, 'comment')
);

module.exports = router;
