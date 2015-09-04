var mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId,
    oneOf = require('../utils/models').oneOf;

function validateOneTarget(target) {
  // Exactly one of deed, act or news should be set as the target
  return oneOf(target, ['deed', 'act', 'news']);
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
