var _ = require('lodash'),
    express = require('express'),
    router = express.Router(),
    route = require('../utils/route');

var ObjectId = require('mongoose').Types.ObjectId,
    Deed = require('../models/Deed'),
    Like = require('../models/Like'),
    Comment = require('../models/Comment');

router.param('deed', route.paramHandler.bind(Deed));
router.param('like', route.paramHandler.bind(Like));
router.param('comment', route.paramHandler.bind(Comment));

/**
 * GET /deeds
 */
router.get('/', (req, res, next) => {
  Deed.find((err, deeds) => {
    if (err) { return next(err); }

    res.status(200).json(deeds);
  });
});

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
router.get('/:deed', (req, res) => {
  res.status(200).json(req.deed);
});

/**
 * PUT /deeds/:deed
 */
router.put('/:deed', (req, res, next) => {
  req.body = _.pick(req.body, Deed.getFilter());
  req.body.modified = new Date();

  Deed.findByIdAndUpdate(req.deed._id, req.body, { new: true }, (err, deed) => {
    if (err) { return next(err); }

    res.status(200).json(deed);
  });
});

/**
 * DELETE /deeds/:deed
 */
router.delete('/:deed', (req, res, next) => {
  req.deed.remove((err) => {
    if (err) { return next(err); }

    res.status(204).send();
  });
});

/**
 * GET /deeds/:deed/likes
 */
router.get('/:deed/likes', (req, res, next) => {
  Like.find({ 'target.deed': req.deed._id }, (err, likes) => {
    if (err) { return next(err); }

    res.status(200).json(likes);
  });
});

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
router.delete('/:deed/likes/:like', (req, res, next) => {
  req.like.remove((err) => {
    if (err) { return next(err); }

    res.status(204).send();
  });
});

/**
 * GET /deeds/:deed/comments
 */
router.get('/:deed/comments', (req, res, next) => {
  Comment.find({ 'target.deed': req.deed._id }, (err, comments) => {
    if (err) { return next(err); }

    res.status(200).json(comments);
  });
});

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
router.put('/:deed/comments/:comment', (req, res, next) => {
  req.body = _.pick(req.body, Comment.getFilter());
  req.body.modified = new Date();

  Comment.findByIdAndUpdate(req.comment._id, req.body, { new: true }, (err, comment) => {
    if (err) { return next(err); }

    res.status(200).json(comment);
  });
});

/**
 * DELETE /deeds/:deed/comments/:comment
 */
router.delete('/:deed/comments/:comment', (req, res, next) => {
  req.comment.remove((err) => {
    if (err) { return next(err); }

    res.status(204).send();
  });
});

module.exports = router;
