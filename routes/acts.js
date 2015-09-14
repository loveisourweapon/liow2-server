var _ = require('lodash'),
    express = require('express'),
    router = express.Router(),
    route = require('../utils/route');

var ObjectId = require('mongoose').Types.ObjectId,
    Act = require('../models/Act'),
    Like = require('../models/Like'),
    Comment = require('../models/Comment');

router.param('act', route.paramHandler.bind(Act));
router.param('like', route.paramHandler.bind(Like));
router.param('comment', route.paramHandler.bind(Comment));

/**
 * GET /acts
 */
router.get('/', route.getAll.bind(Act));

/**
 * POST /acts
 */
router.post('/', (req, res, next) => {
  req.body = _.pick(req.body, Act.getFilter());
  req.body.user = ObjectId.isValid(req.body.user) ? ObjectId(req.body.user) : null;
  req.body.group = ObjectId.isValid(req.body.group) ? ObjectId(req.body.group) : null;
  req.body.deed = ObjectId.isValid(req.body.deed) ? ObjectId(req.body.deed) : null;

  new Act(req.body).save((err, act) => {
    if (err) { return next(err); }

    res.status(201).location(`/acts/${act._id}`).json(act);
  });
});

/**
 * GET /acts/:act
 */
router.get('/:act', _.partialRight(route.getByParam, 'act'));

/**
 * DELETE /acts/:act
 */
router.delete('/:act', _.partialRight(route.deleteByParam, 'act'));

/**
 * GET /acts/:act/likes
 */
router.get('/:act/likes', (req, res, next) => {
  Like.find({ 'target.act': req.act._id }, (err, likes) => {
    if (err) { return next(err); }

    res.status(200).json(likes);
  });
});

/**
 * POST /acts/:act/likes
 */
router.post('/:act/likes', (req, res, next) => {
  req.body = _.pick(req.body, Like.getFilter());
  req.body.user = ObjectId.isValid(req.body.user) ? ObjectId(req.body.user) : null;
  req.body.target = { act: req.act._id };

  new Like(req.body).save((err, like) => {
    if (err) { return next(err); }

    res.status(201).location(`/acts/${req.act._id}/likes/${like._id}`).json(like);
  });
});

/**
 * DELETE /acts:act/likes/:like
 */
router.delete('/:act/likes/:like', _.partialRight(route.deleteByParam, 'like'));

/**
 * GET /acts/:act/comments
 */
router.get('/:act/comments', (req, res, next) => {
  Comment.find({ 'target.act': req.act._id }, (err, comments) => {
    if (err) { return next(err); }

    res.status(200).json(comments);
  });
});

/**
 * POST /acts/:act/comments
 */
router.post('/:act/comments', (req, res, next) => {
  req.body = _.pick(req.body, Comment.getFilter());
  req.body.user = ObjectId.isValid(req.body.user) ? ObjectId(req.body.user) : null;
  req.body.target = { act: req.act._id };

  new Comment(req.body).save((err, comment) => {
    if (err) { return next(err); }

    res.status(201).location(`/acts/${req.act._id}/comments/${comment._id}`).json(comment);
  });
});

/**
 * PUT /acts/:act/comments/:comment
 */
router.put('/:act/comments/:comment', _.partialRight(route.putByParam, 'comment').bind(Comment));

/**
 * DELETE /acts/:act/comments/:comment
 */
router.delete('/:act/comments/:comment', _.partialRight(route.deleteByParam, 'comment'));

module.exports = router;
