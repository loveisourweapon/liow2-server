var _ = require('lodash'),
    express = require('express'),
    router = express.Router();

var ObjectId = require('mongoose').Types.ObjectId,
    Act = require('../models/Act'),
    Like = require('../models/Like'),
    Comment = require('../models/Comment');

router.param('act_id', function __paramActId(req, res, next, id) {
  if (!ObjectId.isValid(id)) { return next(new Error('Invalid act_id')); }

  Act.findById(id, function __actFindById(err, act) {
    if (err) { return next(err); }
    if (!act) { return next(new Error('Act ' + id + ' not found')); }

    req.act = act;
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

/* GET /acts */
router.get('/', function __getActs(req, res, next) {
  Act.find(function __actFind(err, acts) {
    if (err) { return next(err); }

    res.status(200).json(acts);
  });
});

/* POST /acts */
router.post('/', function __postAct(req, res, next) {
  req.body = _.pick(req.body, Act.getFilter());
  req.body.user = ObjectId.isValid(req.body.user) ? ObjectId(req.body.user) : null;
  req.body.group = ObjectId.isValid(req.body.group) ? ObjectId(req.body.group) : null;
  req.body.deed = ObjectId.isValid(req.body.deed) ? ObjectId(req.body.deed) : null;

  var act = new Act(req.body);
  act.save(function __actSave(err) {
    if (err) { return next(err); }

    res.status(201).send();
  });
});

/* DELETE /acts/:act_id */
router.delete('/:act_id', function __deleteAct(req, res, next) {
  req.act.remove(function __actRemove(err) {
    if (err) { return next(err); }

    res.status(204).send();
  });
});

/* GET /acts/:act_id/likes */
router.get('/:act_id/likes', function __getActLikes(req, res, next) {
  Like.find({ 'target.act': req.act }, function __likeFindByAct(err, likes) {
    if (err){ return next(err); }

    res.status(200).json(likes);
  });
});

/* POST /acts/:act_id/likes */
router.post('/:act_id/likes', function __postActLike(req, res, next) {
  req.body = _.pick(req.body, Like.getFilter());
  req.body.user = ObjectId.isValid(req.body.user) ? ObjectId(req.body.user) : null;
  req.body.target = { act: req.act };

  var like = new Like(req.body);
  like.save(function __likeSave(err) {
    if (err) { return next(err); }

    res.status(201).send();
  });
});

/* DELETE /acts:act_id/likes/:like_id */
router.delete(':act_id/likes/:like_id', function __deleteActLike(req, res, next) {
  req.like.remove(function __likeRemove(err) {
    if (err) { return next(err); }

    res.status(204).send();
  });
});

/* GET /acts/:act_id/comments */
router.get('/:act_id/comments', function __getActComments(req, res, next) {
  Comment.find({ 'target.act': req.act }, function __commentFindByAct(err, comments) {
    if (err) { return next(err); }

    res.status(200).json(comments);
  });
});

/* POST /acts/:act_id/comments */
router.post('/:act_id/comments', function __postActComment(req, res, next) {
  req.body = _.pick(req.body, Comment.getFilter());
  req.body.user = ObjectId.isValid(req.body.user) ? ObjectId(req.body.user) : null;
  req.body.target = { act: req.act };

  var comment = new Comment(req.body);
  comment.save(function __commentSave(err) {
    if (err) { return next(err); }

    res.status(201).send();
  });
});

/* PUT /acts/:act_id/comments/:comment_id */
router.put('/:act_id/comments/:comment_id', function __putActComment(req, res, next) {
  req.body = _.pick(req.body, Comment.getFilter());
  req.body.modified = new Date();

  req.comment.update(req.body, function __commentUpdate(err) {
    if (err) { return next(err); }

    res.status(204).send();
  });
});

/* DELETE /acts/:act_id/comments/:comment_id */
router.delete('/:act_id/comments/:comment_id', function __deleteActComment(req, res, next) {
  req.comment.remove(function __commentRemove(err) {
    if (err) { return next(err); }

    res.status(204).send();
  });
});

module.exports = router;
