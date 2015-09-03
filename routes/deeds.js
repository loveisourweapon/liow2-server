var utils = require('../utils/routes'),
    _ = require('lodash'),
    express = require('express'),
    router = express.Router();

var ObjectId = require('mongoose').Types.ObjectId,
    Deed = require('../models/Deed'),
    Like = require('../models/Like'),
    Comment = require('../models/Comment');

router.param('deed', utils.paramHandler.bind(Deed));
router.param('like', utils.paramHandler.bind(Like));
router.param('comment', utils.paramHandler.bind(Comment));

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

  new Deed(req.body).save(function __deedSave(err, deed) {
    if (err) { return next(err); }

    res.status(201).location('/deeds/' + deed._id).json(deed);
  });
});

/* GET /deeds/:deed */
router.get('/:deed', function __getDeed(req, res) {
  res.status(200).json(req.deed);
});

/* PUT /deeds/:deed */
router.put('/:deed', function __putDeed(req, res, next) {
  req.body = _.pick(req.body, Deed.getFilter());
  req.body.modified = new Date();

  Deed.findByIdAndUpdate(req.deed._id, req.body, { new: true }, function __deedFindAndUpdate(err, deed) {
    if (err) { return next(err); }

    res.status(200).json(deed);
  });
});

/* DELETE /deeds/:deed */
router.delete('/:deed', function __deleteDeed(req, res, next) {
  req.deed.remove(function __deedRemove(err) {
    if (err) { return next(err); }

    res.status(204).send();
  });
});

/* GET /deeds/:deed/likes */
router.get('/:deed/likes', function __getDeedLikes(req, res, next) {
  Like.find({ 'target.deed': req.deed._id }, function __likeFindByDeed(err, likes) {
    if (err) { return next(err); }

    res.status(200).json(likes);
  });
});

/* POST /deeds/:deed/likes */
router.post('/:deed/likes', function __postDeedLike(req, res, next) {
  req.body = _.pick(req.body, Like.getFilter());
  req.body.user = ObjectId.isValid(req.body.user) ? ObjectId(req.body.user) : null;
  req.body.target = { deed: req.deed._id };

  new Like(req.body).save(function __likeSave(err, like) {
    if (err) { return next(err); }

    res.status(201).location('/deeds/' + req.deed._id + '/likes/' + like._id).json(like);
  });
});

/* DELETE /deeds/:deed/likes/:like */
router.delete('/:deed/likes/:like', function __deleteDeedLike(req, res, next) {
  req.like.remove(function __likeRemove(err) {
    if (err) { return next(err); }

    res.status(204).send();
  });
});

/* GET /deeds/:deed/comments */
router.get('/:deed/comments', function __getDeedComments(req, res, next) {
  Comment.find({ 'target.deed': req.deed._id }, function __commentFindByDeed(err, comments) {
    if (err) { return next(err); }

    res.status(200).json(comments);
  });
});

/* POST /deeds/:deed/comments */
router.post('/:deed/comments', function __postDeedComment(req, res, next) {
  req.body = _.pick(req.body, Comment.getFilter());
  req.body.user = ObjectId.isValid(req.body.user) ? ObjectId(req.body.user) : null;
  req.body.target = { deed: req.deed._id };

  new Comment(req.body).save(function __commentSave(err, comment) {
    if (err) { return next(err); }

    res.status(201).location('/deeds/' + req.deed._id + '/comments/' + comment._id).json(comment);
  });
});

/* PUT /deeds/:deed/comments/:comment */
router.put('/:deed/comments/:comment', function __putDeedComment(req, res, next) {
  req.body = _.pick(req.body, Comment.getFilter());
  req.body.modified = new Date();

  Comment.findByIdAndUpdate(req.comment._id, req.body, { new: true }, function __commentFindAndUpdate(err, comment) {
    if (err) { return next(err); }

    res.status(200).json(comment);
  });
});

/* DELETE /deeds/:deed/comments/:comment */
router.delete('/:deed/comments/:comment', function __deleteDeedComment(req, res, next) {
  req.comment.remove(function __commentRemove(err) {
    if (err) { return next(err); }

    res.status(204).send();
  });
});

module.exports = router;
