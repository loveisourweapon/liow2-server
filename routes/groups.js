var partialRight = require('lodash/partialRight'),
    routeUtils = require('../utils/route'),
    router = require('express').Router(),
    Group = require('../models/Group');

router.param('group', partialRight(routeUtils.paramHandler, Group));

/**
 * @api {get} /groups List groups
 * @apiVersion 1.0.0
 * @apiName GetGroups
 * @apiGroup Groups
 * @apiPermission none
 *
 * @apiUse GroupsResponse
 */
router.get(
  '/',
  partialRight(routeUtils.getAll, Group, 'country')
);

/**
 * @api {post} /groups Create group
 * @apiVersion 1.3.0
 * @apiName PostGroups
 * @apiGroup Groups
 * @apiPermission user
 *
 * @apiUse GroupRequestBody
 * @apiUse CreateGroupResponse
 */
router.post(
  '/',
  routeUtils.ensureAuthenticated,
  (req, res, next) => {
    req.body = routeUtils.filterProperties(req.body, Group);
    req.body.owner = req.authUser._id;
    req.body.admins = [req.authUser._id];
    req.body.country = req.authUser.country;

    new Group(req.body).save()
      .then(group => {
        req.authUser.groups.push(group._id);
        return req.authUser.save()
          .then(() => res.status(201).location(`/groups/${group._id}`).json(group));
      })
      .catch(err => next(err));
  }
);

/**
 * @api {get} /groups/:group Get group
 * @apiVersion 1.0.0
 * @apiName GetGroup
 * @apiGroup Groups
 * @apiPermission none
 *
 * @apiParam {string} group Group ObjectId
 *
 * @apiUse GroupResponse
 */
router.get(
  '/:group',
  partialRight(routeUtils.getByParam, 'group', 'country')
);

/**
 * @api {put} /groups/:group Update group
 * @apiVersion 1.3.0
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
  partialRight(routeUtils.deleteByParam, 'group')
);

module.exports = router;
