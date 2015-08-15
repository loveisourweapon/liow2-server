var mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId;

var CommentSchema = new mongoose.Schema({
  user: { type: ObjectId, ref: 'User', required: true },
  target: { // validate that one and only one target is set
    user: { type: ObjectId, ref: 'User' },
    ministry: { type: ObjectId, ref: 'Ministry' },
    deed: { type: ObjectId, ref: 'Deed' },
    act: { type: ObjectId, ref: 'Act' },
    news: { type: ObjectId, ref: 'News' }
  },
  image: String, // validate image or content is set
  content: String, // validate image or content is set
  created: { type: Date, default: Date.now, required: true },
  modified: Date
});

module.exports = mongoose.model('Comment', CommentSchema);
