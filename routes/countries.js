var express = require('express'),
    router = express.Router(),
    paramHandler = require('../utils/routes').paramHandler;

var Country = require('../models/Country'),
    Group = require('../models/Group');

router.param('country', paramHandler.bind(Country));

/* GET /countries */
router.get('/', function __getCountries(req, res, next) {
  Country.find(function __countryFind(err, countries) {
    if (err) { return next(err); }

    res.status(200).json(countries);
  });
});

/* GET /countries/:country */
router.get('/:country', function __getCountry(req, res) {
  res.status(200).json(req.country);
});

/* GET /countries/:country/groups */
router.get('/:country/groups', function __getCountryGroups(req, res, next) {
  Group.find({ country: req.country._id }, function __groupFindByCountry(err, groups) {
    if (err) { return next(err); }

    res.status(200).json(groups);
  });
});

module.exports = router;
