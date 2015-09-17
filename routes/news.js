var _ = require('lodash'),
    express = require('express'),
    router = express.Router(),
    route = require('../utils/route');

var ObjectId = require('mongoose').Types.ObjectId,
    News = require('../models/News'),
    Like = require('../models/Like'),
    Comment = require('../models/Comment');

router.param('news', _.partialRight(route.paramHandler, News));
router.param('like', _.partialRight(route.paramHandler, Like));
router.param('comment', _.partialRight(route.paramHandler, Comment));

/**
 * GET /news
 */
router.get('/', _.partialRight(route.getAll, News));

/**
 * POST /news
 */
router.post('/', (req, res, next) => {
  req.body = _.pick(req.body, News.getFilter());
  req.body.author = ObjectId.isValid(req.body.author) ? ObjectId(req.body.author) : null;

  new News(req.body).save((err, news) => {
    if (err) { return next(err); }

    res.status(201).location(`/news/${news._id}`).json(news);
  });
});

/**
 * GET /news/:news
 */
router.get('/:news', _.partialRight(route.getByParam, 'news'));

/**
 * PUT /news/:news
 */
router.put('/:news', _.partialRight(route.putByParam, News, 'news'));

/**
 * DELETE /news/:news
 */
router.delete('/:news', _.partialRight(route.deleteByParam, 'news'));

/**
 * GET /news/:news/likes
 */
router.get('/:news/likes', _.partialRight(route.getByTarget, Like, 'news'));

/**
 * POST /news/:news/likes
 */
router.post('/:news/likes', (req, res, next) => {
  req.body = _.pick(req.body, Like.getFilter());
  req.body.user = ObjectId.isValid(req.body.user) ? ObjectId(req.body.user) : null;
  req.body.target = { news: req.news._id };

  new Like(req.body).save((err, news) => {
    if (err) { return next(err); }

    res.status(201).location(`/news/${req.news._id}/likes/${news._id}`).json(news);
  });
});

/**
 * DELETE /news/:news/likes/:like
 */
router.delete('/:news/likes/:like', _.partialRight(route.deleteByParam, 'like'));

/**
 * GET /news/:news/comments
 */
router.get('/:news/comments', _.partialRight(route.getByTarget, Comment, 'news'));

/**
 * POST /news/:news/comments
 */
router.post('/:news/comments', (req, res, next) => {
  req.body = _.pick(req.body, Comment.getFilter());
  req.body.user = ObjectId.isValid(req.body.user) ? ObjectId(req.body.user) : null;
  req.body.target = { news: req.news._id };

  new Comment(req.body).save((err, comment) => {
    if (err) { return next(err); }

    res.status(201).location(`/news/${req.news._id}/comments/${comment._id}`).json(comment);
  });
});

/**
 * PUT /news/:news/comments/:comment
 */
router.put('/:news/comments/:comment', _.partialRight(route.putByParam, Comment, 'comment'));

/**
 * DELETE /news/:news/comments/:comment
 */
router.delete('/:news/comments/:comment', _.partialRight(route.deleteByParam, 'comment'));

module.exports = router;
