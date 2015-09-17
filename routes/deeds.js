var _ = require('lodash'),
    express = require('express'),
    router = express.Router(),
    route = require('../utils/route');

var ObjectId = require('mongoose').Types.ObjectId,
    Deed = require('../models/Deed'),
    Like = require('../models/Like'),
    Comment = require('../models/Comment');

router.param('deed', _.partialRight(route.paramHandler, Deed));
router.param('like', _.partialRight(route.paramHandler, Like));
router.param('comment', _.partialRight(route.paramHandler, Comment));

/**
 * GET /deeds
 */
router.get('/', _.partialRight(route.getAll, Deed));

/**
 * POST /deeds
 */
router.post('/', (req, res, next) => {
  req.body = _.pick(req.body, Deed.getFilter());

  new Deed(req.body).save((err, deed) => {
    if (err) { return next(err); }

    res.status(201).location(`/deeds/${deed._id}`).json(deed);
  });
});

/**
 * GET /deeds/:deed
 */
router.get('/:deed', _.partialRight(route.getByParam, 'deed'));

/**
 * PUT /deeds/:deed
 */
router.put('/:deed', _.partialRight(route.putByParam, Deed, 'deed'));

/**
 * DELETE /deeds/:deed
 */
router.delete('/:deed', _.partialRight(route.deleteByParam, 'deed'));

/**
 * GET /deeds/:deed/likes
 */
router.get('/:deed/likes', _.partialRight(route.getByTarget, Like, 'deed'));

/**
 * POST /deeds/:deed/likes
 */
router.post('/:deed/likes', (req, res, next) => {
  req.body = _.pick(req.body, Like.getFilter());
  req.body.user = ObjectId.isValid(req.body.user) ? ObjectId(req.body.user) : null;
  req.body.target = { deed: req.deed._id };

  new Like(req.body).save((err, like) => {
    if (err) { return next(err); }

    res.status(201).location(`/deeds/${req.deed._id}/likes/${like._id}`).json(like);
  });
});

/**
 * DELETE /deeds/:deed/likes/:like
 */
router.delete('/:deed/likes/:like', _.partialRight(route.deleteByParam, 'like'));

/**
 * GET /deeds/:deed/comments
 */
router.get('/:deed/comments', _.partialRight(route.getByTarget, Comment, 'deed'));

/**
 * POST /deeds/:deed/comments
 */
router.post('/:deed/comments', (req, res, next) => {
  req.body = _.pick(req.body, Comment.getFilter());
  req.body.user = ObjectId.isValid(req.body.user) ? ObjectId(req.body.user) : null;
  req.body.target = { deed: req.deed._id };

  new Comment(req.body).save((err, comment) => {
    if (err) { return next(err); }

    res.status(201).location(`/deeds/${req.deed._id}/comments/${comment._id}`).json(comment);
  });
});

/**
 * PUT /deeds/:deed/comments/:comment
 */
router.put('/:deed/comments/:comment', _.partialRight(route.putByParam, Comment, 'comment'));

/**
 * DELETE /deeds/:deed/comments/:comment
 */
router.delete('/:deed/comments/:comment', _.partialRight(route.deleteByParam, 'comment'));

module.exports = router;
