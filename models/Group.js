var some = require('lodash/some');
var kebabCase = require('lodash/kebabCase');
var modelUtils = require('../utils/models');
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var uniqueValidator = require('mongoose-unique-validator');

/**
 * One of the admins is the owner
 *
 * @param {ObjectId[]} admins
 *
 * @returns {boolean}
 */
function validateOwnerIsAdmin(admins) {
  return some(admins, (admin) => admin.equals(this.owner));
}

var GroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    validate: [modelUtils.validateIsClean, 'Please use clean language', 'isclean'],
  },
  urlName: { type: String, required: true, unique: true },
  owner: { type: ObjectId, ref: 'User', required: true },
  contactNumber: { type: String, required: true },
  admins: {
    type: [{ type: ObjectId, ref: 'User' }],
    required: true,
    validate: [
      { validator: modelUtils.hasOne, msg: 'An admin user is required', type: 'hasadmin' },
      {
        validator: validateOwnerIsAdmin,
        msg: 'The owner needs to be an admin',
        type: 'ownerisadmin',
      },
    ],
  },
  country: { type: ObjectId, ref: 'Country' },
  logo: String,
  coverImage: String,
  welcomeMessage: {
    type: String,
    validate: [modelUtils.validateIsClean, 'Please use clean language', 'isclean'],
  },
  approved: { type: Boolean, default: false, required: true },
  created: { type: Date, default: Date.now, required: true },
  modified: Date,
});

GroupSchema.plugin(modelUtils.findOneOrThrow);
GroupSchema.plugin(uniqueValidator, { message: 'Name is already taken' });

GroupSchema.pre('validate', function (next) {
  this.urlName = kebabCase(this.name);
  next();
});

GroupSchema.statics.getFilter = function () {
  return ['name', 'contactNumber', 'logo', 'coverImage', 'admins', 'welcomeMessage'];
};

GroupSchema.statics.getSearchable = function () {
  return ['name'];
};

module.exports = mongoose.model('Group', GroupSchema);

/**
 * @apiDefine GroupsResponse
 * @apiVersion 1.22.0
 *
 * @apiSuccess {Group[]} groups                List of groups
 * @apiSuccess {string}  groups._id            Group ObjectId
 * @apiSuccess {string}  groups.name           Group name
 * @apiSuccess {string}  groups.urlName        Group URL name
 * @apiSuccess {string}  groups.owner          User ObjectId
 * @apiSuccess {string}  groups.contactNumber  Group owner contact number
 * @apiSuccess {string}  groups.admins         List of user ObjectId's
 * @apiSuccess {string}  groups.country        Country ObjectId
 * @apiSuccess {string}  groups.logo           Group logo URL
 * @apiSuccess {string}  groups.coverImage     Group cover image URL
 * @apiSuccess {string}  groups.welcomeMessage Group welcome message
 * @apiSuccess {boolean} groups.approved       Has group been approved
 * @apiSuccess {Date}    groups.created        Created timestamp
 * @apiSuccess {Date}    groups.modified       Modified timestamp
 *
 * @apiSuccessExample {json} Response
 *   HTTP/1.1 200 OK
 *   [{
 *     "_id": "55f6c56186b959ac12490e1c",
 *     "name": "Group Name",
 *     "urlName": "group-name",
 *     "owner": "55f6c56186b959ac12490e1a",
 *     "contactNumber": "0400123456",
 *     "admins": ["55f6c56186b959ac12490e1a"],
 *     "country": "55f6c56186b959ac12490e1b",
 *     "logo": "https://example.com/images/group-logo.png",
 *     "coverImage": "https://example.com/images/cover-image.png",
 *     "welcomeMessage": "Example welcome message",
 *     "approved": true,
 *     "created": "2015-09-14T13:56:27.250Z",
 *     "modified": "2015-09-14T14:32:27.250Z"
 *   }]
 */

