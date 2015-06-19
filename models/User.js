var mongoose = require('mongoose'),
    bcrypt = require('bcrypt');

var SALT_ROUNDS = 10;

var UserSchema = new mongoose.Schema({
  email: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true },
  name: String,
  accessToken: String
});

UserSchema.pre('save', function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  // Hash the password with automatic salt
  bcrypt.hash(this.password, SALT_ROUNDS, function(err, hash) {
      if (err) return next(err);

      // Override the cleartext password with the hashed one
      this.password = hash;
      next();
  }.bind(this));
});

UserSchema.methods.validatePassword = function __validatePassword(password, done) {
  bcrypt.compare(password, this.password, function(err, res) {
      if (err) return done(err);

      done(null, res);
  });
};

UserSchema.statics.findOrCreate = function __findOrCreate(newUser, done) {
  this.findOne({ email: newUser.email }, function(err, user) {
    if (err) return done(err);

    if (!user) {
      user = new this({
        email: newUser.email,
        password: newUser.password || 'arandompassword',
        name: newUser.name || ''
      });
      user.save(function(err, user) {
        if (err) return done(err);

        done(null, user);
      });
    } else {
      done(null, user);
    }
  }.bind(this));
};

module.exports = mongoose.model('User', UserSchema);
