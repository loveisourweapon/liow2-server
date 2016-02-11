var testUtils = require('../../utils/tests'),
    routeUtils = require('../../utils/route'),
    expect = require('chai').expect,
    ObjectId = require('mongoose').Types.ObjectId,
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
    beforeEach(() => new Country(validCountry).save().then((country) => countryId = country.id));
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
      var req = {}, res = {}, id = ObjectId().toString();
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
}); // describe()
