var _ = require('lodash'),
    mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId;

var NewsSchema = new mongoose.Schema({
  author: { type: ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  urlTitle: { type: String, required: true, index: { unique: true } },
  content: { type: String, required: true },
  videoUrl: String,
  coverImage: String,
  created: { type: Date, default: Date.now, required: true },
  modified: Date
});

NewsSchema.pre('validate', function(next) {
  this.urlTitle = _.kebabCase(this.title);
  next();
});

NewsSchema.statics.getFilter = function() {
  return ['author', 'title', 'content', 'videoUrl', 'coverImage'];
};

module.exports = mongoose.model('News', NewsSchema);
