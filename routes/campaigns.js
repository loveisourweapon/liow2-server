var has = require('lodash/has'),
    partialRight = require('lodash/partialRight'),
    moment = require('moment'),
    jsonpatch = require('fast-json-patch'),
    routeUtils = require('../utils/route'),
    express = require('express'),
    router = express.Router();

var Campaign = require('../models/Campaign'),
    Deed = require('../models/Deed');

router.param('campaign', partialRight(routeUtils.paramHandler, Campaign));
router.param('deed', partialRight(routeUtils.paramHandler, Deed));

/**
 * @api {get} /campaigns List campaigns
 * @apiVersion 1.0.0
 * @apiName GetCampaigns
 * @apiGroup Campaigns
 * @apiPermission none
 *
 * @apiUse CampaignsResponse
 */
router.get(
  '/',
  partialRight(routeUtils.getAll, Campaign, {
    path: 'deeds.deed',
    select: 'title urlTitle logo'
  })
);

/**
 * @api {post} /campaigns Create campaign
 * @apiVersion 1.0.0
 * @apiName PostCampaigns
 * @apiGroup Campaigns
 * @apiPermission admin
 *
 * @apiUse CampaignRequestBody
 * @apiUse CreateCampaignResponse
 */
router.post(
  '/',
  routeUtils.ensureAuthenticated,
  partialRight(routeUtils.ensureAdminOf, 'body.group'),
  (req, res, next) => {
    req.body = routeUtils.filterProperties(req.body, Campaign);
    req.body.dateStart = has(req.body.dateStart) ? moment(req.body.dateStart).toDate() : moment().toDate();
    req.body.dateEnd = has(req.body.dateEnd) ? moment(req.body.dateEnd).toDate() : null;

    new Campaign(req.body).save()
      .then(campaign => res.status(201).location(`/campaigns/${campaign._id}`).json(campaign))
      .catch(err => next(err));
  }
);

/**
 * @api {get} /campaigns/:campaign Get campaign
 * @apiVersion 1.0.0
 * @apiName GetCampaign
 * @apiGroup Campaigns
 * @apiPermission none
 *
 * @apiParam {string} campaign Campaign ObjectId
 *
 * @apiUse CampaignResponse
 */
router.get(
  '/:campaign',
  partialRight(routeUtils.getByParam, 'campaign', 'deeds.deed')
);

/**
 * @api {put} /campaigns/:campaign Update campaign
 * @apiVersion 1.4.0
 * @apiName PutCampaign
 * @apiGroup Campaigns
 * @apiPermission admin
 *
 * @apiParam {string} campaign Campaign ObjectId
 *
 * @apiUse CampaignRequestBody
 * @apiUse CampaignResponse
 */
router.put(
  '/:campaign',
  routeUtils.ensureAuthenticated,
  partialRight(routeUtils.ensureAdminOf, 'campaign.group'),
  partialRight(routeUtils.putByParam, Campaign, 'campaign')
);

/**
 * PATCH /campaigns/:campaign
 */
/**
 * @api {patch} /campaigns/:campaign Partial update campaign
 * @apiVersion 1.3.0
 * @apiName PatchCampaign
 * @apiGroup Campaigns
 * @apiPermission admin
 *
 * @apiParam {string} campaign Campaign ObjectId
 *
 * @apiParam (Body) {object[]} patches         JSON Patch patches
 * @apiParam (Body) {string}   patches.op      Operation
 * @apiParam (Body) {string}   patches.path    JSON Pointer path
 * @apiParam (Body) {mixed}    [patches.value] New path value
 *
 * @apiParamExample {json} Request
 *   [{
 *     "op": "replace",
 *     "path": "/deeds/0/published",
 *     "value": true
 *   }]
 *
 * @apiUse NoContentResponse
 */
router.patch(
  '/:campaign',
  routeUtils.ensureAuthenticated,
  partialRight(routeUtils.ensureAdminOf, 'campaign.group'),
  (req, res, next) => {
    jsonpatch.apply(req.campaign, routeUtils.filterJsonPatch(req.body, Campaign));
    req.campaign.modified = new Date();

    req.campaign.save()
      .then(() => res.status(204).send())
      .catch(err => next(err));
  }
);

module.exports = router;
