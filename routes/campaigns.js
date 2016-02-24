var _ = require('lodash'),
    moment = require('moment'),
    jsonpatch = require('fast-json-patch'),
    routeUtils = require('../utils/route'),
    express = require('express'),
    router = express.Router();

var Campaign = require('../models/Campaign'),
    Deed = require('../models/Deed');

router.param('campaign', _.partialRight(routeUtils.paramHandler, Campaign));
router.param('deed', _.partialRight(routeUtils.paramHandler, Deed));

/**
 * GET /campaigns
 */
router.get(
  '/',
  _.partialRight(routeUtils.getAll, Campaign, 'deeds.deed')
);

/**
 * POST /campaigns
 */
router.post(
  '/',
  routeUtils.ensureAuthenticated,
  _.partialRight(routeUtils.ensureAdminOf, 'body.group'),
  (req, res, next) => {
    req.body = routeUtils.filterProperties(req.body, Campaign);
    req.body.dateStart = _.has(req.body.dateStart) ? moment(req.body.dateStart).toDate() : moment().toDate();
    req.body.dateEnd = _.has(req.body.dateEnd) ? moment(req.body.dateEnd).toDate() : null;

    new Campaign(req.body).save()
      .then(campaign => res.status(201).location(`/campaigns/${campaign._id}`).json(campaign))
      .catch(err => next(err));
  }
);

/**
 * GET /campaigns/:campaign
 */
router.get(
  '/:campaign',
  _.partialRight(routeUtils.getByParam, 'campaign', 'deeds.deed')
);

/**
 * PUT /campaigns/:campaign
 */
router.put(
  '/:campaign',
  routeUtils.ensureAuthenticated,
  _.partialRight(routeUtils.ensureAdminOf, 'campaign.group'),
  _.partialRight(routeUtils.putByParam, Campaign, 'campaign')
);

/**
 * PATCH /campaigns/:campaign
 */
router.patch(
  '/:campaign',
  routeUtils.ensureAuthenticated,
  _.partialRight(routeUtils.ensureAdminOf, 'campaign.group'),
  (req, res, next) => {
    jsonpatch.apply(req.campaign, routeUtils.filterJsonPatch(req.body, Campaign));
    req.campaign.modified = new Date();

    req.campaign.save()
      .then(() => res.status(204).send())
      .catch(err => next(err));
  }
);

module.exports = router;
