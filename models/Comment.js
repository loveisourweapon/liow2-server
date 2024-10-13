var partialRight = require('lodash/partialRight'),
    isString = require('lodash/isString'),
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
  return isString(content.text) || isString(content.image);
}

var CommentSchema = new mongoose.Schema({
  user: { type: ObjectId, ref: 'User', required: true },
  group: { type: ObjectId, ref: 'Group' },
  campaign: { type: ObjectId, ref: 'Campaign' },
  target: {
    type: {
      group: { type: ObjectId, ref: 'Group' },
      deed: { type: ObjectId, ref: 'Deed' },
      act: { type: ObjectId, ref: 'Act' },
      comment: { type: ObjectId, ref: 'Comment' }
    },
    required: true,
    validate: [
      partialRight(modelUtils.oneOf, ['group', 'deed', 'act', 'comment']),
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
    validate: [
      { validator: validateHasContent, msg: 'Text or image should be included', type: 'hascontent' },
      { validator: partialRight(modelUtils.validateIsClean, 'text'), msg: 'Text must use clean language', type: 'isclean' },
    ]
  },
  likes: { type: [{ type: ObjectId, ref: 'Like' }] },
  comments: { type: [{ type: ObjectId, ref: 'Comment' }] },
  created: { type: Date, default: Date.now, required: true },
  modified: Date
});

CommentSchema.plugin(modelUtils.findOneOrThrow);
CommentSchema.plugin(modelUtils.addFeedItem, { type: 'Comment' });

CommentSchema.statics.getFilter = function () {
  return ['content', 'group', 'campaign'];
};

module.exports = mongoose.model('Comment', CommentSchema);

/**
 * @apiDefine CommentsResponse
 * @apiVersion 1.5.0
 *
 * @apiSuccess {Comment[]} comments                List of comments
 * @apiSuccess {string}    comments._id            Comment ObjectId
 * @apiSuccess {string}    comments.user           User ObjectId
 * @apiSuccess {string}    comments.group          Group ObjectId
 * @apiSuccess {string}    comments.campaign       Campaign ObjectId
 * @apiSuccess {object}    comments.target         Target object. Only one property will be set
 * @apiSuccess {string}    comments.target.group   Group ObjectId
 * @apiSuccess {string}    comments.target.deed    Deed ObjectId
 * @apiSuccess {string}    comments.target.act     Act ObjectId
 * @apiSuccess {string}    comments.target.comment Comment ObjectId
 * @apiSuccess {object}    comments.content        Content object
 * @apiSuccess {string}    comments.content.text   Text content
 * @apiSuccess {string}    comments.content.image  Image content
 * @apiSuccess {string[]}  comments.likes          List of Like ObjectIds
 * @apiSuccess {string[]}  comments.comments       List of Comment ObjectIds
 * @apiSuccess {Date}      comments.created        Created timestamp
 * @apiSuccess {Date}      comments.modified       Modified timestamp
 *
 * @apiSuccessExample {json} Response
 *   HTTP/1.1 200 OK
 *   [{
 *     "_id": "55f6c56186b959ac12490e1e",
 *     "user": "55f6c56186b959ac12490e1a",
 *     "group": "55f6c56186b959ac12490e1b",
 *     "campaign": "55f6c56186b959ac12490e1c",
 *     "target": {
 *       "act": "55f6c56186b959ac12490e1d"
 *     },
 *     "content": {
 *       "text": "Example comment text"
 *     },
 *     "likes": ["55f6c56186b959ac12490e1f"],
 *     "comments": ["55f6c56186b959ac12490e1g"],
 *     "created": "2015-09-14T13:56:27.250Z",
 *     "modified": "2015-09-14T14:32:27.250Z"
 *   }]
 */

/**
 * @apiDefine CommentResponse
 * @apiVersion 1.5.0
 *
 * @apiSuccess {Comment}  comment                Comment
 * @apiSuccess {string}   comment._id            Comment ObjectId
 * @apiSuccess {string}   comment.user           User ObjectId
 * @apiSuccess {string}   comment.group          Group ObjectId
 * @apiSuccess {string}   comment.campaign       Campaign ObjectId
 * @apiSuccess {object}   comment.target         Target object. Only one property will be set
 * @apiSuccess {string}   comment.target.group   Group ObjectId
 * @apiSuccess {string}   comment.target.deed    Deed ObjectId
 * @apiSuccess {string}   comment.target.act     Act ObjectId
 * @apiSuccess {string}   comment.target.comment Comment ObjectId
 * @apiSuccess {object}   comment.content        Content object
 * @apiSuccess {string}   comment.content.text   Text content
 * @apiSuccess {string}   comment.content.image  Image content
 * @apiSuccess {string[]} comment.likes          List of Like ObjectIds
 * @apiSuccess {string[]} comment.comments       List of Comment ObjectIds
 * @apiSuccess {Date}     comment.created        Created timestamp
 * @apiSuccess {Date}     comment.modified       Modified timestamp
 *
 * @apiSuccessExample {json} Response
 *   HTTP/1.1 200 OK
 *   {
 *     "_id": "55f6c56186b959ac12490e1e",
 *     "user": "55f6c56186b959ac12490e1a",
 *     "group": "55f6c56186b959ac12490e1b",
 *     "campaign": "55f6c56186b959ac12490e1c",
 *     "target": {
 *       "act": "55f6c56186b959ac12490e1d"
 *     },
 *     "content": {
 *       "text": "Example comment text"
 *     },
 *     "likes": ["55f6c56186b959ac12490e1f"],
 *     "comments": ["55f6c56186b959ac12490e1g"],
 *     "created": "2015-09-14T13:56:27.250Z",
 *     "modified": "2015-09-14T14:32:27.250Z"
 *   }
 */

/**
 * @apiDefine CommentRequestBody
 * @apiVersion 1.5.0
 *
 * @apiParam (Body) {string} [group]         Group ObjectId
 * @apiParam (Body) {string} [campaign]      Campaign ObjectId
 * @apiParam (Body) {object} content         Content object. Text or image property is required
 * @apiParam (Body) {string} [content.text]  Text content
 * @apiParam (Body) {string} [content.image] Image content
 *
 * @apiParamExample {json} Request
 *   {
 *     "group": "55f6c56186b959ac12490e1b",
 *     "content": {
 *       "text": "Example comment text"
 *     }
 *   }
 */

/**
 * @apiDefine CreateCommentResponse
 * @apiVersion 1.5.0
 *
 * @apiSuccess (201) {Comment}  comment                Comment
 * @apiSuccess (201) {string}   comment._id            Comment ObjectId
 * @apiSuccess (201) {string}   comment.user           User ObjectId
 * @apiSuccess (201) {string}   comment.group          Group ObjectId
 * @apiSuccess (201) {string}   comment.campaign       Campaign ObjectId
 * @apiSuccess (201) {object}   comment.target         Target object. Only one property will be set
 * @apiSuccess (201) {string}   comment.target.group   Group ObjectId
 * @apiSuccess (201) {string}   comment.target.deed    Deed ObjectId
 * @apiSuccess (201) {string}   comment.target.act     Act ObjectId
 * @apiSuccess (201) {string}   comment.target.comment Comment ObjectId
 * @apiSuccess (201) {object}   comment.content        Content object
 * @apiSuccess (201) {string}   comment.content.text   Text content
 * @apiSuccess (201) {string}   comment.content.image  Image content
 * @apiSuccess (201) {string[]} comment.likes          List of Like ObjectIds
 * @apiSuccess (201) {string[]} comment.comments       List of Comment ObjectIds
 * @apiSuccess (201) {Date}     comment.created        Created timestamp
 *
 * @apiSuccessExample {json} Response
 *   HTTP/1.1 201 Created
 *   {
 *     "_id": "55f6c56186b959ac12490e1e",
 *     "user": "55f6c56186b959ac12490e1a",
 *     "group": "55f6c56186b959ac12490e1b",
 *     "campaign": "55f6c56186b959ac12490e1c",
 *     "target": {
 *       "act": "55f6c56186b959ac12490e1d"
 *     },
 *     "content": {
 *       "text": "Example comment text"
 *     },
 *     "likes": [],
 *     "comments": [],
 *     "created": "2015-09-14T13:56:27.250Z"
 *   }
 */
