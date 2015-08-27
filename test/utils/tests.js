var utils = require('../../utils/tests'),
    credentials = utils.credentials,
    expect = require('chai').expect,
    mongoose = require('mongoose'),
    User = require('../../models/User');

describe('utils/tests', function __describe() {
  describe('#dbConnect()', function __describe() {
    beforeEach(utils.dbDisconnect);
    afterEach(utils.dbDisconnect);

    it('should return when connected to database', function __it(done) {
      expect(mongoose.connection.readyState).to.equal(0); // disconnected

      utils.dbConnect(function __dbConnect(err) {
        if (err) { return done(err); }

        expect(mongoose.connection.readyState).to.equal(1); // connected

        done();
      });

      expect(mongoose.connection.readyState).to.equal(2); // connecting
    }); // it()
  }); // describe()

  describe('#dbDisconnect()', function __describe() {
    beforeEach(utils.dbConnect);

    it('should return when disconnected from database', function __it(done) {
      expect(mongoose.connection.readyState).to.equal(1); // connected

      utils.dbDisconnect(function __dbDisconnect(err) {
        if (err) { return done(err); }

        expect(mongoose.connection.readyState).to.equal(0); // disconnected

        done();
      });
    }); // it()
  }); // describe()

  describe('#saveUser()', function __describe() {
    before(utils.dbConnect);
    afterEach(utils.removeUsers);
    after(utils.dbDisconnect);

    it('should save and return a user for testing', function __it(done) {
      utils.saveUser(credentials, function(err, user) {
        if (err) { return done(err); }

        expect(user).to.exist.and.to.have.property('email', credentials.email);
        expect(user.password).to.exist.and.not.be.empty;

        done();
      });
    }); // it()
  }); // describe()

  describe('#removeUsers()', function __describe() {
    before(utils.dbConnect);
    after(utils.dbDisconnect);

    beforeEach(function __beforeEach(done) {
      utils.saveUser(credentials, done);
    }); // beforeEach()

    it('should remove all users', function __it(done) {
      utils.removeUsers(function __removeUsers(err) {
        if (err) { return done(err); }

        User.find({}, function(err, users) {
          if (err) { return done(err); }

          expect(users).to.exist.and.to.be.empty;

          done();
        });
      });
    }); // it()
  }); // describe()

  describe('#getAccessToken()', function __describe() {
    before(utils.dbConnect);
    afterEach(utils.removeUsers);
    after(utils.dbDisconnect);

    it('should return a valid accessToken for testing', function __it(done) {
      utils.getAccessToken(function __getAccessToken(err, accessToken) {
        if (err) { return done(err); }

        expect(accessToken).to.exist.and.to.be.a('string');
        User.findOne({ accessToken: accessToken }, function __userFindOne(err, user) {
          if (err) { return done(err); }

          expect(user).to.exist.and.to.be.an.instanceof(User);

          done();
        });
      });
    }); // it()
  }); // describe()
}); //describe()
