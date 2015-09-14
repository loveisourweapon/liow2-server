var _ = require('lodash'),
    express = require('express'),
    router = express.Router(),
    route = require('../utils/route');

var Country = require('../models/Country'),
    Group = require('../models/Group');

router.param('country', route.paramHandler.bind(Country));

/**
 * GET /countries
 */
router.get('/', route.getAll.bind(Country));

/**
 * GET /countries/:country
 */
router.get('/:country', _.partialRight(route.getByParam, 'country'));

/**
 * GET /countries/:country/groups
 */
router.get('/:country/groups', (req, res, next) => {
  Group.find({ country: req.country._id }, (err, groups) => {
    if (err) { return next(err); }

    res.status(200).json(groups);
  });
});

module.exports = router;
