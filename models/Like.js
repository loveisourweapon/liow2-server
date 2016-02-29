var _ = require('lodash'),
    modelUtils = require('../utils/models'),
    mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId;

var LikeSchema = new mongoose.Schema({
  user: { type: ObjectId, ref: 'User', required: true },
  group: { type: ObjectId, ref: 'Group' },
  campaign: { type: ObjectId, ref: 'Campaign' },
  target: {
    type: {
      act: { type: ObjectId, ref: 'Act' },
      comment: { type: ObjectId, ref: 'Comment' }
    },
    required: true,
    validate: [
      _.partialRight(modelUtils.oneOf, ['act', 'comment']),
      'One target should be set',
      'onetarget'
    ]
  },
  created: { type: Date, default: Date.now, required: true }
});

LikeSchema.plugin(modelUtils.findOneOrThrow);

LikeSchema.statics.getFilter = function () {
  return ['group', 'campaign'];
};

module.exports = mongoose.model('Like', LikeSchema);

/**
 * @apiDefine GetLikesSuccess
 *
 * @apiSuccess {Like[]} likes             List of likes
 * @apiSuccess {string} likes._id         Like ObjectId
 * @apiSuccess {string} likes.user        User ObjectId
 * @apiSuccess {Date}   likes.created     Created timestamp
 * @apiSuccess {object} likes.target      Target object. Only one of deed or act will be set
 * @apiSuccess {string} likes.target.deed Deed ObjectId
 * @apiSuccess {string} likes.target.act  Act ObjectId
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
 * @apiSuccess (201) {object} like.target      Target object. Only one of deed or act will be set
 * @apiSuccess (201) {string} like.target.deed Deed ObjectId
 * @apiSuccess (201) {string} like.target.act  Act ObjectId
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
