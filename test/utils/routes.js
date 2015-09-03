var testUtils = require('../../utils/tests'),
    routeUtils = require('../../utils/routes'),
    expect = require('chai').expect,
    ObjectId = require('mongoose').Types.ObjectId,
    Country = require('../../models/Country');

var countryId = null;
var validCountry = {
  name: 'Australia',
  code: 'AU'
};

describe('utils/routes', function __describe() {
  before(testUtils.dbConnect);
  after(testUtils.dbDisconnect);

  describe('#paramHandler()', function __describe() {
    beforeEach(function __beforeEach(done) {
      new Country(validCountry).save(function __countrySave(err, country) {
        if (err) { return done(err); }

        countryId = country.id;
        done();
      });
    }); // beforeEach()

    afterEach(function __afterEach(done) {
      Country.remove({}, function __countryRemove(err) {
        if (err) { return done(err); }

        done();
      });
    }); // afterEach()

    it('should return an error when not bound to a mongoose Model', function __it(done) {
      var req = {}, res = {};
      routeUtils.paramHandler(req, res, function __next(err) {
        expect(err).to.be.an.instanceof(Error);
        expect(err.message).to.match(/mongoose\smodel/);

        done();
      }, countryId, 'country');
    }); // it()

    it('should return an error when called with an invalid ID', function __it(done) {
      var req = {}, res = {};
      routeUtils.paramHandler.call(Country, req, res, function __next(err) {
        expect(err).to.be.an.instanceof(Error).and.to.have.property('message', 'Invalid country');

        done();
      }, 'invalid', 'country');
    }); // it()

    it('should return an error when called with a non-existent ID', function __it(done) {
      var req = {}, res = {}, id = ObjectId().toString();
      routeUtils.paramHandler.call(Country, req, res, function __next(err) {
        expect(err).to.be.an.instanceof(Error).and.have.property('message', 'Country ' + id + ' not found');

        done();
      }, id, 'country');
    }); // it()

    it('should attach a document when given a valid ID and bound to a Model', function __it(done) {
      var req = {}, res = {};
      routeUtils.paramHandler.call(Country, req, res, function __next(err) {
        expect(err).to.not.exist;
        expect(req.country).to.be.an.instanceof(Country).and.to.have.property('id', countryId);

        done();
      }, countryId, 'country');
    }); // it()
  }); // describe()
}); // describe()
