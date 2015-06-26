var utils = require('../../utils/tests'),
    credentials = utils.credentials,
    expect = require('chai').expect,
    User = require('../../models/User');

describe('UserSchema', function __describe() {
  before(utils.dbConnect);
  after(utils.dbDisconnect);

  describe('#save()', function __describe() {
    afterEach(utils.removeUsers);

    it('should require an email address', function __it(done) {
      var user = new User();

      user.save(function __userSave(err, user) {
        expect(err).to.exist.and.to.have.property('name', 'ValidationError');
        expect(user).to.not.exist;

        return done();
      });
    }); // it()

    it('should hash password on save', function __it(done) {
      var user = new User(credentials);

      user.save(function __userSave(err, user) {
        if (err) { return done(err); }

        expect(user.password).to.exist.and.not.to.equal(credentials.password);

        return done();
      });
    }); // it()

    it('should not hash if no password is set', function __it(done) {
      var user = new User({
        email: credentials.email
      });

      user.save(function __userSave(err, user) {
        if (err) { return done(err); }

        expect(user.password).to.not.exist;

        return done();
      });
    }); // it()
  }); // describe()

  describe('#validatePassword()', function __describe() {
    afterEach(utils.removeUsers);

    beforeEach(function __beforeEach(done) {
      utils.saveUser(credentials, done);
    }); // beforeEach()

    it('should return true when password is correct', function __it(done) {
      User.findOne({ email: credentials.email }, function __userFindOne(err, user) {
        if (err) { return done(err); }

        user.validatePassword(credentials.password, function __userValidatePassword(err, res) {
          if (err) { return done(err); }

          expect(res).to.be.true;

          return done();
        });
      });
    }); // it()

    it('should return false when password is incorrect', function __it(done) {
      User.findOne({ email: credentials.email }, function __userFindOne(err, user) {
        if (err) { return done(err); }

        user.validatePassword('wrongpassword', function __userValidatePassword(err, res) {
          if (err) { return done(err); }

          expect(res).to.be.false;

          return done();
        });
      });
    }); // it()

    it('should return false when user has no password', function __it(done) {
      User.findOne({ email: credentials.email }, function __userFindOne(err, user) {
        if (err) { return done(err); }

        user.password = void 0;
        user.save(function __userSave(err, user) {
          if (err) { return done(err); }

          user.validatePassword(credentials.password, function __userValidatePassword(err, res) {
            if (err) { return done(err); }

            expect(res).to.be.false;

            return done();
          });
        });
      });
    }); // it()
  }); // describe()

  describe('#findOrCreate()', function __describe() {
    afterEach(utils.removeUsers);

    it('should return an existing user', function __it(done) {
      var user = new User(credentials);

      user.save(function __userSave(err) {
        if (err) { return done(err); }

        User.findOrCreate(credentials, function __userFindOrCreate(err, foundUser) {
          if (err) { return done(err); }

          expect(foundUser).to.exist.and.to.be.an.instanceof(User);
          expect(foundUser.id).to.equal(user.id);
          expect(foundUser.email).to.equal(credentials.email);

          return done();
        });
      });
    }); // it()

    it('should create a new user', function __describe(done) {
      User.findOne({ email: credentials.email }, function __userFindOne(err, user) {
        if (err) { return done(err); }

        expect(user).to.not.exist;

        User.findOrCreate(credentials, function __userFindOrCreate(err, user) {
          if (err) { return done(err); }

          expect(user).to.exist.and.to.be.an.instanceof(User);
          expect(user.email).to.equal(credentials.email);

          return done();
        });
      });
    }); // it()
  }); // describe()
}); // describe()