/**
 * @apiDefine GroupResponse
 * @apiVersion 1.22.0
 *
 * @apiSuccess {Group}   group                Group
 * @apiSuccess {string}  group._id            Group ObjectId
 * @apiSuccess {string}  group.name           Group name
 * @apiSuccess {string}  group.urlName        Group URL name
 * @apiSuccess {string}  group.owner          User ObjectId
 * @apiSuccess {string}  group.contactNumber  Group owner contact number
 * @apiSuccess {string}  group.admins         List of user ObjectId's
 * @apiSuccess {string}  group.country        Country ObjectId
 * @apiSuccess {string}  group.logo           Group logo URL
 * @apiSuccess {string}  group.coverImage     Group cover image URL
 * @apiSuccess {string}  group.welcomeMessage Group welcome message
 * @apiSuccess {boolean} group.approved       Has group been approved
 * @apiSuccess {Date}    group.created        Created timestamp
 * @apiSuccess {Date}    group.modified       Modified timestamp
 *
 * @apiSuccessExample {json} Response
 *   HTTP/1.1 200 OK
 *   {
 *     "_id": "55f6c56186b959ac12490e1c",
 *     "name": "Group Name",
 *     "urlName": "group-name",
 *     "owner": "55f6c56186b959ac12490e1a",
 *     "contactNumber": "0400123456",
 *     "admins": ["55f6c56186b959ac12490e1a"],
 *     "country": "55f6c56186b959ac12490e1b",
 *     "logo": "https://example.com/images/group-logo.png",
 *     "coverImage": "https://example.com/images/cover-image.png",
 *     "welcomeMessage": "Example welcome message",
 *     "approved": true,
 *     "created": "2015-09-14T13:56:27.250Z",
 *     "modified": "2015-09-14T14:32:27.250Z"
 *   }
 */

/**
 * @apiDefine GroupRequestBody
 * @apiVersion 1.22.0
 *
 * @apiParam (Body) {string}   name             Group name
 * @apiParam (Body) {string}   [contactNumber]  Group owner contact number
 * @apiParam (Body) {string}   [logo]           Group logo URL
 * @apiParam (Body) {string}   [coverImage]     Group cover image URL
 * @apiParam (Body) {string[]} [admins]         List of user ObjectId's
 * @apiParam (Body) {string}   [welcomeMessage] Group welcome message
 *
 * @apiParamExample {json} Request
 *   {
 *     "name": "Group Name",
 *     "contactNumber": "0400123456",
 *     "logo": "https://example.com/images/group-logo.png",
 *     "coverImage": "https://example.com/images/cover-image.png",
 *     "admins": ["55f6c56186b959ac12490e1a", "55f6c56186b959ac12490e1d"],
 *     "welcomeMessage": "Example welcome message"
 *   }
 */

/**
 * @apiDefine CreateGroupResponse
 * @apiVersion 1.22.0
 *
 * @apiSuccess (201) {Group}   group                Group
 * @apiSuccess (201) {string}  group._id            Group ObjectId
 * @apiSuccess (201) {string}  group.name           Group name
 * @apiSuccess (201) {string}  group.urlName        Group URL name
 * @apiSuccess (201) {string}  group.owner          User ObjectId
 * @apiSuccess (201) {string}  group.contactNumber  Group owner contact number
 * @apiSuccess (201) {string}  group.admins         List of user ObjectId's
 * @apiSuccess (201) {string}  group.country        Country ObjectId
 * @apiSuccess (201) {string}  group.logo           Group logo URL
 * @apiSuccess (201) {string}  group.coverImage     Group cover image URL
 * @apiSuccess (201) {string}  group.welcomeMessage Group welcome message
 * @apiSuccess (201) {boolean} group.approved       Has group been approved
 * @apiSuccess (201) {Date}    group.created        Created timestamp
 *
 * @apiSuccessExample {json} Response
 *   HTTP/1.1 201 Created
 *   {
 *     "_id": "55f6c56186b959ac12490e1c",
 *     "name": "Group Name",
 *     "urlName": "group-name",
 *     "owner": "55f6c56186b959ac12490e1a",
 *     "contactNumber": "0400123456",
 *     "admins": ["55f6c56186b959ac12490e1a"],
 *     "country": "55f6c56186b959ac12490e1b",
 *     "logo": "https://example.com/images/group-logo.png",
 *     "coverImage": "https://example.com/images/cover-image.png",
 *     "welcomeMessage": "Example welcome message",
 *     "approved": false,
 *     "created": "2015-09-14T13:56:27.250Z"
 *   }
 */
