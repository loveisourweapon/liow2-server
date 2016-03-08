var modelUtils = require('../../utils/models'),
    testUtils = require('../../utils/tests'),
    HttpError = require('../../utils/general').HttpError;

var ObjectId = require('mongoose').Types.ObjectId,
    Country = require('../../models/Country'),
    Act = require('../../models/Act'),
    FeedItem = require('../../models/FeedItem');

var chai = require('chai'),
    expect = chai.expect;
chai.use(require('chai-as-promised'));

describe('utils/models', () => {
  describe('#oneOf()', () => {
    it('should return an error when the first parameter isn\'t an Object', () => {
      var result = modelUtils.oneOf(null, ['one', 'two']);

      expect(result).to.be.an.instanceof(Error).and.to.have.property('message', 'Object should be type Object');
    }); // it()

    it('should return an error when the second parameter isn\'t an Array', () => {
      var result = modelUtils.oneOf({ one: 'first' }, 'one');

      expect(result).to.be.an.instanceof(Error).and.to.have.property('message', 'Properties should be an Array of Strings');
    }); // it()

    it('should return false when the object contains none of the properties', () => {
      var result = modelUtils.oneOf({
        three: 'third'
      }, ['one', 'two']);

      expect(result).to.be.a('boolean').and.to.equal(false);
    }); // it()

    it('should return false when the object contains more than one of the properties', () => {
      var result = modelUtils.oneOf({
        one: 'first',
        two: 'second'
      }, ['one', 'two', 'three']);

      expect(result).to.be.a('boolean').and.to.equal(false);
    }); // it()

    it('should return true when the object contains exactly one of the properties', () => {
      var result = modelUtils.oneOf({
        two: 'second'
      }, ['one', 'two', 'three']);

      expect(result).to.be.a('boolean').and.to.equal(true);
    }); // it()
  }); // describe()

  describe('#hasOne()', () => {
    it('should return an error when not passed an array', () => {
      var result = modelUtils.hasOne('string');

      expect(result).to.be.an.instanceOf(Error).and.to.have.property('message', 'Property should be an Array');
    }); // it()

    it('should return false when passed an empty array', () => {
      var result = modelUtils.hasOne([]);

      expect(result).to.be.a('boolean').and.to.equal(false);
    }); // it()

    it('should return true when passed an array with at least one item', () => {
      var result = modelUtils.hasOne([1]);

      expect(result).to.be.a('boolean').and.to.equal(true);
    }); // it()
  }); // describe()

  describe('#findOneOrThrow()', () => {
    var validCountry = {
      name: 'Australia',
      code: 'AU'
    };

    before(testUtils.dbConnect);
    beforeEach(() => new Country(validCountry).save());
    after(testUtils.dbDisconnect);
    afterEach(() => Country.remove({}));

    it('should throw an HttpError when document not found', () => {
      var result = Country.findOne({ name: 'invalid' }).exec();

      return expect(result).to.be.rejectedWith(HttpError);
    }); // it()

    it('should return a document when found', () => {
      var result = Country.findOne({ name: validCountry.name }).exec();

      return expect(result).to.eventually.have.property('code', validCountry.code);
    }); // it()
  }); // describe()

  describe('#addFeedItem()', () => {
    var validAct = {
      user: ObjectId(),
      deed: ObjectId()
    };

    before(testUtils.dbConnect);
    after(testUtils.dbDisconnect);
    afterEach(() => FeedItem.remove({}).then(() => Act.remove({})));

    it('should create a linked FeedItem when document saved', () => {
      var act = null;

      return new Act(validAct).save()
        .then(newAct => (act = newAct))
        .then(() => new Promise((resolve, reject) => setTimeout(resolve, 100))) // Wait for FeedItem to be saved
        .then(() => FeedItem.findOne({ act: act._id }))
        .then(foundFeedItem => {
          expect(foundFeedItem).to.exist.and.to.have.property('user');
          expect(String(foundFeedItem.user)).to.equal(String(validAct.user));
        });
    }); // it()

    it('should remove a linked FeedItem when document removed', () => {
      var act = null;

      return new Act(validAct).save()
        .then(newAct => (act = newAct))
        .then(() => new Promise((resolve, reject) => setTimeout(resolve, 100))) // Wait for FeedItem to be saved
        .then(() => act.remove())
        .then(() => new Promise((resolve, reject) => setTimeout(resolve, 100))) // Wait for FeedItem to be removed
        .then(() => FeedItem.findOne({ act: act._id }))
        .then(feedItem => expect(feedItem).to.not.exist);
    }); // it()
  }); // describe()
}); // describe()
