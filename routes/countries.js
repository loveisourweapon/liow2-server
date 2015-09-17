var _ = require('lodash'),
    express = require('express'),
    router = express.Router(),
    route = require('../utils/route');

var Country = require('../models/Country'),
    Group = require('../models/Group');

router.param('country', _.partialRight(route.paramHandler, Country));

/**
 * @api {get} /countries List countries
 * @apiName GetCountries
 * @apiGroup Countries
 *
 * @apiUse GetCountriesSuccess
 */
router.get('/', _.partialRight(route.getAll, Country));

/**
 * @api {get} /countries/:country Get country
 * @apiName GetCountry
 * @apiGroup Countries
 *
 * @apiParam {string} country Unique country ObjectId
 *
 * @apiUse GetCountrySuccess
 */
router.get('/:country', _.partialRight(route.getByParam, 'country'));

/**
 * @api {get} /countries/:country/groups Get country groups
 * @apiName GetCountryGroups
 * @apiGroup Countries
 *
 * @apiParam {string} country Unique country ObjectId
 *
 * @apiSuccess {Group[]} groups Collection of groups belonging to a country
 */
router.get('/:country/groups', (req, res, next) => {
  Group.find({ country: req.country._id }, (err, groups) => {
    if (err) { return next(err); }

    res.status(200).json(groups);
  });
});

module.exports = router;
