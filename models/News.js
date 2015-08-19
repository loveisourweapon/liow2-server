var _ = require('lodash'),
    mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId;

var NewsSchema = new mongoose.Schema({
  author: { type: ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  url_title: { type: String, required: true, index: { unique: true } },
  content: { type: String, required: true },
  video_url: String,
  cover_image: String,
  created: { type: Date, default: Date.now, required: true },
  modified: Date
});

NewsSchema.pre('validate', function __preSave(next) {
  this.url_title = _.kebabCase(this.title);
  next();
});

NewsSchema.statics.getFilter = function __getFilter() {
  return ['author', 'title', 'content', 'video_url', 'cover_image'];
};

module.exports = mongoose.model('News', NewsSchema);
