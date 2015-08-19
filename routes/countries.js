var express = require('express'),
    router = express.Router();

var mongoose = require('mongoose'),
    ObjectId = mongoose.Types.ObjectId,
    Country = require('../models/Country'),
    Group = require('../models/Group');

router.param('country_id', function __paramCountryId(req, res, next, id) {
  if (!ObjectId.isValid(id)) { return next(new Error('Invalid country_id')); }

  Country.findById(id, function __countryFindById(err, country) {
    if (err) { return next(err); }
    if (!country) { return next(new Error('Country ' + id + ' not found')); }

    req.country = country;
    next();
  });
});

/* GET /countries */
router.get('/', function __getCountries(req, res, next) {
  Country.find(function __countryFind(err, countries) {
    if (err) { return next(err); }

    res.status(200).json(countries);
  });
});

/* GET /countries/:country_id */
router.get('/:country_id', function __getCountry(req, res) {
  res.status(200).json(req.country);
});

/* GET /countries/:country_id/groups */
router.get('/:country_id/groups', function __getCountryGroups(req, res, next) {
  Group.find({ country: req.country }, function __groupFindByCountry(err, groups) {
    if (err) { return next(err); }

    res.status(200).json(groups);
  });
});

module.exports = router;
