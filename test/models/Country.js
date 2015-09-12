var utils = require('../../utils/tests'),
    expect = require('chai').expect,
    _ = require('lodash');

var Country = require('../../models/Country');

var validCountry = {
  name: 'Australia',
  code: 'AU'
};

describe('Country', () => {
  before(utils.dbConnect);
  after(utils.dbDisconnect);

  describe('#save()', () => {
    afterEach((done) => {
      Country.remove({}, (err) => {
        if (err) { return done(err); }

        done();
      });
    }); // afterEach()

    it('should require name and code', (done) => {
      new Country().save((err, country) => {
        expect(err).to.exist.and.to.have.property('name', 'ValidationError');
        expect(err).to.have.deep.property('errors.name.kind', 'required');
        expect(err).to.have.deep.property('errors.code.kind', 'required');
        expect(country).to.not.exist;

        done();
      });
    }); // it()

    it('should require code to be exactly 2 characters', (done) => {
      new Country(_.defaults({ code: 'toolong' }, validCountry)).save((err, country) => {
        expect(err).to.exist.and.to.have.property('name', 'ValidationError');
        expect(err).to.have.deep.property('errors.code.kind', 'maxlength');
        expect(country).to.not.exist;

        done();
      });
    }); // it()

    it('should uppercase code', (done) => {
      new Country(_.defaults({ code: validCountry.code.toLowerCase() }, validCountry))
        .save((err, country) => {
          expect(err).to.not.exist;
          expect(country).to.have.property('code', validCountry.code.toUpperCase());

          done();
        });
    }); // it()

    it('should save a valid Country', (done) => {
      new Country(validCountry).save((err, country) => {
        expect(err).to.not.exist;
        expect(country).to.be.an('object').and.an.instanceof(Country);

        done();
      });
    }); // it()
  }); // describe()
}); // describe()
