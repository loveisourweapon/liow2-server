var utils = require('../utils/models'),
    bcrypt = require('bcrypt'),
    mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId;

const SALT_ROUNDS = 10;

var UserSchema = new mongoose.Schema({
  email: { type: String, index: { unique: true }, required: true },
  username: { type: String, index: { unique: true }, required: true },
  password: String, // validate password or facebook.id set
  name: String,
  picture: String,
  coverImage: String,
  facebook: {
    id: Number, // validate password or facebook.id set
    accessToken: String,
    refreshToken: String
  },
  country: { type: ObjectId, ref: 'Country' },
  groups: {
    type: [{ type: ObjectId, ref: 'Group' }],
    required: true,
    validate: [utils.hasOne, 'At least one group is required', 'hasgroup']
  },
  superAdmin: { type: Boolean, default: false, required: true },
  accessToken: String,
  created: { type: Date, default: Date.now, required: true },
  modified: Date,
  lastSeen: Date
});

UserSchema.pre('save', function(next) {
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

UserSchema.methods.validatePassword = function(password, done) {
  // Return false if no password set
  if (!this.password) { return done(null, false); }

  // Compare the input password with the hashed password
  bcrypt.compare(password, this.password, (err, res) => {
    if (err) { return done(err); }

    done(null, res);
  });
};

UserSchema.statics.findOrCreate = function(newUser, done) {
  this.findOne({ email: newUser.email }, (err, user) => {
    if (err) { return done(err); }

    if (!user) {
      // Provide defaults with _.extend?
      user = new this(newUser);
      user.save((err, user) => {
        if (err) { return done(err); }

        done(null, user);
      });
    } else {
      done(null, user);
    }
  });
};

UserSchema.statics.getFilter = function() {
  return ['email', 'username', 'password', 'name', 'picture', 'coverImage', 'country', 'groups'];
};

module.exports = mongoose.model('User', UserSchema);
