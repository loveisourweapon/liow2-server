var partialRight = require('lodash/partialRight');
var routeUtils = require('../utils/route');
var express = require('express');
var router = express.Router();

var SalvationTestimony = require('../models/SalvationTestimony');
var Group = require('../models/Group');

/**
 * @api {get} /salvation-testimonies Get all salvation testimonies
 * @apiName GetSalvationTestimonies
 * @apiGroup SalvationTestimonies
 * @apiVersion 1.23.0
 *
 * @apiUse SalvationTestimonyResponse
 */
router.get('/', routeUtils.ensureSuperAdmin, partialRight(routeUtils.getAll, SalvationTestimony));

/**
 * @api {post} /salvation-testimonies Create a new salvation testimony
 * @apiName CreateSalvationTestimony
 * @apiGroup SalvationTestimonies
 * @apiVersion 1.23.0
 *
 * @apiUse SalvationTestimonyRequestBody
 * @apiUse CreateSalvationTestimonyResponse
 */
router.post('/', routeUtils.ensureAuthenticated, (req, res, next) => {
  req.body = routeUtils.filterProperties(req.body, SalvationTestimony);
  req.body.user = req.authUser._id;


  routeUtils.getCurrentCampaign(req).then((req) => {
    new SalvationTestimony(req.body)
      .save()
      .then((salvationTestimony) => res.status(201).location(`/salvations/${salvationTestimony._id}`).json(salvationTestimony))
      .catch((err) => next(err));
  });
});

module.exports = router;
