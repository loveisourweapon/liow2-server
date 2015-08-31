var _ = require('lodash'),
    mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId;

function validateOneTarget(target) {
  // Exactly one of user, group, deed, act or news should be set as the target
  return (
    ( _.has(target, 'user') && target.user instanceof mongoose.Types.ObjectId && _.isEmpty(_.omit(target, 'user')) ) ||
    ( _.has(target, 'group') && target.group instanceof mongoose.Types.ObjectId && _.isEmpty(_.omit(target, 'group')) ) ||
    ( _.has(target, 'deed') && target.deed instanceof mongoose.Types.ObjectId && _.isEmpty(_.omit(target, 'deed')) ) ||
    ( _.has(target, 'act') && target.act instanceof mongoose.Types.ObjectId && _.isEmpty(_.omit(target, 'act')) ) ||
    ( _.has(target, 'news') && target.news instanceof mongoose.Types.ObjectId && _.isEmpty(_.omit(target, 'news')) )
  );
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
  image: String, // validate image or content is set
  content: String, // validate image or content is set
  created: { type: Date, default: Date.now, required: true },
  modified: Date
});

CommentSchema.statics.getFilter = function __getFilter() {
  return ['user', 'image', 'content'];
};

module.exports = mongoose.model('Comment', CommentSchema);
