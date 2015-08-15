var mongoose = require('mongoose'),
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

module.exports = mongoose.model('Group', GroupSchema);
