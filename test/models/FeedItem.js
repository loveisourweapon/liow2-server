var testUtils = require('../../utils/tests'),
    expect = require('chai').expect;

var ObjectId = require('mongoose').Types.ObjectId,
    FeedItem = require('../../models/FeedItem');

describe('FeedItem', () => {
  var validFeedItem = {
    user: ObjectId(),
    act: ObjectId()
  };

  before(testUtils.dbConnect);
  after(testUtils.dbDisconnect);
  afterEach(() => FeedItem.remove({}));

  describe('#save()', () => {
    it('should require a user', () => {
      return new FeedItem().save()
        .catch(err => {
          expect(err).to.exist.and.to.have.property('name', 'ValidationError');
          expect(err).to.have.deep.property('errors.user.kind', 'required');
        });
    }); // it()
  }); // describe()

  describe('#findOrCreate()', () => {
    it('should return an existing FeedItem', () => {
      var feedItem = null;

      return new FeedItem(validFeedItem).save()
        .then(newFeedItem => (feedItem = newFeedItem))
        .then(() => FeedItem.findOrCreate(validFeedItem))
        .then(foundFeedItem => {
          expect(foundFeedItem).to.be.an.instanceof(FeedItem);
          expect(foundFeedItem.id).to.equal(feedItem.id);
        });
    }); // it()

    it('should create a new FeedItem', () => {
      return FeedItem.findOne(validFeedItem).exec()
        .then(foundFeedItme => expect(foundFeedItme).to.not.exist)
        .then(() => FeedItem.findOrCreate(validFeedItem))
        .then(feedItem => {
          expect(feedItem).to.be.an.instanceof(FeedItem);
          expect(feedItem.act).to.equal(validFeedItem.act);
        });
    }); // it()
  }); // describe()
}); // describe()
