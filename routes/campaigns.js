var _ = require('lodash'),
    moment = require('moment'),
    routeUtils = require('../utils/route'),
    express = require('express'),
    router = express.Router(),
    HttpError = require('../utils/general').HttpError,
    Campaign = require('../models/Campaign');

router.param('campaign', _.partialRight(routeUtils.paramHandler, Campaign));

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

module.exports = router;
