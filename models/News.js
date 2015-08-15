var mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId;

var NewsSchema = new mongoose.Schema({
  author: { type: ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  video_url: String,
  cover_image: String,
  created: { type: Date, default: Date.now, required: true },
  modified: Date
});

module.exports = mongoose.model('News', NewsSchema);
