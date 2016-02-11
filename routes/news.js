var _ = require('lodash'),
    routeUtils = require('../utils/route'),
    express = require('express'),
    router = express.Router();

var ObjectId = require('mongoose').Types.ObjectId,
    News = require('../models/News'),
    Like = require('../models/Like'),
    Comment = require('../models/Comment');

router.param('news', _.partialRight(routeUtils.paramHandler, News));
router.param('like', _.partialRight(routeUtils.paramHandler, Like));
router.param('comment', _.partialRight(routeUtils.paramHandler, Comment));

/**
 * GET /news
 */
router.get('/', _.partialRight(routeUtils.getAll, News));

/**
 * POST /news
 */
router.post('/', (req, res, next) => {
  req.body = _.pick(req.body, News.getFilter());
  req.body.author = ObjectId.isValid(req.body.author) ? ObjectId(req.body.author) : null;

  new News(req.body).save()
    .then(news => res.status(201).location(`/news/${news._id}`).json(news))
    .catch(err => next(err));
});

/**
 * GET /news/:news
 */
router.get('/:news', _.partialRight(routeUtils.getByParam, 'news'));

/**
 * PUT /news/:news
 */
router.put('/:news', _.partialRight(routeUtils.putByParam, News, 'news'));

/**
 * DELETE /news/:news
 */
router.delete('/:news', _.partialRight(routeUtils.deleteByParam, 'news'));

/**
 * GET /news/:news/likes
 */
router.get('/:news/likes', _.partialRight(routeUtils.getByTarget, Like, 'news'));

/**
 * POST /news/:news/likes
 */
router.post('/:news/likes', (req, res, next) => {
  req.body = _.pick(req.body, Like.getFilter());
  req.body.user = ObjectId.isValid(req.body.user) ? ObjectId(req.body.user) : null;
  req.body.target = { news: req.news._id };

  new Like(req.body).save()
    .then(like => res.status(201).location(`/news/${req.news._id}/likes/${like._id}`).json(like))
    .catch(err => next(err));
});

/**
 * DELETE /news/:news/likes/:like
 */
router.delete('/:news/likes/:like', _.partialRight(routeUtils.deleteByParam, 'like'));

/**
 * GET /news/:news/comments
 */
router.get('/:news/comments', _.partialRight(routeUtils.getByTarget, Comment, 'news'));

/**
 * POST /news/:news/comments
 */
router.post('/:news/comments', (req, res, next) => {
  req.body = _.pick(req.body, Comment.getFilter());
  req.body.user = ObjectId.isValid(req.body.user) ? ObjectId(req.body.user) : null;
  req.body.target = { news: req.news._id };

  new Comment(req.body).save()
    .then(comment => res.status(201).location(`/news/${req.news._id}/comments/${comment._id}`).json(comment))
    .catch(err => next(err));
});

/**
 * PUT /news/:news/comments/:comment
 */
router.put('/:news/comments/:comment', _.partialRight(routeUtils.putByParam, Comment, 'comment'));

/**
 * DELETE /news/:news/comments/:comment
 */
router.delete('/:news/comments/:comment', _.partialRight(routeUtils.deleteByParam, 'comment'));

module.exports = router;
