var _ = require('lodash'),
    mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId;

/**
 * At least one admin
 *
 * @param {ObjectId[]} admins
 *
 * @returns {boolean}
 */
function validateHasAdmin(admins) {
  return admins.length > 0;
}

/**
 * One of the admins is the owner
 *
 * @param {ObjectId[]} admins
 *
 * @returns {boolean}
 */
function validateOwnerIsAdmin(admins) {
  return Boolean(
    _.find(admins, (admin) => {
      return admin === this.owner;
    })
  );
}

var GroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  urlName: { type: String, required: true, index: { unique: true } },
  owner: { type: ObjectId, ref: 'User', required: true },
  admins: {
    type: [{ type: ObjectId, ref: 'User' }],
    required: true,
    validate: [
      { validator: validateHasAdmin, msg: 'An admin user is required', type: 'hasadmin' },
      { validator: validateOwnerIsAdmin, msg: 'The owner needs to be an admin', type: 'ownerisadmin' }
    ]
  },
  country: { type: ObjectId, ref: 'Country' },
  logo: String,
  coverImage: String,
  welcomeMessage: String,
  created: { type: Date, default: Date.now, required: true },
  modified: Date
});

GroupSchema.pre('validate', function(next) {
  this.urlName = _.kebabCase(this.name);
  next();
});

GroupSchema.statics.getFilter = function() {
  return ['name', 'owner', 'country', 'logo', 'coverImage', 'welcomeMessage'];
};

module.exports = mongoose.model('Group', GroupSchema);
