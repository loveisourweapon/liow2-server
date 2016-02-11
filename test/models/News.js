var _ = require('lodash'),
    testUtils = require('../../utils/tests'),
    expect = require('chai').expect;

var ObjectId = require('mongoose').Types.ObjectId,
    News = require('../../models/News');

var validNews = {
  author: ObjectId(),
  title: 'News Title',
  content: 'News content should be a bit longer.'
};

describe('News', () => {
  before(testUtils.dbConnect);
  after(testUtils.dbDisconnect);

  describe('#save()', () => {
    afterEach(() => News.remove({}));

    it('should require author, title, urlTitle and content', () => {
      return new News().save()
        .catch(err => {
          expect(err).to.exist.and.to.have.property('name', 'ValidationError');
          expect(err).to.have.deep.property('errors.author.kind', 'required');
          expect(err).to.have.deep.property('errors.title.kind', 'required');
          expect(err).to.have.deep.property('errors.urlTitle.kind', 'required');
          expect(err).to.have.deep.property('errors.content.kind', 'required');
        });
    }); // it()

    it('should save a valid News item', () => {
      return new News(validNews).save()
        .then(news => expect(news).to.be.an('object').and.an.instanceof(News));
    }); // it()

    it('should create urlTitle as a kebab case copy of title', () => {
      return new News(validNews).save()
        .then(news => expect(news).to.have.property('urlTitle', _.kebabCase(validNews.title)));
    }); // it()
  }); // describe()

  describe('#getFilter()', () => {
    it('should return an array of strings', () => {
      expect(News.getFilter()).to.be.an('array').and.have.length.above(0);
    }); // it()
  }); // describe()
}); // describe()
