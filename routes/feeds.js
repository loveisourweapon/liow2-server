var _ = require('lodash'),
    router = require('express').Router(),
    FeedItem = require('../models/FeedItem');

/**
 * GET /feeds
 */
router.get(
  '/',
  (req, res, next) => {
    // Match schema fields
    var conditions = {};
    var fields = _.filter(_.keys(req.query), field => _.has(FeedItem.schema.paths, field));
    if (fields.length) {
      conditions.$and = _.map(fields, field => {
        return { [field]: req.query[field] };
      });
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
