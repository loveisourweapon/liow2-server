var _ = require('lodash'),
    router = require('express').Router(),
    ObjectId = require('mongoose').Types.ObjectId,
    FeedItem = require('../models/FeedItem');

/**
 * GET /feeds
 */
router.get(
  '/',
  (req, res, next) => {
    // Match schema fields
    var conditions = {};
    var fields = _.filter(
      _.keys(req.query),
      field => _.has(FeedItem.schema.paths, ~field.indexOf('.') ? field.substr(0, field.indexOf('.')) : field)
    );
    if (fields.length) {
      conditions.$or = _.map(fields, field => ({
        [field]: ObjectId.isValid(req.query[field]) ? ObjectId(req.query[field]) : req.query[field]
      }));
    }

    // Handle before/after queries
    if (_.has(req.query, 'before') || _.has(req.query, 'after')) {
      conditions.created = {
        [req.query.before ? '$lt' : '$gt']: new Date(req.query[req.query.before ? 'before' : 'after'])
      };
    }

    FeedItem.find(conditions)
      .populate({ path: 'user', select: 'firstName picture' })
      .populate({ path: 'group', select: 'name urlName' })
      .populate({ path: 'target.deed', model: 'Deed', select: 'title urlTitle' })
      .populate({ path: 'target.group', model: 'Group', select: 'name urlName' })
      .populate({ path: 'act', select: 'likes comments' })
      .populate({ path: 'comment', select: 'content likes comments' })
      .sort({ created: -1 })
      .limit(req.query.limit && utils.isNumeric(req.query.limit) ? parseFloat(req.query.limit) : 20)
      .exec()
      .then(feedItems => res.status(200).json(feedItems))
      .catch(err => next(err));
  }
);

module.exports = router;
