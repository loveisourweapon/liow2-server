var crypto = require('crypto');
var isNil = require('lodash/isNil');
var moment = require('moment');
var modelUtils = require('../utils/models');
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

/**
 * Validate user is set for 'reset' and 'confirm' tokens
 *
 * @param {ObjectId} user
 *
 * @returns {boolean}
 */
function validateUser(user) {
  if (['reset', 'confirm'].includes(this.type) && isNil(user)) {
    return false;
  }
  return true;
}

/**
 * Validate group is set for 'approve' tokens
 *
 * @param {ObjectId} group
 *
 * @returns {boolean}
 */
function validateGroup(group) {
  if (this.type === 'approve' && isNil(group)) {
    return false;
  }
  return true;
}

var TokenSchema = new mongoose.Schema({
  type: { type: String, required: true },
  token: { type: String, index: { unique: true }, required: true },
  expires: { type: Date, required: true },
  user: {
    type: ObjectId,
    ref: 'User',
    validate: [validateUser, 'User is required', 'hasuser'],
  },
  group: {
    type: ObjectId,
    ref: 'Group',
    validate: [validateGroup, 'Group is required', 'hasgroup'],
  },
});

TokenSchema.plugin(modelUtils.findOneOrThrow);

TokenSchema.pre('validate', function (next) {
  // Set expires automatically
  if (this.type === 'confirm') {
    this.expires = moment().add(3, 'days').toDate();
  } else if (this.type === 'reset') {
    this.expires = moment().add(1, 'hours').toDate();
  } else if (this.type === 'approve') {
    // Approval doesn't really need to expire
    this.expires = moment().add(1, 'year').toDate();
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
