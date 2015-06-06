var express = require('express'),
    router = express.Router();

var Dummy = require('../models/Dummy');

/* GET home page. */
router.get('/', function(req, res, next) {
  Dummy.find(function (err, dummies) {
    if (err) return console.error(err);
    res.status(200).json(dummies);
  });
});

/* POST to home page. */
router.post('/', function (req, res, next) {
  Dummy.find(function (err, dummies) {
    if (err) return console.error(err);
    var dummy = new Dummy({ name: 'dummy' + (dummies.length + 1) });

    dummy.save(function (err, dummy) {
      if (err) return console.error(err);
      res.status(201).json({});
    });
  });
});

module.exports = router;
