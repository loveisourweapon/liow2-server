var config = require('../../config/config'),
    expect = require('chai').expect,
    mongoose = require('mongoose'),
    User = require('../../models/User');

describe('UserSchema', function() {
  var email = 'test@example.com',
      password = 'password';

  before(function(done) {
    if (mongoose.connection.readyState === 0) {
      mongoose.connect(config.db.url, function(err) {
        if (err) throw err;

        return done();
      });
    } else {
      return done();
    }
  }); // before()

  after(function(done) {
    mongoose.connection.close(function(err) {
      if (err) throw err;

      return done();
    });
  }); // after()

  afterEach(function(done) {
    User.remove({}, function(err) {
      if (err) throw err;

      return done();
    });
  }); // afterEach()

  describe('#save()', function() {
    it('should hash password on save', function(done) {
      var user = new User({
        email: email,
        password: password
      });

      user.save(function(err, user) {
        if (err) throw err;

        expect(user.password).to.exist.and.not.to.equal(password);

        done();
      });
    }); // it()

    it('should do nothing if no password is set', function(done) {
      var user = new User({
        email: email
      });

      user.save(function(err, user) {
        if (err) throw err;

        expect(user.password).to.not.exist;

        done();
      });
    }); // it
  }); // describe()

  describe('#validatePassword()', function() {
    beforeEach(function(done) {
      var user = new User({
        email: email,
        password: password
      });

      user.save(function(err) {
        if (err) throw err;

        return done();
      });
    }); // beforeEach()

    it('should return true when password is correct', function(done) {
      User.findOne({ email: email }, function(err, user) {
        if (err) throw err;

        user.validatePassword(password, function(err, res) {
          if (err) throw err;

          expect(res).to.be.true;

          done();
        });
      });
    }); // it()

    it('should return false when password is incorrect', function(done) {
      User.findOne({ email: email }, function(err, user) {
        if (err) throw err;

        user.validatePassword('wrongpassword', function(err, res) {
          if (err) throw err;

          expect(res).to.be.false;

          done();
        });
      });
    }); // it()

    it('should return false when user has no password', function(done) {
      User.findOne({ email: email }, function(err, user) {
        if (err) throw err;

        user.password = void 0;
        user.save(function(err, user) {
          if (err) throw err;

          user.validatePassword(password, function(err, res) {
            if (err) throw err;

            expect(res).to.be.false;

            done();
          });
        });
      });
    }); // it()
  }); // describe()

  describe('#findOrCreate()', function() {
    it('should return an existing user', function(done) {
      var user = new User({
        email: email
      });

      user.save(function(err) {
        if (err) throw err;

        User.findOrCreate({ email: email }, function(err, foundUser) {
          if (err) throw err;

          expect(foundUser).to.exist.and.to.be.an.instanceof(User);
          expect(foundUser.id).to.equal(user.id);
          expect(foundUser.email).to.equal(email);

          done();
        });
      });
    }); // it()

    it('should create a new user', function(done) {
      User.findOne({ email: email }, function(err, user) {
        if (err) throw err;

        expect(user).to.not.exist;

        User.findOrCreate({ email: email }, function(err, user) {
          if (err) throw err;

          expect(user).to.exist.and.to.be.an.instanceof(User);
          expect(user.email).to.equal(email);

          done();
        });
      });
    }); // it()
  }); // describe()
}); // describe()
