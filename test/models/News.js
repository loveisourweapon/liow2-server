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

describe('News', () => {
  before(utils.dbConnect);
  after(utils.dbDisconnect);

  describe('#save()', () => {
    afterEach((done) => {
      News.remove({}, (err) => {
        if (err) { return done(err); }

        done();
      });
    }); // afterEach()

    it('should require author, title, urlTitle and content', (done) => {
      new News().save((err, news) => {
        expect(err).to.exist.and.to.have.property('name', 'ValidationError');
        expect(err).to.have.deep.property('errors.author.kind', 'required');
        expect(err).to.have.deep.property('errors.title.kind', 'required');
        expect(err).to.have.deep.property('errors.urlTitle.kind', 'required');
        expect(err).to.have.deep.property('errors.content.kind', 'required');
        expect(news).to.not.exist;

        done();
      });
    }); // it()

    it('should create urlTitle as a kebab case copy of title', (done) => {
      new News(validNews).save((err, news) => {
        expect(err).to.not.exist;
        expect(news).to.have.property('urlTitle', _.kebabCase(validNews.title));

        done();
      });
    }); // it()

    it('should save a valid News item', (done) => {
      new News(validNews).save((err, news) => {
        expect(err).to.not.exist;
        expect(news).to.be.an('object').and.an.instanceof(News);

        done();
      });
    }); // it()
  }); // describe()

  describe('#getFilter()', () => {
    it('should return an array of strings', () => {
      expect(News.getFilter()).to.be.an('array').and.have.length.above(0);
    }); // it()
  }); // describe()
}); // describe()
