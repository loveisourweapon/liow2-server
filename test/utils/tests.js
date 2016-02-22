var jwt = require('jsonwebtoken'),
    config = require('../../config'),
    testUtils = require('../../utils/tests'),
    credentials = testUtils.credentials,
    expect = require('chai').expect,
    mongoose = require('mongoose'),
    User = require('../../models/User');

describe('utils/tests', () => {
  describe('#dbConnect()', () => {
    beforeEach(testUtils.dbDisconnect);
    afterEach(testUtils.dbDisconnect);

    it('should return when connected to database', () => {
      expect(mongoose.connection.readyState).to.equal(0); // disconnected

      var promise = testUtils.dbConnect()
        .then(() => expect(mongoose.connection.readyState).to.equal(1)); // connected

      expect(mongoose.connection.readyState).to.equal(2); // connecting

      return promise;
    }); // it()
  }); // describe()

  describe('#dbDisconnect()', () => {
    beforeEach(testUtils.dbConnect);

    it('should return when disconnected from database', () => {
      expect(mongoose.connection.readyState).to.equal(1); // connected

      return testUtils.dbDisconnect()
        .then(() => expect([0, 3]).to.contain(mongoose.connection.readyState)); // disconnected or disconnecting
    }); // it()
  }); // describe()

  describe('#saveUser()', () => {
    before(testUtils.dbConnect);
    after(testUtils.dbDisconnect);
    afterEach(testUtils.removeUsers);

    it('should save and return a user for testing', () => {
      return testUtils.saveUser(credentials)
        .then(user => {
          expect(user).to.exist.and.to.have.property('email', credentials.email);
          expect(user.password).to.exist.and.not.be.empty;
        });
    }); // it()
  }); // describe()

  describe('#removeUsers()', () => {
    before(testUtils.dbConnect);
    beforeEach(() => testUtils.saveUser(credentials));
    after(testUtils.dbDisconnect);

    it('should remove all users', () => {
      return testUtils.removeUsers()
        .then(() => User.find({}).exec())
        .then(users => expect(users).to.exist.and.to.be.empty);
    }); // it()
  }); // describe()

  describe('#getApiToken()', () => {
    before(testUtils.dbConnect);
    after(testUtils.dbDisconnect);
    afterEach(testUtils.removeUsers);

    it('should return a valid API token for testing', () => {
      return testUtils.getApiToken()
        .then((token) => {
          expect(token).to.exist.and.to.be.a('string');

          jwt.verify(token, config.secret, (err, userId) => {
            expect(err).to.not.exist;
            expect(userId).to.exist.and.to.be.a('string');

            return User.findById(userId)
              .exec()
              .then((user) => expect(user).to.exist.and.to.be.an.instanceof(User));
          });
        });
    }); // it()
  }); // describe()
}); //describe()
