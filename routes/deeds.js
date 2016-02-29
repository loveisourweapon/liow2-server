var _ = require('lodash'),
    routeUtils = require('../utils/route'),
    express = require('express'),
    router = express.Router();

var Deed = require('../models/Deed'),
    Like = require('../models/Like'),
    Comment = require('../models/Comment');

router.param('deed', _.partialRight(routeUtils.paramHandler, Deed));
router.param('like', _.partialRight(routeUtils.paramHandler, Like));
router.param('comment', _.partialRight(routeUtils.paramHandler, Comment));

/**
 * GET /deeds
 */
router.get(
  '/',
  _.partialRight(routeUtils.getAll, Deed)
);

/**
 * POST /deeds
 */
router.post(
  '/',
  routeUtils.ensureAuthenticated,
  routeUtils.ensureSuperAdmin,
  (req, res, next) => {
    req.body = routeUtils.filterProperties(req.body, Deed);

    new Deed(req.body).save()
      .then(deed => res.status(201).location(`/deeds/${deed._id}`).json(deed))
      .catch(err => next(err));
  }
);

/**
 * GET /deeds/:deed
 */
router.get(
  '/:deed',
  _.partialRight(routeUtils.getByParam, 'deed')
);

/**
 * PUT /deeds/:deed
 */
router.put(
  '/:deed',
  routeUtils.ensureAuthenticated,
  routeUtils.ensureSuperAdmin,
  _.partialRight(routeUtils.putByParam, Deed, 'deed')
);

/**
 * DELETE /deeds/:deed
 */
router.delete(
  '/:deed',
  routeUtils.ensureAuthenticated,
  routeUtils.ensureSuperAdmin,
  _.partialRight(routeUtils.deleteByParam, 'deed')
);

/**
 * GET /deeds/:deed/comments
 */
router.get(
  '/:deed/comments',
  _.partialRight(routeUtils.getByTarget, Comment, 'deed')
);

/**
 * POST /deeds/:deed/comments
 */
router.post(
  '/:deed/comments',
  routeUtils.ensureAuthenticated,
  (req, res, next) => {
    req.body = routeUtils.filterProperties(req.body, Comment);
    req.body.user = req.authUser._id;
    req.body.target = { deed: req.deed._id };

    new Comment(req.body).save()
      .then(comment => res.status(201).location(`/deeds/${req.deed._id}/comments/${comment._id}`).json(comment))
      .catch(err => next(err));
  }
);

/**
 * PUT /deeds/:deed/comments/:comment
 */
router.put(
  '/:deed/comments/:comment',
  routeUtils.ensureAuthenticated,
  _.partialRight(routeUtils.ensureSameUser, 'comment.user'),
  _.partialRight(routeUtils.putByParam, Comment, 'comment')
);

/**
 * DELETE /deeds/:deed/comments/:comment
 */
router.delete(
  '/:deed/comments/:comment',
  routeUtils.ensureAuthenticated,
  _.partialRight(routeUtils.ensureSameUser, 'comment.user'),
  _.partialRight(routeUtils.deleteByParam, 'comment')
);

module.exports = router;
