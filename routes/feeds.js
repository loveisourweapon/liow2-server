var has = require('lodash/has');
var utils = require('../utils/general');
var routeUtils = require('../utils/route');
var router = require('express').Router();
var ObjectId = require('mongoose').Types.ObjectId;

var FeedItem = require('../models/FeedItem');

/**
 * @api {get} /feeds List feed items
 * @apiVersion 1.27.0
 * @apiName GetFeeds
 * @apiGroup Feeds
 * @apiPermission none
 *
 * @apiUse FeedsResponse
 */
router.get('/', (req, res, next) => {
  var conditions = routeUtils.buildQueryConditions(req.query, FeedItem);

  // Handle before/after queries
  if (has(req.query, 'before') || has(req.query, 'after')) {
    conditions._id = {
      [req.query.before ? '$lt' : '$gt']: ObjectId(
        req.query[req.query.before ? 'before' : 'after']
      ),
    };
  }

  FeedItem.find(conditions)
    .populate({ path: 'user', select: 'firstName picture' })
    .populate({ path: 'group', select: 'name urlName' })
    .populate({ path: 'target.deed', model: 'Deed', select: 'title urlTitle' })
    .populate({ path: 'target.group', model: 'Group', select: 'name urlName' })
    .populate({ path: 'act', select: 'likes comments' })
    .populate({ path: 'comment', select: 'content likes comments' })
    .sort({ _id: -1 })
    .limit(req.query.limit && utils.isNumeric(req.query.limit) ? parseFloat(req.query.limit) : 20)
    .exec()
    .then((feedItems) => res.status(200).json(feedItems))
    .catch((err) => next(err));
});

module.exports = router;
