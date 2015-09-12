var _ = require('lodash'),
    mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId,
    oneOf = require('../utils/models').oneOf;

/**
 * Exactly one of user, group, deed, act or news should be set as the target
 *
 * @param {Object} target
 *
 * @returns {boolean|Error}
 */
function validateOneTarget(target) {
  return oneOf(target, ['user', 'group', 'deed', 'act', 'news']);
}

/**
 * Ensure text or image field is included
 *
 * @param {Object} content
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
    validate: [validateOneTarget, 'One target should be set', 'onetarget']
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

CommentSchema.statics.getFilter = function() {
  return ['user', 'content'];
};

module.exports = mongoose.model('Comment', CommentSchema);
