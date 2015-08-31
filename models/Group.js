var _ = require('lodash'),
    mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId;

var GroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url_name: { type: String, required: true, index: { unique: true } },
  owner: { type: ObjectId, ref: 'User', required: true },
  admins: [{ type: ObjectId, ref: 'User', required: true }],
  country: { type: ObjectId, ref: 'Country' },
  logo: String,
  cover_image: String,
  welcome_message: String,
  created: { type: Date, default: Date.now, required: true },
  modified: Date
});

GroupSchema.pre('validate', function __preValidate(next) {
  this.url_name = _.kebabCase(this.name);
  next();
});

GroupSchema.statics.getFilter = function __getFilter() {
  return ['name', 'owner', 'country', 'logo', 'cover_image', 'welcome_message'];
};

module.exports = mongoose.model('Group', GroupSchema);
