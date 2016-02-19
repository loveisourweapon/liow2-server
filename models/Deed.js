var _ = require('lodash'),
    modelUtils = require('../utils/models'),
    mongoose = require('mongoose'),
    uniqueValidator = require('mongoose-unique-validator');

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

DeedSchema.plugin(modelUtils.findOneOrThrow);
DeedSchema.plugin(uniqueValidator, { message: 'Title is already taken' });

DeedSchema.pre('validate', function (next) {
  this.urlTitle = _.kebabCase(this.title);
  next();
});

DeedSchema.statics.getFilter = function () {
  return ['title', 'content', 'videoUrl', 'coverImage'];
};

DeedSchema.statics.getSearchable = function () {
  return ['title'];
};

module.exports = mongoose.model('Deed', DeedSchema);
