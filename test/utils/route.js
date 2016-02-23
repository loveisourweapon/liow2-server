var _ = require('lodash'),
    testUtils = require('../../utils/tests'),
    routeUtils = require('../../utils/route'),
    HttpError = require('../../utils/general').HttpError,
    expect = require('chai').expect;

var ObjectId = require('mongoose').Types.ObjectId,
    User = require('../../models/User'),
    Country = require('../../models/Country');

var countryId = null;
var validCountry = {
  name: 'Australia',
  code: 'AU'
};

describe('utils/routes', () => {
  before(testUtils.dbConnect);
  after(testUtils.dbDisconnect);

  describe('#paramHandler()', () => {
    beforeEach(() => {
      return new Country(validCountry).save()
        .then(country => countryId = country.id);
    }); // beforeEach()
    afterEach(() => Country.remove({}));

    it('should return an error when not called with a mongoose Model', done => {
      var req = {}, res = {};
      routeUtils.paramHandler(req, res, err => {
        expect(err).to.be.an.instanceof(Error);
        expect(err.message).to.match(/mongoose\smodel/);

        done();
      }, countryId, 'country');
    }); // it()

    it('should return an error when called with an invalid ID', done => {
      var req = {}, res = {};
      routeUtils.paramHandler(req, res, err => {
        expect(err).to.be.an.instanceof(Error).and.to.have.property('message', 'Invalid country');

        done();
      }, 'invalid', 'country', Country);
    }); // it()

    it('should return an error when called with a non-existent ID', done => {
      var req = {}, res = {}, id = String(ObjectId());
      routeUtils.paramHandler(req, res, err => {
        expect(err).to.be.an.instanceof(Error).and.to.have.property('message', 'Not Found');

        done();
      }, id, 'country', Country);
    }); // it()

    it('should attach a document when given a valid ID and called with a Model', done => {
      var req = {}, res = {};
      routeUtils.paramHandler(req, res, err => {
        expect(err).to.not.exist;
        expect(req.country).to.be.an.instanceof(Country).and.to.have.property('id', countryId);

        done();
      }, countryId, 'country', Country);
    }); // it()
  }); // describe()

  describe('#getAll', () => {
    // TODO
  }); // describe()

  describe('#getByParam', () => {
    // TODO
  }); // describe()

  describe('#getByTarget', () => {
    // TODO
  }); // describe()

  describe('#putByParam', () => {
    // TODO
  }); // describe()

  describe('#deleteByParam', () => {
    // TODO
  }); // describe()

  describe('#ensureAuthenticated', () => {
    beforeEach(() => testUtils.saveUser(testUtils.credentials));
    afterEach(testUtils.removeUsers);

    it('should return an error if no Authorization header included', done => {
      var req = { headers: {} }, res = {};
      routeUtils.ensureAuthenticated(req, res, err => {
        expect(err).to.be.an.instanceof(HttpError).and.to.have.property('status', 401);

        done();
      });
    }); // it()

    it('should attach the logged in user to the request', done => {
      testUtils.getApiToken()
        .then(token => {
          var req = { headers: { authorization: `Bearer ${token}` } }, res = {};
          routeUtils.ensureAuthenticated(req, res, err => {
            expect(err).to.not.exist;
            expect(req.authUser).to.be.an.instanceof(User).and.to.have.property('email', testUtils.credentials.email);

            done();
          });
        });
    }); // it()
  }); // describe()

  describe('#ensureSuperAdmin', () => {
    var authUser = null;

    beforeEach(() => {
      return testUtils.saveUser(testUtils.credentials)
        .then(user => authUser = user);
    }); // beforeEach()
    afterEach(testUtils.removeUsers);

    it('should return an error if authorized user is not a superAdmin', done => {
      var req = { authUser }, res = {};
      routeUtils.ensureSuperAdmin(req, res, err => {
        expect(err).to.be.an.instanceof(HttpError).and.to.have.property('status', 403);

        done();
      });
    });

    it('should continue if authorized user is a superAdmin', done => {
      var req = { authUser: _.defaults({ superAdmin: true }, authUser) }, res = {};
      routeUtils.ensureSuperAdmin(req, res, err => {
        expect(err).to.not.exist;

        done();
      });
    });
  }); // describe()

  describe('#ensureSameUser', () => {
    // TODO
  }); // describe()

  describe('#ensureAdminOf', () => {
    // TODO
  }); // describe()

  describe('#filterJsonPatch', () => {
    // TODO
  }); // describe()
}); // describe()
