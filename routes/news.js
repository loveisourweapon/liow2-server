var _ = require('lodash'),
    express = require('express'),
    router = express.Router();

var ObjectId = require('mongoose').Types.ObjectId,
    News = require('../models/News'),
    Like = require('../models/Like'),
    Comment = require('../models/Comment');

router.param('news_id', function __paramNewsId(req, res, next, id) {
  if (!ObjectId.isValid(id)) { return next(new Error('Invalid news_id')); }

  News.findById(id, function __newsFindById(err, news) {
    if (err) { return next(err); }
    if (!news) { return next(new Error('News ' + id + ' not found')); }

    req.news = news;
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

/* GET /news/:news_id */
router.get('/:news_id', function __getNews(req, res) {
  res.status(200).json(req.news);
});

/* PUT /news/:news_id */
router.put('/:news_id', function __putNews(req, res, next) {
  req.body = _.pick(req.body, News.getFilter());
  req.body.modified = new Date();

  News.findByIdAndUpdate(req.news._id, req.body, { new: true }, function __newsFindAndUpdate(err, news) {
    if (err) { return next(err); }

    res.status(200).json(news);
  });
});

/* DELETE /news/:news_id */
router.delete('/:news_id', function __deleteNews(req, res, next) {
  req.news.remove(function __newsRemove(err) {
    if (err) { return next(err); }

    res.status(204).send();
  });
});

/* GET /news/:news_id/likes */
router.get('/:news_id/likes', function __getNewsLikes(req, res, next) {
  Like.find({ 'target.news': req.news._id }, function __likeFindByNews(err, likes) {
    if (err) { return next(err); }

    res.status(200).json(likes);
  });
});

/* POST /news/:news_id/likes */
router.post('/:news_id/likes', function __postNewsLike(req, res, next) {
  req.body = _.pick(req.body, Like.getFilter());
  req.body.user = ObjectId.isValid(req.body.user) ? ObjectId(req.body.user) : null;
  req.body.target = { news: req.news._id };

  new Like(req.body).save(function __likeSave(err, news) {
    if (err) { return next(err); }

    res.status(201).location('/news/' + req.news._id + '/likes/' + news._id).json(news);
  });
});

/* DELETE /news/:news_id/likes/:like_id */
router.delete('/:news_id/likes/:like_id', function __deleteNewsLike(req, res, next) {
  req.like.remove(function __likeRemove(err) {
    if (err) { return next(err); }

    res.status(204).send();
  });
});

/* GET /news/:news_id/comments */
router.get('/:news_id/comments', function __getNewsComments(req, res, next) {
  Comment.find({ 'target.news': req.news._id }, function __commentFindByNews(err, comments) {
    if (err) { return next(err); }

    res.status(200).json(comments);
  });
});

/* POST /news/:news_id/comments */
router.post('/:news_id/comments', function __postNewsComment(req, res, next) {
  req.body = _.pick(req.body, Comment.getFilter());
  req.body.user = ObjectId.isValid(req.body.user) ? ObjectId(req.body.user) : null;
  req.body.target = { news: req.news._id };

  new Comment(req.body).save(function __commentSave(err, comment) {
    if (err) { return next(err); }

    res.status(201).location('/news/' + req.news._id + '/comments/' + comment._id).json(comment);
  });
});

/* PUT /news/:news_id/comments/:comment_id */
router.put('/:news_id/comments/:comment_id', function __putNewsComment(req, res, next) {
  req.body = _.pick(req.body, Comment.getFilter());
  req.body.modified = new Date();

  Comment.findByIdAndUpdate(req.comment._id, req.body, { new: true }, function __commentFindAndUpdate(err, comment) {
    if (err) { return next(err); }

    res.status(200).json(comment);
  });
});

/* DELETE /news/:news_id/comments/:comment_id */
router.delete('/:news_id/comments/:comment_id', function __deleteNewsComment(req, res, next) {
  req.comment.remove(function __commentRemove(err) {
    if (err) { return next(err); }

    res.status(204).send();
  });
});

module.exports = router;
