var mongoose = require('mongoose');

var DeedSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url_title: { type: String, required: true, index: { unique: true } },
  content: { type: String, required: true },
  video_url: String,
  cover_image: String,
  created: { type: Date, default: Date.now, required: true },
  modified: Date
});

module.exports = mongoose.model('Deed', DeedSchema);
