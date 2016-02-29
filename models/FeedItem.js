var _ = require('lodash'),
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
  created: { type: Date, default: Date.now, required: true }
});

/**
 * Find an existing FeedItem or create a new one
 *
 * @param {object} newFeedItem
 *
 * @returns {Promise}
 */
FeedItemSchema.statics.findOrCreate = function (newFeedItem) {
  return this.findOne(_.pick(newFeedItem, ['act', 'comment'])).exec()
    .then(feedItem => (feedItem || new this(newFeedItem).save()));
};

module.exports = mongoose.model('FeedItem', FeedItemSchema);
