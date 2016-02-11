var _ = require('lodash'),
    modelUtils = require('../utils/models'),
    mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId;

/**
 * Ensure text or image field is included
 *
 * @param {object} content
 *
 * @returns {boolean}
 */
function validateHasContent(content) {
  return _.isString(content.text) || _.isString(content.image);
}

var CommentSchema = new mongoose.Schema({
  user: { type: ObjectId, ref: 'User', required: true },
  target: {
    type: {
      user: { type: ObjectId, ref: 'User' },
      group: { type: ObjectId, ref: 'Group' },
      deed: { type: ObjectId, ref: 'Deed' },
      act: { type: ObjectId, ref: 'Act' },
      news: { type: ObjectId, ref: 'News' }
    },
    required: true,
    validate: [
      _.partialRight(modelUtils.oneOf, ['user', 'group', 'deed', 'act', 'news']),
      'One target should be set',
      'onetarget'
    ]
  },
  content: {
    type: {
      text: String,
      image: String
    },
    required: true,
    validate: [validateHasContent, 'Text or image should be included', 'hascontent']
  },
  created: { type: Date, default: Date.now, required: true },
  modified: Date
});

CommentSchema.plugin(modelUtils.findOneOrThrow);

CommentSchema.statics.getFilter = function () {
  return ['user', 'content'];
};

module.exports = mongoose.model('Comment', CommentSchema);

/**
 * @apiDefine GetCommentsSuccess
 *
 * @apiSuccess {Comment[]} comments               List of comments
 * @apiSuccess {string}    comments._id           Comment ObjectId
 * @apiSuccess {string}    comments.user          User ObjectId
 * @apiSuccess {Date}      comments.created       Created timestamp
 * @apiSuccess {object}    comments.content       Content object
 * @apiSuccess {string}    comments.content.text  Text content
 * @apiSuccess {string}    comments.content.image Image content
 * @apiSuccess {object}    comments.target        Target object. Only one of user, group, deed, act or news will be set
 * @apiSuccess {string}    comments.target.user   User ObjectId
 * @apiSuccess {string}    comments.target.group  Group ObjectId
 * @apiSuccess {string}    comments.target.deed   Deed ObjectId
 * @apiSuccess {string}    comments.target.act    Act ObjectId
 * @apiSuccess {string}    comments.target.news   News ObjectId
 *
 * @apiSuccessExample {json} Response
 *   HTTP/1.1 200 OK
 *   [{
 *     "_id": "55f6c56186b959ac12490e1c",
 *     "user": "55f6c56186b959ac12490e1a",
 *     "created": "2015-09-14T13:56:27.250Z",
 *     "content": {
 *       "text": "Example comment text"
 *     }
 *     "target": {
 *       "act": "55f6c56186b959ac12490e1b"
 *     }
 *   }]
 */

/**
 * @apiDefine GetCommentSuccess
 *
 * @apiSuccess {Comment} comment               Comment
 * @apiSuccess {string}  comment._id           Comment ObjectId
 * @apiSuccess {string}  comment.user          User ObjectId
 * @apiSuccess {Date}    comment.created       Created timestamp
 * @apiSuccess {object}  comment.content       Content object
 * @apiSuccess {string}  comment.content.text  Text content
 * @apiSuccess {string}  comment.content.image Image content
 * @apiSuccess {object}  comment.target        Target object. Only one of user, group, deed, act or news will be set
 * @apiSuccess {string}  comment.target.user   User ObjectId
 * @apiSuccess {string}  comment.target.group  Group ObjectId
 * @apiSuccess {string}  comment.target.deed   Deed ObjectId
 * @apiSuccess {string}  comment.target.act    Act ObjectId
 * @apiSuccess {string}  comment.target.news   News ObjectId
 *
 * @apiSuccessExample {json} Response
 *   HTTP/1.1 200 OK
 *   {
 *     "_id": "55f6c56186b959ac12490e1c",
 *     "user": "55f6c56186b959ac12490e1a",
 *     "created": "2015-09-14T13:56:27.250Z",
 *     "content": {
 *       "text": "Example comment text"
 *     }
 *     "target": {
 *       "act": "55f6c56186b959ac12490e1b"
 *     }
 *   }
 */

/**
 * @apiDefine CreateCommentSuccess
 *
 * @apiSuccess (201) {Comment} comment               Created comment
 * @apiSuccess (201) {string}  comment._id           Comment ObjectId
 * @apiSuccess (201) {string}  comment.user          User ObjectId
 * @apiSuccess (201) {Date}    comment.created       Created timestamp
 * @apiSuccess (201) {object}  comment.content       Content object
 * @apiSuccess (201) {string}  comment.content.text  Text content
 * @apiSuccess (201) {string}  comment.content.image Image content
 * @apiSuccess (201) {object}  comment.target        Target object. Only one of user, group, deed, act or news will be set
 * @apiSuccess (201) {string}  comment.target.user   User ObjectId
 * @apiSuccess (201) {string}  comment.target.group  Group ObjectId
 * @apiSuccess (201) {string}  comment.target.deed   Deed ObjectId
 * @apiSuccess (201) {string}  comment.target.act    Act ObjectId
 * @apiSuccess (201) {string}  comment.target.news   News ObjectId
 *
 * @apiSuccessExample {json} Response
 *   HTTP/1.1 201 Created
 *   {
 *     "_id": "55f6c56186b959ac12490e1c",
 *     "user": "55f6c56186b959ac12490e1a",
 *     "created": "2015-09-14T13:56:27.250Z",
 *     "content": {
 *       "text": "Example comment text"
 *     }
 *     "target": {
 *       "act": "55f6c56186b959ac12490e1b"
 *     }
 *   }
 */
