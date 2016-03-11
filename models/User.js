var _ = require('lodash'),
    bcrypt = require('bcrypt'),
    modelUtils = require('../utils/models'),
    mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId,
    uniqueValidator = require('mongoose-unique-validator');

const SALT_ROUNDS = 10;

/**
 * Ensure password or facebook.id property is set
 *
 * @param {string} password
 *
 * @returns {boolean}
 */
function validatePasswordOrFacebook(password) {
  return password !== '' || _.isNumber(this.facebook.id);
}

var UserSchema = new mongoose.Schema({
  email: { type: String, index: { unique: true }, required: true },
  password: { type: String, default: '', validate: [validatePasswordOrFacebook, 'Password is required', 'required'] },
  firstName: { type: String, required: true },
  lastName: String,
  picture: String,
  coverImage: String,
  facebook: {
    id: Number,
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
  return this.firstName + (this.lastName ? ` ${this.lastName}` : '');
});

UserSchema.plugin(modelUtils.findOneOrThrow);
UserSchema.plugin(uniqueValidator, { message: 'Email is already registered' });

UserSchema.pre('save', function (next) {
  // Explicitly clear empty password
  if (this.password === '') { this.password = undefined; }

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
  return _.omit(this.toObject({ virtuals: true }), ['password', 'email', 'facebook', 'superAdmin']);
};

/**
 * Find an existing User or create a new one
 *
 * @param {object} newUser
 *
 * @returns {Promise}
 */
UserSchema.statics.findOrCreate = function (newUser) {
  return this.findOne({ email: newUser.email }).exec()
    .catch(err => {
      if (err.message !== 'Not Found') { return Promise.reject(err); }

      return new this(newUser).save();
    });
};

UserSchema.statics.getFilter = function () {
  return ['email', 'password', 'firstName', 'lastName', 'picture', 'coverImage', 'country', 'groups'];
};

module.exports = mongoose.model('User', UserSchema);

/**
 * @apiDefine UserResponse
 * @apiVersion 1.6.0
 *
 * @apiSuccess {User}     user            User
 * @apiSuccess {string}   user._id        User ObjectId
 * @apiSuccess {string}   user.firstName  User's first name
 * @apiSuccess {string}   user.lastName   User's last name
 * @apiSuccess {string}   user.name       User's full name
 * @apiSuccess {string}   user.picture    User's profile picture URL
 * @apiSuccess {string}   user.coverImage User cover image URL
 * @apiSuccess {string}   user.country    Country ObjectId
 * @apiSuccess {string[]} user.groups     List of group ObjectId's
 * @apiSuccess {Date}     user.created    Created timestamp
 * @apiSuccess {Date}     user.modified   Modified timestamp
 *
 * @apiSuccessExample {json} Response
 *   HTTP/1.1 200 OK
 *   {
 *     "_id": "55f6c56186b959ac12490e1c",
 *     "firstName": "Fred",
 *     "lastName": "Bloggs",
 *     "name": "Fred Bloggs",
 *     "picture": "https://example.com/images/picture.png",
 *     "coverImage": "https://example.com/images/cover-image.png",
 *     "country": "55f6c56186b959ac12490e1a",
 *     "groups": ["55f6c56186b959ac12490e1b"],
 *     "created": "2015-09-14T13:56:27.250Z",
 *     "modified": "2015-09-14T14:32:27.250Z"
 *   }
 */
