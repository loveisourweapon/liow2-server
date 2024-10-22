var partialRight = require('lodash/partialRight');
var modelUtils = require('../utils/models');
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var LikeSchema = new mongoose.Schema({
  user: { type: ObjectId, ref: 'User', required: true },
  group: { type: ObjectId, ref: 'Group' },
  campaign: { type: ObjectId, ref: 'Campaign' },
  target: {
    type: {
      act: { type: ObjectId, ref: 'Act' },
      comment: { type: ObjectId, ref: 'Comment' },
    },
    required: true,
    validate: [
      partialRight(modelUtils.oneOf, ['act', 'comment']),
      'One target should be set',
      'onetarget',
    ],
  },
  created: { type: Date, default: Date.now, required: true },
});

LikeSchema.plugin(modelUtils.findOneOrThrow);

LikeSchema.statics.getFilter = function () {
  return ['group', 'campaign'];
};

module.exports = mongoose.model('Like', LikeSchema);

/**
 * @apiDefine LikesResponse
 * @apiVersion 1.5.0
 *
 * @apiSuccess {Like[]} likes                List of likes
 * @apiSuccess {string} likes._id            Like ObjectId
 * @apiSuccess {string} likes.user           User ObjectId
 * @apiSuccess {string} likes.group          Group ObjectId
 * @apiSuccess {string} likes.campaign       Campaign ObjectId
 * @apiSuccess {object} likes.target         Target object. Only one property will be set
 * @apiSuccess {string} likes.target.act     Act ObjectId
 * @apiSuccess {string} likes.target.comment Comment ObjectId
 * @apiSuccess {Date}   likes.created        Created timestamp
 *
 * @apiSuccessExample {json} Response
 *   HTTP/1.1 200 OK
 *   [{
 *     "_id": "55f6c56186b959ac12490e1e",
 *     "user": "55f6c56186b959ac12490e1a",
 *     "group": "55f6c56186b959ac12490e1b",
 *     "campaign": "55f6c56186b959ac12490e1c",
 *     "target": {
 *       "act": "55f6c56186b959ac12490e1d"
 *     },
 *     "created": "2015-09-14T13:56:27.250Z,
 *   }]
 */

/**
 * @apiDefine LikeRequestBody
 * @apiVersion 1.5.0
 *
 * @apiParam (Body) {string} [group]    Group ObjectId
 * @apiParam (Body) {string} [campaign] Campaign ObjectId
 *
 * @apiParamExample {json} Request
 *   {
 *     "group": "55f6c57486b959ac12490e1b"
 *   }
 */

/**
 * @apiDefine CreateLikeResponse
 * @apiVersion 1.5.0
 *
 * @apiSuccess (201) {Like}   like                Like
 * @apiSuccess (201) {string} like._id            Like ObjectId
 * @apiSuccess (201) {string} like.user           User ObjectId
 * @apiSuccess (201) {string} like.group          Group ObjectId
 * @apiSuccess (201) {string} like.campaign       Campaign ObjectId
 * @apiSuccess (201) {object} like.target         Target object. Only one property will be set
 * @apiSuccess (201) {string} like.target.act     Act ObjectId
 * @apiSuccess (201) {string} like.target.comment Comment ObjectId
 * @apiSuccess (201) {Date}   like.created        Created timestamp
 *
 * @apiSuccessExample {json} Response
 *   HTTP/1.1 201 Created
 *   {
 *     "_id": "55f6c56186b959ac12490e1e",
 *     "user": "55f6c56186b959ac12490e1a",
 *     "group": "55f6c56186b959ac12490e1b",
 *     "campaign": "55f6c56186b959ac12490e1c",
 *     "target": {
 *       "act": "55f6c56186b959ac12490e1d"
 *     },
 *     "created": "2015-09-14T13:56:27.250Z,
 *   }
 */
