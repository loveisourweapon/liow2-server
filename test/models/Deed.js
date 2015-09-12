var utils = require('../../utils/tests'),
    expect = require('chai').expect,
    _ = require('lodash'),
    Deed = require('../../models/Deed');

var validDeed = {
  title: 'Deed Title',
  content: 'Deed content should be a bit longer.'
};

describe('Deed', () => {
  before(utils.dbConnect);
  after(utils.dbDisconnect);

  describe('#save()', () => {
    afterEach((done) => {
      Deed.remove({}, (err) => {
        if (err) { return done(err); }

        done();
      });
    }); // afterEach()

    it('should require title, url_title and content', (done) => {
      new Deed().save((err, deed) => {
        expect(err).to.exist.and.to.have.property('name', 'ValidationError');
        expect(err).to.have.deep.property('errors.title.kind', 'required');
        expect(err).to.have.deep.property('errors.url_title.kind', 'required');
        expect(err).to.have.deep.property('errors.content.kind', 'required');
        expect(deed).to.not.exist;

        done();
      });
    }); // it()

    it('should create url_title as a kebab case copy of title', (done) => {
      new Deed(validDeed).save((err, deed) => {
        expect(err).to.not.exist;
        expect(deed).to.have.property('url_title', _.kebabCase(validDeed.title));

        done();
      });
    }); // it()

    it('should save a valid Deed', (done) => {
      new Deed(validDeed).save((err, deed) => {
        expect(err).to.not.exist;
        expect(deed).to.be.an('object').and.an.instanceof(Deed);

        done();
      });
    }); // it()
  }); // describe()

  describe('#getFilter()', () => {
    it('should return an array of strings', () => {
      expect(Deed.getFilter()).to.be.an('array').and.have.length.above(0);
    }); // it()
  }); // describe()
}); // describe()
