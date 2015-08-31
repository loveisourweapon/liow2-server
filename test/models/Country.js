var utils = require('../../utils/tests'),
    expect = require('chai').expect,
    Country = require('../../models/Country');

var validCountry = {
  name: 'Australia',
  code: 'AU'
};

describe('Country', function __describe() {
  before(utils.dbConnect);
  after(utils.dbDisconnect);

  describe('#save()', function __describe() {
    afterEach(function __afterEach(done) {
      Country.remove({}, function __countryRemove(err) {
        if (err) { return done(err); }

        done();
      });
    }); // afterEach()

    it('should require name and code', function __it(done) {
      var country = new Country();

      country.save(function __countrySave(err, country) {
        expect(err).to.exist.and.to.have.property('name', 'ValidationError');
        expect(err).to.have.deep.property('errors.name.kind', 'required');
        expect(err).to.have.deep.property('errors.code.kind', 'required');
        expect(country).to.not.exist;

        done();
      });
    }); // it()

    it('should require code to be exactly 2 characters', function __it(done) {
      var country = new Country(validCountry);
      country.code = 'toolong';

      country.save(function __countrySave(err, country) {
        expect(err).to.exist.and.to.have.property('name', 'ValidationError');
        expect(err).to.have.deep.property('errors.code.kind', 'maxlength');
        expect(country).to.not.exist;

        done();
      });
    }); // it()

    it('should uppercase code', function __it(done) {
      var country = new Country(validCountry);
      country.code = validCountry.code.toLowerCase();

      country.save(function __countrySave(err, country) {
        expect(err).to.not.exist;
        expect(country).to.have.property('code', validCountry.code.toUpperCase());

        done();
      });
    }); // it()

    it('should save a valid Country', function __it(done) {
      var country = new Country(validCountry);

      country.save(function __countrySave(err, country) {
        expect(err).to.not.exist;
        expect(country).to.be.an('object').and.an.instanceof(Country);

        done();
      });
    }); // it()
  }); // describe()
}); // describe()
