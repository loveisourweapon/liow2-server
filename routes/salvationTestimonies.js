var partialRight = require('lodash/partialRight');
var router = require('express').Router();
var routeUtils = require('../utils/route');
var mailUtils = require('../utils/mail');

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
  let savedTestimony;

  routeUtils.getCurrentCampaign(req).then((req) => {
    new SalvationTestimony(req.body)
      .save()
      .then((salvationTestimony) => {
        savedTestimony = salvationTestimony;
        // If there's a group ID, fetch the group details
        if (salvationTestimony.group) {
          return Group.findById(salvationTestimony.group).exec();
        }
        return null;
      })
      .then((group) => {
        // Send email notification
        return mailUtils
          .sendSalvationTestimony(savedTestimony, req.authUser, group)
          .then(() =>
            res.status(201).location(`/salvations/${savedTestimony._id}`).json(savedTestimony)
          );
      })
      .catch((err) => next(err));
  });
});

module.exports = router;
