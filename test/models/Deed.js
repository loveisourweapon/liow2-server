var _ = require('lodash'),
    testUtils = require('../../utils/tests'),
    expect = require('chai').expect,
    Deed = require('../../models/Deed');

var validDeed = {
  title: 'Deed Title',
  content: 'Deed content should be a bit longer.'
};

describe('Deed', () => {
  before(testUtils.dbConnect);
  after(testUtils.dbDisconnect);

  describe('#save()', () => {
    afterEach(() => Deed.remove({}));

    it('should require title, urlTitle and content', () => {
      return new Deed().save()
        .catch(err => {
          expect(err).to.exist.and.to.have.property('name', 'ValidationError');
          expect(err).to.have.deep.property('errors.title.kind', 'required');
          expect(err).to.have.deep.property('errors.urlTitle.kind', 'required');
          expect(err).to.have.deep.property('errors.content.kind', 'required');
        });
    }); // it()

    it('should save a valid Deed', () => {
      return new Deed(validDeed).save()
        .then(deed => expect(deed).to.be.an('object').and.an.instanceof(Deed));
    }); // it()

    it('should create urlTitle as a kebab case copy of title', () => {
      return new Deed(validDeed).save()
        .then(deed => expect(deed).to.have.property('urlTitle', _.kebabCase(validDeed.title)));
    }); // it()
  }); // describe()

  describe('#getFilter()', () => {
    it('should return an array of strings', () => {
      expect(Deed.getFilter()).to.be.an('array').and.have.length.above(0);
    }); // it()
  }); // describe()
}); // describe()
