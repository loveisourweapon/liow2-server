var _ = require('lodash'),
    mongoose = require('mongoose');

var DeedSchema = new mongoose.Schema({
  title: { type: String, required: true },
  urlTitle: { type: String, required: true, index: { unique: true } },
  content: { type: String, required: true },
  logo: String,
  videoUrl: String,
  coverImage: String,
  created: { type: Date, default: Date.now, required: true },
  modified: Date
});

DeedSchema.pre('validate', function(next) {
  this.urlTitle = _.kebabCase(this.title);
  next();
});

DeedSchema.statics.getFilter = function() {
  return ['title', 'content', 'videoUrl', 'coverImage'];
};

module.exports = mongoose.model('Deed', DeedSchema);
