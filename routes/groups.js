var _ = require('lodash'),
    router = require('express').Router(),
    routeUtils = require('../utils/route'),
    Group = require('../models/Group');

router.param('group', _.partialRight(routeUtils.paramHandler, Group));

/**
 * @api {get} /groups List groups
 * @apiName GetGroups
 * @apiGroup Groups
 *
 * @apiUse GetGroupsSuccess
 */
router.get('/', _.partialRight(routeUtils.getAll, Group, 'country'));

/**
 * @api {post} /groups Create group
 * @apiName PostGroups
 * @apiGroup Groups
 *
 * @apiUse CreateGroupSuccess
 */
router.post('/', routeUtils.ensureAuthenticated, (req, res, next) => {
  req.body = _.pick(req.body, Group.getFilter());
  req.body.owner = req.user._id;
  req.body.admins = [req.user._id];
  req.body.country = req.user.country;

  new Group(req.body)
    .save()
    .then(group => res.status(201).location(`/groups/${group._id}`).json(group))
    .catch(err => next(err));
});

/**
 * @api {get} /groups/:group Get group
 * @apiName GetGroup
 * @apiGroup Groups
 *
 * @apiUse GetGroupSuccess
 */
router.get('/:group', _.partialRight(routeUtils.getByParam, 'group', 'country'));

/**
 * @api {put} /groups/:group Update group
 * @apiName PutGroup
 * @apiGroup Groups
 *
 * @apiUse GetGroupSuccess
 */
router.put('/:group', _.partialRight(routeUtils.putByParam, Group, 'group'));

/**
 * @api {delete} /groups/:group Remove group
 * @apiName DeleteGroup
 * @apiGroup Groups
 *
 * @apiUse NoContentSuccess
 */
router.delete('/:group', _.partialRight(routeUtils.deleteByParam, 'group'));

module.exports = router;
