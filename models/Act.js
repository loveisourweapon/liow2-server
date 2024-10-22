var modelUtils = require('../utils/models');
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var ActSchema = new mongoose.Schema({
  user: { type: ObjectId, ref: 'User', required: true },
  deed: { type: ObjectId, ref: 'Deed', required: true },
  group: { type: ObjectId, ref: 'Group' },
  campaign: { type: ObjectId, ref: 'Campaign' },
  likes: { type: [{ type: ObjectId, ref: 'Like' }] },
  comments: { type: [{ type: ObjectId, ref: 'Comment' }] },
  created: { type: Date, default: Date.now, required: true },
});

ActSchema.plugin(modelUtils.findOneOrThrow);
ActSchema.plugin(modelUtils.addFeedItem, { type: 'Act' });

ActSchema.statics.getFilter = function () {
  return ['deed', 'group', 'campaign'];
};

module.exports = mongoose.model('Act', ActSchema);

/**
 * @apiDefine ActsResponse
 * @apiVersion 1.5.0
 *
 * @apiSuccess {Act[]}    acts          List of acts
 * @apiSuccess {string}   acts._id      Act ObjectId
 * @apiSuccess {string}   acts.user     User ObjectId
 * @apiSuccess {string}   acts.deed     Deed ObjectId
 * @apiSuccess {string}   acts.group    Group ObjectId
 * @apiSuccess {string}   acts.campaign Campaign ObjectId
 * @apiSuccess {string[]} acts.likes    List of Like ObjectIds
 * @apiSuccess {string[]} acts.comments List of Comment ObjectIds
 * @apiSuccess {Date}     acts.created  Created timestamp
 *
 * @apiSuccessExample {json} Response
 *   HTTP/1.1 200 OK
 *   [{
 *     "_id": "55f6c56186b959ac12490e1e",
 *     "user": "55f6c57486b959ac12490e1a",
 *     "deed": "55f6c58b86b959ac12490e1b",
 *     "group": "55f6c58086b959ac12490e1c",
 *     "campaign": "55f6c58086b959ac12490e1d",
 *     "likes": ["55f6c58086b959ac12490e1f"],
 *     "comments": ["55f6c58086b959ac12490e1g"],
 *     "created": "2015-09-14T13:56:27.250Z"
 *   }]
 */

/**
 * @apiDefine ActRequestBody
 * @apiVersion 1.3.0
 *
 * @apiParam (Body) {string} deed       Deed ObjectId
 * @apiParam (Body) {string} [group]    Group ObjectId
 * @apiParam (Body) {string} [campaign] Campaign ObjectId
 *
 * @apiParamExample {json} Request
 *   {
 *     "deed": "55f6c58b86b959ac12490e1b",
 *     "group": "55f6c58086b959ac12490e1c"
 *   }
 */

/**
 * @apiDefine CreateActResponse
 * @apiVersion 1.5.0
 *
 * @apiSuccess (201) {Act}      act          Act
 * @apiSuccess (201) {string}   act._id      Act ObjectId
 * @apiSuccess (201) {string}   act.user     User ObjectId
 * @apiSuccess (201) {string}   act.deed     Deed ObjectId
 * @apiSuccess (201) {string}   act.group    Group ObjectId
 * @apiSuccess (201) {string}   act.campaign Campaign ObjectId
 * @apiSuccess (201) {string[]} act.likes    List of Like ObjectIds
 * @apiSuccess (201) {string[]} act.comments List of Comment ObjectIds
 * @apiSuccess (201) {Date}     act.created  Created timestamp
 *
 * @apiSuccessExample {json} Response
 *   HTTP/1.1 201 Created
 *   {
 *     "_id": "55f6c56186b959ac12490e1e",
 *     "user": "55f6c57486b959ac12490e1a",
 *     "deed": "55f6c58b86b959ac12490e1b",
 *     "group": "55f6c58086b959ac12490e1c",
 *     "campaign": "55f6c58086b959ac12490e1d",
 *     "likes": [],
 *     "comments": [],
 *     "created": "2015-09-14T13:56:27.250Z"
 *   }
 */
