var defaults = require('lodash/defaults'),
    testUtils = require('../../utils/tests'),
    expect = require('chai').expect,
    Country = require('../../models/Country');

var validCountry = {
  name: 'Australia',
  code: 'AU'
};

describe('Country', () => {
  before(testUtils.dbConnect);
  after(testUtils.dbDisconnect);

  describe('#save()', () => {
    afterEach(() => Country.remove({}));

    it('should require name and code', () => {
      return new Country().save()
        .catch(err => {
          expect(err).to.exist.and.to.have.property('name', 'ValidationError');
          expect(err).to.have.deep.property('errors.name.kind', 'required');
          expect(err).to.have.deep.property('errors.code.kind', 'required');
        });
    }); // it()

    it('should require code to be exactly 2 characters', () => {
      return new Country(defaults({ code: 'toolong' }, validCountry)).save()
        .catch(err => {
          expect(err).to.exist.and.to.have.property('name', 'ValidationError');
          expect(err).to.have.deep.property('errors.code.kind', 'maxlength');
        });
    }); // it()

    it('should save a valid Country', () => {
      return new Country(validCountry).save()
        .then(country => expect(country).to.be.an('object').and.an.instanceof(Country));
    }); // it()

    it('should uppercase code', () => {
      return new Country(defaults({ code: validCountry.code.toLowerCase() }, validCountry)).save()
        .then(country => expect(country).to.have.property('code', validCountry.code.toUpperCase()));
    }); // it()
  }); // describe()

  describe('#getSearchable()', () => {
    it('should return an array of strings', () => {
      expect(Country.getSearchable()).to.be.an('array').and.have.length.above(0);
    }); // it()
  }); // describe()
}); // describe()
