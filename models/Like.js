var mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId;

var LikeSchema = new mongoose.Schema({
  user: { type: ObjectId, ref: 'User', required: true },
  target: { // validate that one and only one target is set
    deed: { type: ObjectId, ref: 'Deed' },
    act: { type: ObjectId, ref: 'Act' },
    news: { type: ObjectId, ref: 'News' }
  },
  created: { type: Date, default: Date.now, required: true }
});

module.exports = mongoose.model('Like', LikeSchema);
