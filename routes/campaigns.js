var _ = require('lodash'),
    moment = require('moment'),
    routeUtils = require('../utils/route'),
    express = require('express'),
    router = express.Router(),
    Campaign = require('../models/Campaign'),
    Deed = require('../models/Deed'),
    HttpError = require('../utils/general').HttpError;

router.param('campaign', _.partialRight(routeUtils.paramHandler, Campaign));
router.param('deed', _.partialRight(routeUtils.paramHandler, Deed));

/**
 * GET /campaigns
 */
router.get('/', _.partialRight(routeUtils.getAll, Campaign, 'deeds.deed'));

/**
 * POST /campaigns
 */
router.post('/', routeUtils.ensureAuthenticated, _.partialRight(routeUtils.ensureAdminOf, 'body.group'), (req, res, next) => {
  req.body = _.pick(req.body, Campaign.getFilter());
  req.body.dateStart = _.has(req.body.dateStart) ? moment(req.body.dateStart).toDate() : moment().toDate();
  req.body.dateEnd = _.has(req.body.dateEnd) ? moment(req.body.dateEnd).toDate() : null;

  new Campaign(req.body).save()
    .then(campaign => res.status(201).location(`/campaigns/${campaign._id}`).json(campaign))
    .catch(err => next(err));
});

/**
 * GET /campaigns/:campaign
 */
router.get('/:campaign', _.partialRight(routeUtils.getByParam, 'campaign', 'deeds.deed'));

/**
 * POST /campaigns/:campaign/deeds/:deed/published
 */
router.post('/:campaign/deeds/:deed/published', (req, res, next) => {
  var deed = _.find(req.campaign.deeds, { deed: req.deed._id });
  if (!deed) {
    return next(new HttpError('Not Found', 404));
  }

  deed.published = true;
  req.campaign.save()
    .then(() => res.status(204).send())
    .catch(err => next(err));
});

/**
 * DELETE /campaigns/:campaign/deeds/:deed/published
 */
router.delete('/:campaign/deeds/:deed/published', (req, res, next) => {
  var deed = _.find(req.campaign.deeds, { deed: req.deed._id });
  if (!deed) {
    return next(new HttpError('Not Found', 404));
  }

  deed.published = false;
  req.campaign.save()
    .then(() => res.status(204).send())
    .catch(err => next(err));
});

module.exports = router;
