var _ = require('lodash'),
    utils = require('../utils/models'),
    mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId;

var LikeSchema = new mongoose.Schema({
  user: { type: ObjectId, ref: 'User', required: true },
  target: {
    type: {
      deed: { type: ObjectId, ref: 'Deed' },
      act: { type: ObjectId, ref: 'Act' },
      news: { type: ObjectId, ref: 'News' }
    },
    required: true,
    validate: [
      _.partialRight(utils.oneOf, ['deed', 'act', 'news']),
      'One target should be set',
      'onetarget'
    ]
  },
  created: { type: Date, default: Date.now, required: true }
});

LikeSchema.statics.getFilter = function() {
  return ['user'];
};

module.exports = mongoose.model('Like', LikeSchema);

/**
 * @apiDefine GetLikesSuccess
 *
 * @apiSuccess {Like[]} likes             List of likes
 * @apiSuccess {string} likes._id         Like ObjectId
 * @apiSuccess {string} likes.user        User ObjectId
 * @apiSuccess {Date}   likes.created     Created timestamp
 * @apiSuccess {Object} likes.target      Target object. Only one of deed, act or news will be set
 * @apiSuccess {string} likes.target.deed Deed ObjectId
 * @apiSuccess {string} likes.target.act  Act ObjectId
 * @apiSuccess {string} likes.target.news News ObjectId
 *
 * @apiSuccessExample {json} Response
 *   HTTP/1.1 200 OK
 *   [{
 *     "_id": "55f6c56186b959ac12490e1c",
 *     "user": "55f6c56186b959ac12490e1a",
 *     "created": "2015-09-14T13:56:27.250Z,
 *     "target": {
 *       "act": "55f6c56186b959ac12490e1b"
 *     }
 *   }]
 */

/**
 * @apiDefine CreateLikeSuccess
 *
 * @apiSuccess (201) {Like}   like             Created like
 * @apiSuccess (201) {string} like._id         Like ObjectId
 * @apiSuccess (201) {string} like.user        User ObjectId
 * @apiSuccess (201) {Date}   like.created     Created timestamp
 * @apiSuccess (201) {Object} like.target      Target object. Only one of deed, act or news will be set
 * @apiSuccess (201) {string} like.target.deed Deed ObjectId
 * @apiSuccess (201) {string} like.target.act  Act ObjectId
 * @apiSuccess (201) {string} like.target.news News ObjectId
 *
 * @apiSuccessExample {json} Response
 *   HTTP/1.1 201 Created
 *   {
 *     "_id": "55f6c56186b959ac12490e1c",
 *     "user": "55f6c56186b959ac12490e1a",
 *     "created": "2015-09-14T13:56:27.250Z",
 *     "target": {
 *       "act": "55f6c56186b959ac12490e1b"
 *     }
 *   }
 */
