var _ = require('lodash'),
    routeUtils = require('../utils/route'),
    express = require('express'),
    router = express.Router();

var Country = require('../models/Country'),
    Group = require('../models/Group');

router.param('country', _.partialRight(routeUtils.paramHandler, Country));

/**
 * @api {get} /countries List countries
 * @apiName GetCountries
 * @apiGroup Countries
 *
 * @apiUse GetCountriesSuccess
 */
router.get(
  '/',
  _.partialRight(routeUtils.getAll, Country)
);

/**
 * @api {get} /countries/:country Get country
 * @apiName GetCountry
 * @apiGroup Countries
 *
 * @apiParam {string} country Unique country ObjectId
 *
 * @apiUse GetCountrySuccess
 */
router.get(
  '/:country',
  _.partialRight(routeUtils.getByParam, 'country')
);

/**
 * @api {get} /countries/:country/groups Get country groups
 * @apiName GetCountryGroups
 * @apiGroup Countries
 *
 * @apiParam {string} country Unique country ObjectId
 *
 * @apiSuccess {Group[]} groups Collection of groups belonging to a country
 */
router.get(
  '/:country/groups',
  (req, res, next) => {
    Group.find({ country: req.country._id })
      .exec()
      .then(groups => res.status(200).json(groups))
      .catch(err => next(err));
  }
);

module.exports = router;
