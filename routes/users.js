var get = require('lodash/get');
var partialRight = require('lodash/partialRight');
var jsonpatch = require('fast-json-patch');
var utils = require('../utils/general');
var HttpError = utils.HttpError;
var mailUtils = require('../utils/mail');
var routeUtils = require('../utils/route');
var router = require('express').Router();

var Act = require('../models/Act');
var Comment = require('../models/Comment');
var Group = require('../models/Group');
var User = require('../models/User');

router.param('user', partialRight(routeUtils.paramHandler, User));

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
router.get('/', partialRight(routeUtils.getAll, User));

/**
 * @api {post} /users Create user
 * @apiVersion 1.7.0
 * @apiName PostUsers
 * @apiGroup Users
 * @apiPermission none
 *
 * @apiUse UserRequestBody
 * @apiUse CreateUserResponse
 */
router.post('/', (req, res, next) => {
  req.body = routeUtils.filterProperties(req.body, User);

  // Copy currentGroup from groups property
  if (req.body.groups && req.body.groups.length) {
    req.body.currentGroup = req.body.groups[0];
  }

  new User(req.body)
    .save()
    .then((user) => {
      mailUtils.sendConfirmEmail(user);

      res.status(201).location(`/users/${user._id}`).json(user);
    })
    .catch((err) => next(err));
});

/**
 * @api {get} /users/me Get current user
 * @apiVersion 1.6.0
 * @apiName GetUsersMe
 * @apiGroup Users
 * @apiPermission user
 *
 * @apiUse UserResponse
 */
router.get('/me', routeUtils.ensureAuthenticated, (req, res, next) => {
  req.authUser
    .populate('groups', 'name urlName admins approved')
    .execPopulate()
    .then((user) => res.status(200).send(user.toJSON(true)))
    .catch((err) => next(err));
});

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
router.get('/:user', partialRight(routeUtils.getByParam, 'user'));

/**
 * @api {put} /users/:user Update user
 * @apiVersion 1.7.0
 * @apiName PutUser
 * @apiGroup Users
 * @apiPermission owner
 *
 * @apiParam {string} user User ObjectId
 *
 * @apiUse UserRequestBody
 * @apiUse UserResponse
 */
router.put(
  '/:user',
  routeUtils.ensureAuthenticated,
  partialRight(routeUtils.ensureSameUser, 'user._id'),
  partialRight(routeUtils.putByParam, User, 'user')
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
  (req, res, next) => {
    // Can't use ensureSameUser because group admins can remove a user from their group
    // Grant permission to super admins and self
    if (req.authUser.superAdmin || get(req, 'user._id').equals(req.authUser._id)) {
      return next();
    }
    if (req.body.some((patch) => patch.op === 'remove' && ~patch.path.indexOf('/groups'))) {
      // Lookup group and grant permission if the auth user is a group admin
      var patch = req.body.find((patch) => patch.op === 'remove' && ~patch.path.indexOf('/groups'));
      var groupIndex = Number(patch.path.replace('/groups/', ''));
      var groupId = req.user.groups[groupIndex];
      Group.findById(groupId)
        .exec()
        .then((group) => {
          if (group.admins.some((admin) => admin.equals(req.authUser._id))) {
            return next();
          } else {
            return next(new HttpError('Must be logged in as this user or an admin', 403));
          }
        });
    } else {
      return next(new HttpError('Must be logged in as this user or an admin', 403));
    }
  },
  (req, res, next) => {
    jsonpatch.apply(req.user, routeUtils.filterJsonPatch(req.body, User));

    req.user
      .save()
      .then((user) => res.status(200).json(user))
      .catch((err) => next(err));
  }
);

router.delete(
  '/:user',
  routeUtils.ensureAuthenticated,
  partialRight(routeUtils.ensureSameUser, 'user._id'),
  (req, res, next) => {
    const userId = req.user._id;
    // TODO: can this be done with a post remove hook?
    Comment.remove({ user: userId })
      .exec()
      // TODO: can this be done with a post remove hook?
      .then(() => Act.remove({ user: userId }).exec())
      // TODO: can this be done more nicely?
      .then(() => Group.find({ admins: userId }).exec())
      .then((adminOfGroups) =>
        Promise.all(
          adminOfGroups.map((group) => {
            group.admins = group.admins.filter((groupAdminId) => !groupAdminId.equals(userId));
            return group.save();
          })
        )
      )
      .then(() => req.user.remove())
      .then(() => res.status(204).send())
      .catch((err) => next(err));
  }
);

module.exports = router;
