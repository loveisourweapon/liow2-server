var utils = require('../../utils/tests'),
    credentials = utils.credentials,
    expect = require('chai').expect,
    mongoose = require('mongoose'),
    User = require('../../models/User');

describe('utils/tests', () => {
  describe('#dbConnect()', () => {
    beforeEach(utils.dbDisconnect);
    afterEach(utils.dbDisconnect);

    it('should return when connected to database', (done) => {
      expect(mongoose.connection.readyState).to.equal(0); // disconnected

      utils.dbConnect((err) => {
        expect(err).to.not.exist;
        expect(mongoose.connection.readyState).to.equal(1); // connected

        done();
      });

      expect(mongoose.connection.readyState).to.equal(2); // connecting
    }); // it()
  }); // describe()

  describe('#dbDisconnect()', () => {
    beforeEach(utils.dbConnect);

    it('should return when disconnected from database', (done) => {
      expect(mongoose.connection.readyState).to.equal(1); // connected

      utils.dbDisconnect((err) => {
        expect(err).to.not.exist;
        expect(mongoose.connection.readyState).to.equal(0); // disconnected

        done();
      });
    }); // it()
  }); // describe()

  describe('#saveUser()', () => {
    before(utils.dbConnect);
    afterEach(utils.removeUsers);
    after(utils.dbDisconnect);

    it('should save and return a user for testing', (done) => {
      utils.saveUser(credentials, (err, user) => {
        expect(err).to.not.exist;
        expect(user).to.exist.and.to.have.property('email', credentials.email);
        expect(user.password).to.exist.and.not.be.empty;

        done();
      });
    }); // it()
  }); // describe()

  describe('#removeUsers()', () => {
    before(utils.dbConnect);
    after(utils.dbDisconnect);

    beforeEach((done) => {
      utils.saveUser(credentials, done);
    }); // beforeEach()

    it('should remove all users', (done) => {
      utils.removeUsers((err) => {
        expect(err).to.not.exist;

        User.find({}, (err, users) => {
          expect(err).to.not.exist;
          expect(users).to.exist.and.to.be.empty;

          done();
        });
      });
    }); // it()
  }); // describe()
}); //describe()
