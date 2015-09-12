var _ = require('lodash'),
    express = require('express'),
    router = express.Router(),
    paramHandler = require('../utils/routes').paramHandler;

var ObjectId = require('mongoose').Types.ObjectId,
    Act = require('../models/Act'),
    Like = require('../models/Like'),
    Comment = require('../models/Comment');

router.param('act', paramHandler.bind(Act));
router.param('like', paramHandler.bind(Like));
router.param('comment', paramHandler.bind(Comment));

/**
 * GET /acts
 */
router.get('/', (req, res, next) => {
  Act.find((err, acts) => {
    if (err) { return next(err); }

    res.status(200).json(acts);
  });
});

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
router.get('/:act', (req, res) => {
  res.status(200).json(req.act);
});

/**
 * DELETE /acts/:act
 */
router.delete('/:act', (req, res, next) => {
  req.act.remove((err) => {
    if (err) { return next(err); }

    res.status(204).send();
  });
});

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
router.delete('/:act/likes/:like', (req, res, next) => {
  req.like.remove((err) => {
    if (err) { return next(err); }

    res.status(204).send();
  });
});

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
router.put('/:act/comments/:comment', (req, res, next) => {
  req.body = _.pick(req.body, Comment.getFilter());
  req.body.modified = new Date();

  Comment.findByIdAndUpdate(req.comment._id, req.body, { new: true }, (err, comment) => {
    if (err) { return next(err); }

    res.status(200).json(comment);
  });
});

/**
 * DELETE /acts/:act/comments/:comment
 */
router.delete('/:act/comments/:comment', (req, res, next) => {
  req.comment.remove((err) => {
    if (err) { return next(err); }

    res.status(204).send();
  });
});

module.exports = router;
