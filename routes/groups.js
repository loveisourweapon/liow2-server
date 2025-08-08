var partialRight = require('lodash/partialRight');
var jsonpatch = require('fast-json-patch');
var router = require('express').Router();
var routeUtils = require('../utils/route');
var mailUtils = require('../utils/mail');

var Act = require('../models/Act');
var Comment = require('../models/Comment');
var Group = require('../models/Group');
var Token = require('../models/Token');
var User = require('../models/User');

router.param('group', partialRight(routeUtils.paramHandler, Group));

/**
 * @api {get} /groups List groups
 * @apiVersion 1.25.0
 * @apiName GetGroups
 * @apiGroup Groups
 * @apiPermission none
 *
 * @apiUse GroupsResponse
 */
router.get('/', partialRight(routeUtils.getAll, Group));

/**
 * @api {post} /groups Create group
 * @apiVersion 1.25.0
 * @apiName PostGroups
 * @apiGroup Groups
 * @apiPermission user
 *
 * @apiUse GroupRequestBody
 * @apiUse CreateGroupResponse
 */
router.post('/', routeUtils.ensureAuthenticated, (req, res, next) => {
  req.body = routeUtils.filterProperties(req.body, Group);
  req.body.owner = req.authUser._id;
  req.body.admins = [req.authUser._id];
  req.body.country = req.authUser.country;

  new Group(req.body)
    .save()
    .then((group) => {
      mailUtils.sendGroupSignup(group, req.authUser);
      req.authUser.groups.push(group._id);
      return req.authUser
        .save()
        .then(() => res.status(201).location(`/groups/${group._id}`).json(group));
    })
    .catch((err) => next(err));
});

/**
 * @api {get} /groups/:group Get group
 * @apiVersion 1.25.0
 * @apiName GetGroup
 * @apiGroup Groups
 * @apiPermission none
 *
 * @apiParam {string} group Group ObjectId
 *
 * @apiUse GroupResponse
 */
router.get('/:group', partialRight(routeUtils.getByParam, 'group', 'country'));

/**
 * @api {put} /groups/:group Update group
 * @apiVersion 1.25.0
 * @apiName PutGroup
 * @apiGroup Groups
 * @apiPermission admin
 *
 * @apiParam {string} group Group ObjectId
 *
 * @apiUse GroupRequestBody
 * @apiUse GroupResponse
 */
router.put(
  '/:group',
  routeUtils.ensureAuthenticated,
  partialRight(routeUtils.ensureAdminOf, 'group._id'),
  partialRight(routeUtils.putByParam, Group, 'group')
);

/**
 * PATCH /groups/:group
 */
/**
 * @api {patch} /groups/:group Partial update group
 * @apiVersion 1.26.0
 * @apiName PatchGroup
 * @apiGroup Groups
 * @apiPermission admin
 *
 * @apiParam {string} group Group ObjectId
 *
 * @apiParam (Body) {object[]} patches         JSON Patch patches
 * @apiParam (Body) {string}   patches.op      Operation
 * @apiParam (Body) {string}   patches.path    JSON Pointer path
 * @apiParam (Body) {mixed}    [patches.value] New path value
 *
 * @apiParamExample {json} Request
 *   [{
 *     "op": "replace",
 *     "path": "/archived",
 *     "value": true
 *   }]
 *
 * @apiUse NoContentResponse
 */
router.patch(
  '/:group',
  routeUtils.ensureAuthenticated,
  partialRight(routeUtils.ensureAdminOf, 'group'),
  (req, res, next) => {
    jsonpatch.apply(req.group, routeUtils.filterJsonPatch(req.body, Group));
    req.group.modified = new Date();

    req.group
      .save({ validateBeforeSave: false }) // TODO: ideally remove this, currently needed to allow patching archived status
      .then(() => res.status(204).send())
      .catch((err) => next(err));
  }
);

/**
 * @api {delete} /groups/:group Remove group
 * @apiVersion 1.3.0
 * @apiName DeleteGroup
 * @apiGroup Groups
 * @apiPermission admin
 *
 * @apiParam {string} group Group ObjectId
 *
 * @apiUse NoContentResponse
 */
router.delete(
  '/:group',
  routeUtils.ensureAuthenticated,
  partialRight(routeUtils.ensureSameUser, 'group.owner'),
  (req, res, next) => {
    const groupId = req.group._id;

    // TODO: can this be done with a post remove hook?
    Comment.remove({ group: groupId })
      .exec()
      // TODO: can this be done with a post remove hook?
      .then(() => Act.remove({ group: groupId }).exec())
      // TODO: can this be done more nicely?
      .then(() => User.find({ groups: groupId }).exec())
      .then((usersInGroup) =>
        Promise.all(
          usersInGroup.map((user) => {
            user.groups = user.groups.filter((userGroupId) => !userGroupId.equals(groupId));
            // Also clear currentGroup if it's the deleted group
            if (user.currentGroup && user.currentGroup.equals(groupId)) {
              user.currentGroup = undefined;
            }
            return user.save();
          })
        )
      )
      .then(() => req.group.remove())
      .then(() => res.status(204).send())
      .catch((err) => next(err));
  }
);

/**
 * @api {post} /groups/:group/approve Handle approve group
 * @apiVersion 1.22.0
 * @apiName ApproveGroup
 * @apiGroup Auth
 * @apiPermission superAdmin
 *
 * @apiUse NoContentResponse
 */
router.post(
  '/:group/approve',
  routeUtils.ensureAuthenticated,
  routeUtils.ensureSuperAdmin,
  (req, res, next) => {
    Group.findByIdAndUpdate(req.group, { approved: true })
      .exec()
      .then(() => res.status(204).send())
      .catch((err) => next(err));
  }
);

/**
 * @api {post} /groups/approve Handle approve group with token
 * @apiVersion 1.22.0
 * @apiName ApproveGroupWithToken
 * @apiGroup Auth
 * @apiPermission superAdmin
 *
 * @apiParam (Body) {string} token Group approval token
 *
 * @apiUse NoContentResponse
 */
router.post(
  '/approve',
  routeUtils.ensureAuthenticated,
  routeUtils.ensureSuperAdmin,
  (req, res, next) => {
    Token.findOne({ token: req.body.token, type: 'approve' })
      .exec()
      .then((token) => {
        return Group.findByIdAndUpdate(token.group, { approved: true })
          .exec()
          .then(() => token.remove())
          .then(() => res.status(204).send());
      })
      .catch((err) => next(err));
  }
);

module.exports = router;
