var HttpError = require('../utils/general').HttpError,
    modelUtils = require('../utils/models'),
    mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId;

var DeedPublishSchema = new mongoose.Schema({
  deed: { type: ObjectId, ref: 'Deed', required: true },
  published: { type: Boolean, default: false, required: true }
});

var CampaignSchema = new mongoose.Schema({
  group: { type: ObjectId, ref: 'Group', required: true },
  dateStart: Date,
  dateEnd: Date,
  active: { type: Boolean, default: true, required: true },
  deeds: {
    type: [DeedPublishSchema],
    required: true,
    validate: [modelUtils.hasOne, 'At least one deed is required', 'hasdeed']
  },
  created: { type: Date, default: Date.now, required: true },
  modified: Date
});

CampaignSchema.plugin(modelUtils.findOneOrThrow);

CampaignSchema.pre('validate', function (next) {
  if (!this.isNew) {
    return next();
  }

  mongoose.models['Campaign']
    .find({ group: this.group, active: true })
    .then(campaigns => {
      if (campaigns.length > 0) {
        return next(new HttpError('There is already an active campaign for your group'));
      }
      next();
    })
    .catch(() => next()); // Ignore errors for now
});

CampaignSchema.statics.getFilter = function () {
  return ['group', 'dateStart', 'dateEnd', 'active', 'deeds'];
};

module.exports = mongoose.model('Campaign', CampaignSchema);

/**
 * @apiDefine CampaignsResponse
 *
 * @apiSuccess {Campaign[]} campaigns                 List of campaigns
 * @apiSuccess {string}     campaigns._id             Campaign ObjectId
 * @apiSuccess {string}     campaigns.group           Group ObjectId
 * @apiSuccess {Date}       campaigns.dateStart       Campaign start date
 * @apiSuccess {Date}       campaigns.dateEnd         Campaign end date
 * @apiSuccess {boolean}    campaigns.active          Campaign active state
 * @apiSuccess {object[]}   campaigns.deeds           List of Deeds
 * @apiSuccess {string}     campaigns.deeds.deed      Deed ObjectId
 * @apiSuccess {boolean}    campaigns.deeds.published Deed published state
 * @apiSuccess {Date}       campaigns.created         Created timestamp
 * @apiSuccess {Date}       campaigns.modified        Modified timestamp
 *
 * @apiSuccessExample {json} Response
 *   HTTP/1.1 200 OK
 *   [{
 *     "_id": "55f6c56186b959ac12490e1c",
 *     "group": "55f6c57486b959ac12490e1a",
 *     "dateStart": "2015-09-14T13:56:27.250Z",
 *     "active": true,
 *     "deeds": [{
 *       "deed": "55f6c57486b959ac12490e1b",
 *       "published": true
 *     }],
 *     "created": "2015-09-14T13:56:27.250Z",
 *     "modified": "2015-09-14T14:32:27.250Z"
 *   }]
 */

/**
 * @apiDefine CampaignResponse
 *
 * @apiSuccess {Campaign} campaign                 Campaign
 * @apiSuccess {string}   campaign._id             Campaign ObjectId
 * @apiSuccess {string}   campaign.group           Group ObjectId
 * @apiSuccess {Date}     campaign.dateStart       Campaign start date
 * @apiSuccess {Date}     campaign.dateEnd         Campaign end date
 * @apiSuccess {boolean}  campaign.active          Campaign active state
 * @apiSuccess {object[]} campaign.deeds           List of Deeds
 * @apiSuccess {string}   campaign.deeds.deed      Deed ObjectId
 * @apiSuccess {boolean}  campaign.deeds.published Deed published state
 * @apiSuccess {Date}     campaign.created         Created timestamp
 * @apiSuccess {Date}     campaign.modified        Modified timestamp
 *
 * @apiSuccessExample {json} Response
 *   HTTP/1.1 200 OK
 *   {
 *     "_id": "55f6c56186b959ac12490e1c",
 *     "group": "55f6c57486b959ac12490e1a",
 *     "dateStart": "2015-09-14T13:56:27.250Z",
 *     "active": true,
 *     "deeds": [{
 *       "deed": "55f6c57486b959ac12490e1b",
 *       "published": true
 *     }],
 *     "created": "2015-09-14T13:56:27.250Z",
 *     "modified": "2015-09-14T14:32:27.250Z"
 *   }
 */

/**
 * @apiDefine CampaignRequestBody
 *
 * @apiParam (Body) {string}   group             Group ObjectId
 * @apiParam (Body) {Date}     [dateStart]       Campaign start date
 * @apiParam (Body) {object[]} deeds             List of Deeds
 * @apiParam (Body) {string}   deeds.deed        Deed ObjectId
 * @apiParam (Body) {boolean}  [deeds.published] Deed published state
 *
 * @apiParamExample {json} Request
 *   {
 *     "group": "55f6c56186b959ac12490e1a",
 *     "deeds": [{
 *       "deed": "55f6c56186b959ac12490e1b"
 *     }]
 *   }
 */

/**
 * @apiDefine CreateCampaignResponse
 *
 * @apiSuccess (201) {Campaign} campaign                 Campaign
 * @apiSuccess (201) {string}   campaign._id             Campaign ObjectId
 * @apiSuccess (201) {string}   campaign.group           Group ObjectId
 * @apiSuccess (201) {Date}     campaign.dateStart       Campaign start date
 * @apiSuccess (201) {boolean}  campaign.active          Campaign active state
 * @apiSuccess (201) {object[]} campaign.deeds           List of Deeds
 * @apiSuccess (201) {string}   campaign.deeds.deed      Deed ObjectId
 * @apiSuccess (201) {boolean}  campaign.deeds.published Deed published state
 * @apiSuccess (201) {Date}     campaign.created         Created timestamp
 *
 * @apiSuccessExample {json} Response
 *   HTTP/1.1 201 Created
 *   {
 *     "_id": "55f6c56186b959ac12490e1c",
 *     "group": "55f6c57486b959ac12490e1a",
 *     "dateStart": "2015-09-14T13:56:27.250Z",
 *     "active": true,
 *     "deeds": [{
 *       "deed": "55f6c57486b959ac12490e1b",
 *       "published": false
 *     }],
 *     "created": "2015-09-14T13:56:27.250Z"
 *   }
 */
