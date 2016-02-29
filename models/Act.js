var modelUtils = require('../utils/models'),
    mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId;

var ActSchema = new mongoose.Schema({
  user: { type: ObjectId, ref: 'User', required: true },
  deed: { type: ObjectId, ref: 'Deed', required: true },
  group: { type: ObjectId, ref: 'Group' },
  campaign: { type: ObjectId, ref: 'Campaign' },
  likes: { type: [{ type: ObjectId, ref: 'Like' }] },
  comments: { type: [{ type: ObjectId, ref: 'Comment' }] },
  created: { type: Date, default: Date.now, required: true }
});

ActSchema.plugin(modelUtils.findOneOrThrow);
ActSchema.plugin(modelUtils.addFeedItem, { type: 'Act' });

ActSchema.statics.getFilter = function () {
  return ['deed', 'group', 'campaign'];
};

module.exports = mongoose.model('Act', ActSchema);

/**
 * @apiDefine GetActsSuccess
 *
 * @apiSuccess {Act[]}  acts          List of acts
 * @apiSuccess {string} acts._id      Act ObjectId
 * @apiSuccess {string} acts.user     User ObjectId
 * @apiSuccess {string} acts.deed     Deed ObjectId
 * @apiSuccess {string} acts.group    Group ObjectId
 * @apiSuccess {string} acts.campaign Campaign ObjectId
 * @apiSuccess {Date}   acts.created  Created timestamp
 *
 * @apiSuccessExample {json} Response
 *   HTTP/1.1 200 OK
 *   [{
 *     "_id": "55f6c56186b959ac12490e1e",
 *     "deed": "55f6c58b86b959ac12490e1a",
 *     "user": "55f6c57486b959ac12490e1b",
 *     "group": "55f6c58086b959ac12490e1c",
 *     "campaign": "55f6c58086b959ac12490e1d",
 *     "created": "2015-09-14T13:56:27.250Z"
 *   }]
 */

/**
 * @apiDefine GetActSuccess
 *
 * @apiSuccess {Act}    act          Act
 * @apiSuccess {string} act._id      Act ObjectId
 * @apiSuccess {string} act.user     User ObjectId
 * @apiSuccess {string} act.deed     Deed ObjectId
 * @apiSuccess {string} act.group    Group ObjectId
 * @apiSuccess {string} act.campaign Campaign ObjectId
 * @apiSuccess {Date}   act.created  Created timestamp
 *
 * @apiSuccessExample {json} Response
 *   HTTP/1.1 200 OK
 *   {
 *     "_id": "55f6c56186b959ac12490e1e",
 *     "user": "55f6c57486b959ac12490e1a",
 *     "deed": "55f6c58b86b959ac12490e1b",
 *     "group": "55f6c58086b959ac12490e1c",
 *     "campaign": "55f6c58086b959ac12490e1d",
 *     "created": "2015-09-14T13:56:27.250Z"
 *   }
 */

/**
 * @apiDefine CreateActSuccess
 *
 * @apiSuccess (201) {Act}    act          Created act
 * @apiSuccess (201) {string} act._id      Act ObjectId
 * @apiSuccess (201) {string} act.user     User ObjectId
 * @apiSuccess (201) {string} act.deed     Deed ObjectId
 * @apiSuccess (201) {string} act.group    Group ObjectId
 * @apiSuccess (201) {string} act.campaign Campaign ObjectId
 * @apiSuccess (201) {Date}   act.created  Created timestamp
 *
 * @apiSuccessExample {json} Response
 *   HTTP/1.1 201 Created
 *   {
 *     "_id": "55f6c56186b959ac12490e1e",
 *     "user": "55f6c57486b959ac12490e1a",
 *     "deed": "55f6c58b86b959ac12490e1b",
 *     "group": "55f6c58086b959ac12490e1c",
 *     "campaign": "55f6c58086b959ac12490e1d",
 *     "created": "2015-09-14T13:56:27.250Z"
 *   }
 */
