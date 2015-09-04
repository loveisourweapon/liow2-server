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

  new Act(req.body).save(function __actSave(err, act) {
    if (err) { return next(err); }

    res.status(201).location('/acts/' + act._id).json(act);
  });
});

/* GET /acts/:act */
router.get('/:act', function __getAct(req, res) {
  res.status(200).json(req.act);
});

/* DELETE /acts/:act */
router.delete('/:act', function __deleteAct(req, res, next) {
  req.act.remove(function __actRemove(err) {
    if (err) { return next(err); }

    res.status(204).send();
  });
});

/* GET /acts/:act/likes */
router.get('/:act/likes', function __getActLikes(req, res, next) {
  Like.find({ 'target.act': req.act._id }, function __likeFindByAct(err, likes) {
    if (err) { return next(err); }

    res.status(200).json(likes);
  });
});

/* POST /acts/:act/likes */
router.post('/:act/likes', function __postActLike(req, res, next) {
  req.body = _.pick(req.body, Like.getFilter());
  req.body.user = ObjectId.isValid(req.body.user) ? ObjectId(req.body.user) : null;
  req.body.target = { act: req.act._id };

  new Like(req.body).save(function __likeSave(err, like) {
    if (err) { return next(err); }

    res.status(201).location('/acts/' + req.act._id + '/likes/' + like._id).json(like);
  });
});

/* DELETE /acts:act/likes/:like */
router.delete('/:act/likes/:like', function __deleteActLike(req, res, next) {
  req.like.remove(function __likeRemove(err) {
    if (err) { return next(err); }

    res.status(204).send();
  });
});

/* GET /acts/:act/comments */
router.get('/:act/comments', function __getActComments(req, res, next) {
  Comment.find({ 'target.act': req.act._id }, function __commentFindByAct(err, comments) {
    if (err) { return next(err); }

    res.status(200).json(comments);
  });
});

/* POST /acts/:act/comments */
router.post('/:act/comments', function __postActComment(req, res, next) {
  req.body = _.pick(req.body, Comment.getFilter());
  req.body.user = ObjectId.isValid(req.body.user) ? ObjectId(req.body.user) : null;
  req.body.target = { act: req.act._id };

  new Comment(req.body).save(function __commentSave(err, comment) {
    if (err) { return next(err); }

    res.status(201).location('/acts/' + req.act._id + '/comments/' + comment._id).json(comment);
  });
});

/* PUT /acts/:act/comments/:comment */
router.put('/:act/comments/:comment', function __putActComment(req, res, next) {
  req.body = _.pick(req.body, Comment.getFilter());
  req.body.modified = new Date();

  Comment.findByIdAndUpdate(req.comment._id, req.body, { new: true }, function __commentFindAndUpdate(err, comment) {
    if (err) { return next(err); }

    res.status(200).json(comment);
  });
});

/* DELETE /acts/:act/comments/:comment */
router.delete('/:act/comments/:comment', function __deleteActComment(req, res, next) {
  req.comment.remove(function __commentRemove(err) {
    if (err) { return next(err); }

    res.status(204).send();
  });
});

module.exports = router;
