var partialRight = require('lodash/partialRight');
var routeUtils = require('../utils/route');
var express = require('express');
var router = express.Router();

var Country = require('../models/Country');
var Group = require('../models/Group');

router.param('country', partialRight(routeUtils.paramHandler, Country));

/**
 * @api {get} /countries List countries
 * @apiVersion 1.0.0
 * @apiName GetCountries
 * @apiGroup Countries
 * @apiPermission none
 *
 * @apiUse CountriesResponse
 */
router.get('/', partialRight(routeUtils.getAll, Country));

/**
 * @api {get} /countries/:country Get country
 * @apiVersion 1.0.0
 * @apiName GetCountry
 * @apiGroup Countries
 * @apiPermission none
 *
 * @apiParam {string} country Country ObjectId
 *
 * @apiUse CountryResponse
 */
router.get('/:country', partialRight(routeUtils.getByParam, 'country'));

/**
 * @api {get} /countries/:country/groups Get country groups
 * @apiVersion 1.0.0
 * @apiName GetCountryGroups
 * @apiGroup Countries
 * @apiPermission none
 *
 * @apiParam {string} country Country ObjectId
 *
 * @apiUse GroupsResponse
 */
router.get('/:country/groups', (req, res, next) => {
  Group.find({ country: req.country._id })
    .exec()
    .then((groups) => res.status(200).json(groups))
    .catch((err) => next(err));
});

module.exports = router;
