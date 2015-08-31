var _ = require('lodash'),
    express = require('express'),
    router = express.Router();

var ObjectId = require('mongoose').Types.ObjectId,
    Deed = require('../models/Deed'),
    Like = require('../models/Like'),
    Comment = require('../models/Comment');

router.param('deed_id', function __paramDeedId(req, res, next, id) {
  if (!ObjectId.isValid(id)) { return next(new Error('Invalid deed_id')); }

  Deed.findById(id, function __deedFindById(err, deed) {
    if (err) { return next(err); }
    if (!deed) { return next(new Error('Deed ' + id + ' not found')); }

    req.deed = deed;
    next();
  });
});

router.param('like_id', function __paramLikeId(req, res, next, id) {
  if (!ObjectId.isValid(id)) { return next(new Error('Invalid like_id')); }

  Like.findById(id, function __likeFindById(err, like) {
    if (err) { return next(err); }
    if (!like) { return next(new Error('Like ' + id + ' not found')); }

    req.like = like;
    next();
  });
});

router.param('comment_id', function __paramCommentId(req, res, next, id) {
  if (!ObjectId.isValid(id)) { return next(new Error('Invalid comment_id')); }

  Comment.findById(id, function __commentFindById(err, comment) {
    if (err) { return next(err); }
    if (!comment) { return next(new Error('Comment ' + id + ' not found')); }

    req.comment = comment;
    next();
  });
});

/* GET /deeds */
router.get('/', function __getDeeds(req, res, next) {
  Deed.find(function __deedFind(err, deeds) {
    if (err) { return next(err); }

    res.status(200).json(deeds);
  });
});

/* POST /deeds */
router.post('/', function __postDeed(req, res, next) {
  req.body = _.pick(req.body, Deed.getFilter());

  var deed = new Deed(req.body);
  deed.save(function __deedSave(err) {
    if (err) { return next(err); }

    res.status(201).send();
  });
});

/* GET /deeds/:deed_id */
router.get('/:deed_id', function __getDeed(req, res) {
  res.status(200).json(req.deed);
});

/* PUT /deeds/:deed_id */
router.put('/:deed_id', function __putDeed(req, res, next) {
  req.body = _.pick(req.body, Deed.getFilter());
  req.body.modified = new Date();

  req.deed.update(req.body, function(err) {
    if (err) { return next(err); }

    res.status(204).send();
  });
});

/* DELETE /deeds/:deed_id */
router.delete('/:deed_id', function __deleteDeed(req, res, next) {
  req.deed.remove(function __deedRemove(err) {
    if (err) { return next(err); }

    res.status(204).send();
  });
});

/* GET /deeds/:deed_id/likes */
router.get('/:deed_id/likes', function __getDeedLikes(req, res, next) {
  Like.find({ 'target.deed': req.deed }, function __likeFindByDeed(err, likes) {
    if (err) { return next(err); }

    res.status(200).json(likes);
  });
});

/* POST /deeds/:deed_id/likes */
router.post('/:deed_id/likes', function __postDeedLike(req, res, next) {
  req.body = _.pick(req.body, Like.getFilter());
  req.body.user = ObjectId.isValid(req.body.user) ? ObjectId(req.body.user) : null;
  req.body.target = { deed: req.deed };

  var like = new Like(req.body);
  like.save(function __likeSave(err) {
    if (err) { return next(err); }

    res.status(201).send();
  });
});

/* DELETE /deeds/:deed_id/likes/:like_id */
router.delete('/:deed_id/likes/:like_id', function __deleteDeedLike(req, res, next) {
  req.like.remove(function __likeRemove(err) {
    if (err) { return next(err); }

    res.status(204).send();
  });
});

/* GET /deeds/:deed_id/comments */
router.get('/:deed_id/comments', function __getDeedComments(req, res, next) {
  Comment.find({ 'target.deed': req.deed }, function __commentFindByDeed(err, comments) {
    if (err) { return next(err); }

    res.status(200).json(comments);
  });
});

/* POST /deeds/:deed_id/comments */
router.post('/:deed_id/comments', function __postDeedComment(req, res, next) {
  req.body = _.pick(req.body, Comment.getFilter());
  req.body.user = ObjectId.isValid(req.body.user) ? ObjectId(req.body.user) : null;
  req.body.target = { deed: req.deed };

  var comment = new Comment(req.body);
  comment.save(function __commentSave(err) {
    if (err) { return next(err); }

    res.status(201).send();
  });
});

/* PUT /deeds/:deed_id/comments/:comment_id */
router.put('/:deed_id/comments/:comment_id', function __putDeedComment(req, res, next) {
  req.body = _.pick(req.body, Comment.getFilter());
  req.body.modified = new Date();

  req.comment.update(req.body, function __commentUpdate(err) {
    if (err) { return next(err); }

    res.status(204).send();
  });
});

/* DELETE /deeds/:deed_id/comments/:comment_id */
router.delete('/:deed_id/comments/:comment_id', function __deleteDeedComment(req, res, next) {
  req.comment.remove(function __commentRemove(err) {
    if (err) { return next(err); }

    res.status(204).send();
  });
});

module.exports = router;
