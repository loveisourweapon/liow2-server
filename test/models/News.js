var utils = require('../../utils/tests'),
    expect = require('chai').expect,
    _ = require('lodash');

var ObjectId = require('mongoose').Types.ObjectId,
    News = require('../../models/News');

var validNews = {
  author: ObjectId(),
  title: 'News Title',
  content: 'News content should be a bit longer.'
};

describe('News', function __describe() {
  before(utils.dbConnect);
  after(utils.dbDisconnect);

  describe('#save()', function __describe() {
    afterEach(function __afterEach(done) {
      News.remove({}, function __newsRemove(err) {
        if (err) { return done(err); }

        done();
      });
    }); // afterEach()

    it('should require author, title, url_title and content', function __it(done) {
      new News().save(function __newsSave(err, news) {
        expect(err).to.exist.and.to.have.property('name', 'ValidationError');
        expect(err).to.have.deep.property('errors.author.kind', 'required');
        expect(err).to.have.deep.property('errors.title.kind', 'required');
        expect(err).to.have.deep.property('errors.url_title.kind', 'required');
        expect(err).to.have.deep.property('errors.content.kind', 'required');
        expect(news).to.not.exist;

        done();
      });
    }); // it()

    it('should create url_title as a kebab case copy of title', function __it(done) {
      new News(validNews).save(function __newsSave(err, news) {
        expect(err).to.not.exist;
        expect(news).to.have.property('url_title', _.kebabCase(validNews.title));

        done();
      });
    }); // it()

    it('should save a valid News item', function __it(done) {
      new News(validNews).save(function __newsSave(err, news) {
        expect(err).to.not.exist;
        expect(news).to.be.an('object').and.an.instanceof(News);

        done();
      });
    }); // it()
  }); // describe()

  describe('#getFilter()', function __describe() {
    it('should return an array of strings', function __it() {
      expect(News.getFilter()).to.be.an('array').and.have.length.above(0);
    }); // it()
  }); // describe()
}); // describe()
