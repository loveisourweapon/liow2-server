var _ = require('lodash'),
    mongoose = require('mongoose');

var DeedSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url_title: { type: String, required: true, index: { unique: true } },
  content: { type: String, required: true },
  video_url: String,
  cover_image: String,
  created: { type: Date, default: Date.now, required: true },
  modified: Date
});

DeedSchema.pre('validate', function __preSave(next) {
  this.url_title = _.kebabCase(this.title);
  next();
});

DeedSchema.statics.getFilter = function __getFilter() {
  return ['title', 'content', 'video_url', 'cover_image'];
};

module.exports = mongoose.model('Deed', DeedSchema);
