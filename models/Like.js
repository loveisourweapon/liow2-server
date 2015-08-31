var _ = require('lodash'),
    mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId;

function validateOneTarget(target) {
  // Exactly one of deed, act or news should be set as the target
  return (
    ( _.has(target, 'deed') && target.deed instanceof mongoose.Types.ObjectId && _.isEmpty(_.omit(target, 'deed')) ) ||
    ( _.has(target, 'act') && target.act instanceof mongoose.Types.ObjectId && _.isEmpty(_.omit(target, 'act')) ) ||
    ( _.has(target, 'news') && target.news instanceof mongoose.Types.ObjectId && _.isEmpty(_.omit(target, 'news')) )
  );
}

var LikeSchema = new mongoose.Schema({
  user: { type: ObjectId, ref: 'User', required: true },
  target: {
    type: {
      deed: { type: ObjectId, ref: 'Deed' },
      act: { type: ObjectId, ref: 'Act' },
      news: { type: ObjectId, ref: 'News' }
    },
    required: true,
    validate: [validateOneTarget, 'One target should be set', 'onetarget']
  },
  created: { type: Date, default: Date.now, required: true }
});

LikeSchema.statics.getFilter = function __getFilter() {
  return ['user'];
};

module.exports = mongoose.model('Like', LikeSchema);
