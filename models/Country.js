var mongoose = require('mongoose');

var CountrySchema = new mongoose.Schema({
  name: { type: String, required: true, index: { unique: true } },
  code: {
    type: String, minlength: 2, maxlength: 2, uppercase: true,
    required: true, index: { unique: true }
  }
});

module.exports = mongoose.model('Country', CountrySchema);
