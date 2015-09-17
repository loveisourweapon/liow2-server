var utils = require('../../utils/tests'),
    route = require('../../utils/route'),
    expect = require('chai').expect,
    ObjectId = require('mongoose').Types.ObjectId,
    Country = require('../../models/Country');

var countryId = null;
var validCountry = {
  name: 'Australia',
  code: 'AU'
};

describe('utils/routes', () => {
  before(utils.dbConnect);
  after(utils.dbDisconnect);

  describe('#paramHandler()', () => {
    beforeEach((done) => {
      new Country(validCountry).save((err, country) => {
        if (err) { return done(err); }

        countryId = country.id;
        done();
      });
    }); // beforeEach()

    afterEach((done) => {
      Country.remove({}, (err) => {
        if (err) { return done(err); }

        done();
      });
    }); // afterEach()

    it('should return an error when not called with a mongoose Model', (done) => {
      var req = {}, res = {};
      route.paramHandler(req, res, (err) => {
        expect(err).to.be.an.instanceof(Error);
        expect(err.message).to.match(/mongoose\smodel/);

        done();
      }, countryId, 'country');
    }); // it()

    it('should return an error when called with an invalid ID', (done) => {
      var req = {}, res = {};
      route.paramHandler(req, res, (err) => {
        expect(err).to.be.an.instanceof(Error).and.to.have.property('message', 'Invalid country');

        done();
      }, 'invalid', 'country', Country);
    }); // it()

    it('should return an error when called with a non-existent ID', (done) => {
      var req = {}, res = {}, id = ObjectId().toString();
      route.paramHandler(req, res, (err) => {
        expect(err).to.be.an.instanceof(Error).and.have.property('message', 'Country ' + id + ' not found');

        done();
      }, id, 'country', Country);
    }); // it()

    it('should attach a document when given a valid ID and called with a Model', (done) => {
      var req = {}, res = {};
      route.paramHandler(req, res, (err) => {
        expect(err).to.not.exist;
        expect(req.country).to.be.an.instanceof(Country).and.to.have.property('id', countryId);

        done();
      }, countryId, 'country', Country);
    }); // it()
  }); // describe()
}); // describe()
