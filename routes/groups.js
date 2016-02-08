var _ = require('lodash'),
    express = require('express'),
    router = express.Router(),
    route = require('../utils/route');

var ObjectId = require('mongoose').Types.ObjectId,
    Group = require('../models/Group');

router.param('group', _.partialRight(route.paramHandler, Group));

/**
 * @api {get} /groups List groups
 * @apiName GetGroups
 * @apiGroup Groups
 *
 * @apiUse GetGroupsSuccess
 */
router.get('/', _.partialRight(route.getAll, Group, 'country'));

/**
 * @api {post} /groups Create group
 * @apiName PostGroups
 * @apiGroup Groups
 *
 * @apiUse CreateGroupSuccess
 */
router.post('/', (req, res, next) => {
  req.body = _.pick(req.body, Group.getFilter());
  req.body.owner = ObjectId.isValid(req.body.owner) ? ObjectId(req.body.owner) : null;
  req.body.admins = [req.body.owner];
  req.body.country = ObjectId.isValid(req.body.country) ? ObjectId(req.body.country) : null;

  new Group(req.body).save((err, group) => {
    if (err) { return next(err); }

    res.status(201).location(`/groups/${group._id}`).json(group);
  });
});

/**
 * @api {get} /groups/:group Get group
 * @apiName GetGroup
 * @apiGroup Groups
 *
 * @apiUse GetGroupSuccess
 */
router.get('/:group', _.partialRight(route.getByParam, 'group', 'country'));

/**
 * @api {put} /groups/:group Update group
 * @apiName PutGroup
 * @apiGroup Groups
 *
 * @apiUse GetGroupSuccess
 */
router.put('/:group', _.partialRight(route.putByParam, Group, 'group'));

/**
 * @api {delete} /groups/:group Remove group
 * @apiName DeleteGroup
 * @apiGroup Groups
 *
 * @apiUse NoContentSuccess
 */
router.delete('/:group', _.partialRight(route.deleteByParam, 'group'));

module.exports = router;
