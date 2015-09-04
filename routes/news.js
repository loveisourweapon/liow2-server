var _ = require('lodash'),
    express = require('express'),
    router = express.Router(),
    paramHandler = require('../utils/routes').paramHandler;

var ObjectId = require('mongoose').Types.ObjectId,
    News = require('../models/News'),
    Like = require('../models/Like'),
    Comment = require('../models/Comment');

router.param('news', paramHandler.bind(News));
router.param('like', paramHandler.bind(Like));
router.param('comment', paramHandler.bind(Comment));

/* GET /news */
router.get('/', function __getNews(req, res, next) {
  News.find(function __newsFind(err, news) {
    if (err) { return next(err); }

    res.status(200).json(news);
  });
});

/* POST /news */
router.post('/', function __postNews(req, res, next) {
  req.body = _.pick(req.body, News.getFilter());
  req.body.author = ObjectId.isValid(req.body.author) ? ObjectId(req.body.author) : null;

  new News(req.body).save(function __newsSave(err, news) {
    if (err) { return next(err); }

    res.status(201).location('/news/' + news._id).json(news);
  });
});

/* GET /news/:news */
router.get('/:news', function __getNews(req, res) {
  res.status(200).json(req.news);
});

/* PUT /news/:news */
router.put('/:news', function __putNews(req, res, next) {
  req.body = _.pick(req.body, News.getFilter());
  req.body.modified = new Date();

  News.findByIdAndUpdate(req.news._id, req.body, { new: true }, function __newsFindAndUpdate(err, news) {
    if (err) { return next(err); }

    res.status(200).json(news);
  });
});

/* DELETE /news/:news */
router.delete('/:news', function __deleteNews(req, res, next) {
  req.news.remove(function __newsRemove(err) {
    if (err) { return next(err); }

    res.status(204).send();
  });
});

/* GET /news/:news/likes */
router.get('/:news/likes', function __getNewsLikes(req, res, next) {
  Like.find({ 'target.news': req.news._id }, function __likeFindByNews(err, likes) {
    if (err) { return next(err); }

    res.status(200).json(likes);
  });
});

/* POST /news/:news/likes */
router.post('/:news/likes', function __postNewsLike(req, res, next) {
  req.body = _.pick(req.body, Like.getFilter());
  req.body.user = ObjectId.isValid(req.body.user) ? ObjectId(req.body.user) : null;
  req.body.target = { news: req.news._id };

  new Like(req.body).save(function __likeSave(err, news) {
    if (err) { return next(err); }

    res.status(201).location('/news/' + req.news._id + '/likes/' + news._id).json(news);
  });
});

/* DELETE /news/:news/likes/:like */
router.delete('/:news/likes/:like', function __deleteNewsLike(req, res, next) {
  req.like.remove(function __likeRemove(err) {
    if (err) { return next(err); }

    res.status(204).send();
  });
});

/* GET /news/:news/comments */
router.get('/:news/comments', function __getNewsComments(req, res, next) {
  Comment.find({ 'target.news': req.news._id }, function __commentFindByNews(err, comments) {
    if (err) { return next(err); }

    res.status(200).json(comments);
  });
});

/* POST /news/:news/comments */
router.post('/:news/comments', function __postNewsComment(req, res, next) {
  req.body = _.pick(req.body, Comment.getFilter());
  req.body.user = ObjectId.isValid(req.body.user) ? ObjectId(req.body.user) : null;
  req.body.target = { news: req.news._id };

  new Comment(req.body).save(function __commentSave(err, comment) {
    if (err) { return next(err); }

    res.status(201).location('/news/' + req.news._id + '/comments/' + comment._id).json(comment);
  });
});

/* PUT /news/:news/comments/:comment */
router.put('/:news/comments/:comment', function __putNewsComment(req, res, next) {
  req.body = _.pick(req.body, Comment.getFilter());
  req.body.modified = new Date();

  Comment.findByIdAndUpdate(req.comment._id, req.body, { new: true }, function __commentFindAndUpdate(err, comment) {
    if (err) { return next(err); }

    res.status(200).json(comment);
  });
});

/* DELETE /news/:news/comments/:comment */
router.delete('/:news/comments/:comment', function __deleteNewsComment(req, res, next) {
  req.comment.remove(function __commentRemove(err) {
    if (err) { return next(err); }

    res.status(204).send();
  });
});

module.exports = router;
