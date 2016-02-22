var _ = require('lodash'),
    bcrypt = require('bcrypt'),
    modelUtils = require('../utils/models'),
    mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId,
    uniqueValidator = require('mongoose-unique-validator');

const SALT_ROUNDS = 10;

var UserSchema = new mongoose.Schema({
  email: { type: String, index: { unique: true }, required: true },
  password: String, // validate password or facebookId set
  firstName: String,
  lastName: String,
  picture: String,
  coverImage: String,
  facebook: {
    id: Number, // validate password or facebook.id set
    accessToken: String,
    refreshToken: String
  },
  country: { type: ObjectId, ref: 'Country' },
  groups: {
    type: [{ type: ObjectId, ref: 'Group' }]
  },
  superAdmin: { type: Boolean, default: false, required: true },
  created: { type: Date, default: Date.now, required: true },
  modified: Date,
  lastSeen: Date
});

UserSchema.virtual('name').get(function () {
  return (
    (this.firstName ? `${this.firstName}${this.lastName ? ' ' : ''}` : '') +
    (this.lastName ? this.lastName : '')
  );
});

UserSchema.plugin(modelUtils.findOneOrThrow);
UserSchema.plugin(uniqueValidator, { message: 'Email is already registered' });

UserSchema.pre('save', function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.password || !this.isModified('password')) { return next(); }

  // Hash the password with automatic salt
  bcrypt.hash(this.password, SALT_ROUNDS, (err, hash) => {
    if (err) { return next(err); }

    // Override the clear text password with the hashed one
    this.password = hash;
    next();
  });
});

UserSchema.methods.validatePassword = function (password) {
  return new Promise((resolve, reject) => {
    // Return false if no password set
    if (!this.password) { return resolve(false); }

    // Compare the input password with the hashed password
    bcrypt.compare(password, this.password, (err, result) => {
      if (err) { return reject(result); }

      resolve(result);
    });
  });
};

UserSchema.methods.toJSON = function () {
  return _.omit(this.toObject({ virtuals: true }), ['password', 'facebook', 'superAdmin']);
};

UserSchema.statics.findOrCreate = function (newUser) {
  return this.findOne({ email: newUser.email })
    .exec()
    .catch(err => {
      if (err.message !== 'Not Found') { return Promise.reject(err); }

      return new this(newUser).save();
    });
};

UserSchema.statics.getFilter = function () {
  return ['email', 'password', 'firstName', 'lastName', 'picture', 'coverImage', 'country', 'groups'];
};

module.exports = mongoose.model('User', UserSchema);
