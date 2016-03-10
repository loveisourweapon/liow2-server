var _ = require('lodash'),
    jsonpatch = require('fast-json-patch'),
    routeUtils = require('../utils/route'),
    router = require('express').Router(),
    User = require('../models/User');

router.param('user', _.partialRight(routeUtils.paramHandler, User));

/**
 * @api {get} /users Count users
 * @apiVersion 1.1.0
 * @apiName CountUsers
 * @apiGroup Users
 * @apiPermission none
 *
 * @apiSuccessExample {text} Response
 *   HTTP/1.1 200 OK
 *   "2796"
 */
router.get(
  '/',
  (req, res, next) => {
    // TODO: sanitize public API data
    // For now, only allow counting users
    req.query.count = 'true';
    next();
  },
  _.partialRight(routeUtils.getAll, User)
);

/**
 * @api {get} /users/me Get current user
 * @apiVersion 1.6.0
 * @apiName GetUsersMe
 * @apiGroup Users
 * @apiPermission user
 *
 * @apiUse UserResponse
 */
router.get(
  '/me',
  routeUtils.ensureAuthenticated,
  (req, res, next) => {
    req.authUser
      .populate('groups', 'name urlName admins')
      .execPopulate()
      .then(user => res.status(200).json(user))
      .catch(err => next(err));
  }
);

/**
 * @api {get} /users/:user Get user
 * @apiVersion 1.6.0
 * @apiName GetUser
 * @apiGroup Users
 * @apiPermission none
 *
 * @apiParam {string} user User ObjectId
 *
 * @apiUse UserResponse
 */
router.get(
  '/:user',
  _.partialRight(routeUtils.getByParam, 'user')
);

/**
 * @api {patch} /users/:user Partial update user
 * @apiVersion 1.6.0
 * @apiName PatchUser
 * @apiGroup Users
 * @apiPermission owner
 *
 * @apiParam {string} user User ObjectId
 *
 * @apiParam (Body) {object[]} patches         JSON Patch patches
 * @apiParam (Body) {string}   patches.op      Operation
 * @apiParam (Body) {string}   patches.path    JSON Pointer path
 * @apiParam (Body) {mixed}    [patches.value] New path value
 *
 * @apiParamExample {json} Request
 *   [{
 *     "op": "add",
 *     "path": "/groups/-",
 *     "value": "55f6c56186b959ac12490e1d"
 *   }]
 *
 * @apiUse UserResponse
 */
router.patch(
  '/:user',
  routeUtils.ensureAuthenticated,
  _.partialRight(routeUtils.ensureSameUser, 'user._id'),
  (req, res, next) => {
    jsonpatch.apply(req.user, routeUtils.filterJsonPatch(req.body, User));

    req.user.save()
      .then(user => res.status(200).json(user))
      .catch(err => next(err));
  }
);

module.exports = router;
