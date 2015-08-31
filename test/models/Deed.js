var utils = require('../../utils/tests'),
    expect = require('chai').expect,
    _ = require('lodash'),
    Deed = require('../../models/Deed');

var validDeed = {
  title: 'Deed Title',
  content: 'Deed content should be a bit longer.'
};

describe('Deed', function __describe() {
  before(utils.dbConnect);
  after(utils.dbDisconnect);

  describe('#save()', function __describe() {
    afterEach(function __afterEach(done) {
      Deed.remove({}, function __deedRemove(err) {
        if (err) { return done(err); }

        done();
      });
    }); // afterEach()

    it('should require title, url_title and content', function __it(done) {
      var deed = new Deed();

      deed.save(function __deedSave(err, deed) {
        expect(err).to.exist.and.to.have.property('name', 'ValidationError');
        expect(err).to.have.deep.property('errors.title.kind', 'required');
        expect(err).to.have.deep.property('errors.url_title.kind', 'required');
        expect(err).to.have.deep.property('errors.content.kind', 'required');
        expect(deed).to.not.exist;

        done();
      });
    }); // it()

    it('should create url_title as a kebab case copy of title', function __it(done) {
      var deed = new Deed(validDeed);

      deed.save(function __deedSave(err, deed) {
        expect(err).to.not.exist;
        expect(deed).to.have.property('url_title', _.kebabCase(validDeed.title));

        done();
      });
    }); // it()

    it('should save a valid Deed', function __it(done) {
      var deed = new Deed(validDeed);

      deed.save(function __deedSave(err, deed) {
        expect(err).to.not.exist;
        expect(deed).to.be.an('object').and.an.instanceof(Deed);

        done();
      });
    }); // it()
  }); // describe()

  describe('#getFilter()', function __describe() {
    it('should return an array of strings', function __it(done) {
      var filter = Deed.getFilter();

      expect(filter).to.be.an('array').and.have.length.above(0);

      done();
    }); // it()
  }); // describe()
}); // describe()
