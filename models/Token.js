var crypto = require('crypto');
var moment = require('moment');
var modelUtils = require('../utils/models');
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var TokenSchema = new mongoose.Schema({
  type: { type: String, required: true },
  token: { type: String, index: { unique: true }, required: true },
  expires: { type: Date, required: true },
  user: { type: ObjectId, ref: 'User', required: true },
});

TokenSchema.plugin(modelUtils.findOneOrThrow);

TokenSchema.pre('validate', function (next) {
  // Set expires automatically for 'confirm' and 'reset' types
  if (this.type === 'confirm') {
    this.expires = moment().add(3, 'days').toDate();
  } else if (this.type === 'reset') {
    this.expires = moment().add(1, 'hours').toDate();
  }

  // Generate a random string of bytes for the token
  crypto.randomBytes(12, (err, buf) => {
    if (err) {
      return next(err);
    }

    this.token = buf.toString('hex');
    next();
  });
});

module.exports = mongoose.model('Token', TokenSchema);
