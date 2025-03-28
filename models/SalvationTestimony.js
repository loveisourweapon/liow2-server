var modelUtils = require('../utils/models');
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var SalvationTestimonySchema = new mongoose.Schema({
  user: { type: ObjectId, ref: 'User', required: true },
  group: { type: ObjectId, ref: 'Group' },
  campaign: { type: ObjectId, ref: 'Campaign' },
  isFor: { type: String, required: true },
  commitmentType: { type: String, required: true },
  ageRange: { type: String, required: true },
  churchConnection: { type: String, required: true },
  created: { type: Date, default: Date.now, required: true },
});

SalvationTestimonySchema.plugin(modelUtils.findOneOrThrow);

SalvationTestimonySchema.statics.getFilter = function () {
  return ['group', 'campaign', 'isFor', 'commitmentType', 'ageRange', 'churchConnection'];
};

module.exports = mongoose.model('SalvationTestimony', SalvationTestimonySchema);

/**
 * @apiDefine SalvationTestimonyResponse
 * @apiVersion 1.23.0
 *
 * @apiSuccess {SalvationTestimony[]} testimonies          List of testimonies
 * @apiSuccess {string}              testimonies._id      Testimony ObjectId
 * @apiSuccess {string}              testimonies.user     User ObjectId
 * @apiSuccess {string}              testimonies.group    Group ObjectId
 * @apiSuccess {string}              testimonies.campaign Campaign ObjectId
 * @apiSuccess {string}              testimonies.isFor    Who the testimony is for
 * @apiSuccess {string}              testimonies.commitmentType Type of commitment
 * @apiSuccess {string}              testimonies.ageRange Age range of the person
 * @apiSuccess {string}              testimonies.churchConnection Church connection status
 * @apiSuccess {Date}                testimonies.created  Created timestamp
 *
 * @apiSuccessExample {json} Response
 *   HTTP/1.1 200 OK
 *   [{
 *     "_id": "55f6c56186b959ac12490e1e",
 *     "user": "55f6c57486b959ac12490e1a",
 *     "group": "55f6c58086b959ac12490e1c",
 *     "campaign": "55f6c58086b959ac12490e1d",
 *     "isFor": "self",
 *     "commitmentType": "new",
 *     "ageRange": "18-25",
 *     "churchConnection": "member",
 *     "created": "2024-03-14T13:56:27.250Z"
 *   }]
 */

/**
 * @apiDefine SalvationTestimonyRequestBody
 * @apiVersion 1.23.0
 *
 * @apiParam (Body) {string} isFor            Who the testimony is for
 * @apiParam (Body) {string} commitmentType   Type of commitment
 * @apiParam (Body) {string} ageRange         Age range of the person
 * @apiParam (Body) {string} churchConnection Church connection status
 * @apiParam (Body) {string} [group]          Group ObjectId
 *
 * @apiParamExample {json} Request
 *   {
 *     "isFor": "self",
 *     "commitmentType": "new",
 *     "ageRange": "18-25",
 *     "churchConnection": "member",
 *     "group": "55f6c58086b959ac12490e1c"
 *   }
 */

/**
 * @apiDefine CreateSalvationTestimonyResponse
 * @apiVersion 1.23.0
 *
 * @apiSuccess (201) {SalvationTestimony} testimony          Created testimony
 * @apiSuccess (201) {string}           testimony._id      Testimony ObjectId
 * @apiSuccess (201) {string}           testimony.user     User ObjectId
 * @apiSuccess (201) {string}           testimony.group    Group ObjectId
 * @apiSuccess (201) {string}           testimony.campaign Campaign ObjectId
 * @apiSuccess (201) {string}           testimony.isFor    Who the testimony is for
 * @apiSuccess (201) {string}           testimony.commitmentType Type of commitment
 * @apiSuccess (201) {string}           testimony.ageRange Age range of the person
 * @apiSuccess (201) {string}           testimony.churchConnection Church connection status
 * @apiSuccess (201) {Date}             testimony.created  Created timestamp
 *
 * @apiSuccessExample {json} Response
 *   HTTP/1.1 201 Created
 *   {
 *     "_id": "55f6c56186b959ac12490e1e",
 *     "user": "55f6c57486b959ac12490e1a",
 *     "group": "55f6c58086b959ac12490e1c",
 *     "campaign": "55f6c58086b959ac12490e1d",
 *     "isFor": "self",
 *     "commitmentType": "new",
 *     "ageRange": "18-25",
 *     "churchConnection": "member",
 *     "created": "2024-03-14T13:56:27.250Z"
 *   }
 */
