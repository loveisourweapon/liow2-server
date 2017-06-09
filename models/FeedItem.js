var pick = require('lodash/pick'),
    mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId;

var FeedItemSchema = new mongoose.Schema({
  user: { type: ObjectId, ref: 'User', required: true },
  group: { type: ObjectId, ref: 'Group' },
  campaign: { type: ObjectId, ref: 'Campaign' },
  target: {
    type: {
      group: { type: ObjectId, ref: 'Group' },
      deed: { type: ObjectId, ref: 'Deed' }
    }
  },
  act: { type: ObjectId, ref: 'Act' },
  comment: { type: ObjectId, ref: 'Comment' },
  count: { type: String, default: 1, required: true },
  created: { type: Date, default: Date.now, required: true },
  modified: { type: Date, default: Date.now, required: true }
});

/**
 * Find an existing FeedItem or create a new one
 *
 * @param {object} newFeedItem
 *
 * @returns {Promise}
 */
FeedItemSchema.statics.findOrCreate = function (newFeedItem) {
  return this.findOne(pick(newFeedItem, ['act', 'comment'])).exec()
    .then(feedItem => (feedItem || new this(newFeedItem).save()));
};

module.exports = mongoose.model('FeedItem', FeedItemSchema);

/**
 * @apiDefine FeedsResponse
 * @apiVersion 1.18.0
 *
 * @apiSuccess {FeedItem[]} feedItems              List of feed items
 * @apiSuccess {string}     feedItems._id          Feed item ObjectId
 * @apiSuccess {string}     feedItems.user         User ObjectId
 * @apiSuccess {string}     feedItems.group        Group ObjectId
 * @apiSuccess {string}     feedItems.campaign     Campaign ObjectId
 * @apiSuccess {object}     feedItems.target       Target object. Only one property will be set
 * @apiSuccess {string}     feedItems.target.group Group ObjectId
 * @apiSuccess {string}     feedItems.target.deed  Group ObjectId
 * @apiSuccess {string}     feedItems.act          Act ObjectId
 * @apiSuccess {string}     feedItems.comment      Comment ObjectId
 * @apiSuccess {number}     feedItems.count        Count for repeated feed items
 * @apiSuccess {Date}       feedItems.created      Created timestamp
 * @apiSuccess {Date}       feedItems.modified     Modified timestamp
 *
 * @apiSuccessExample {json} Response
 *   HTTP/1.1 200 OK
 *   [{
 *     "_id": "55f6c56186b959ac12490e1e",
 *     "user": "55f6c56186b959ac12490e1a",
 *     "group": "55f6c56186b959ac12490e1b",
 *     "campaign": "55f6c56186b959ac12490e1c",
 *     "target": {
 *       "deed": "55f6c56186b959ac12490e1d"
 *     },
 *     "act": "55f6c56186b959ac12490e1d",
 *     "count": 1,
 *     "created": "2015-09-14T13:56:27.250Z",
 *     "created": "2015-09-14T13:56:27.250Z"
 *   }]
 */
