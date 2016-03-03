var testUtils = require('../../utils/tests'),
    request = require('supertest-as-promised'),
    expect = require('chai').expect,
    app = require('../../app');

var Group = require('../../models/Group'),
    Deed = require('../../models/Deed'),
    FeedItem = require('../../models/FeedItem');

describe('/feeds', () => {
  before(() => {
    return testUtils.dbConnect()
      .then(() => FeedItem.remove({})); // FeedItems left over from other tests
  });
  after(testUtils.dbDisconnect);

  describe('/', () => {
    var user = null;
    var group = null;
    var deed = null;
    var feedItem1 = null;
    var feedItem2 = null;

    beforeEach(() => {
      return testUtils.saveUser(testUtils.credentials)
        .then(newUser => (user = newUser))
        .then(() => new Group({ name: 'Group', owner: user, admins: [user] }).save())
        .then(newGroup => (group = newGroup))
        .then(() => new Deed({ title: 'Deed', content: 'content' }).save())
        .then(newDeed => (deed = newDeed))
        .then(() => new FeedItem({ user, target: { group: group._id } }).save())
        .then(newFeedItem => (feedItem1 = newFeedItem))
        .then(() => new FeedItem({ user, target: { deed: deed._id } }).save())
        .then(newFeedItem => (feedItem2 = newFeedItem));
    }); // beforeEach()
    afterEach(() => {
      return FeedItem.remove({})
        .then(() => Deed.remove({}))
        .then(() => Group.remove({}))
        .then(testUtils.removeUsers);
    }); // afterEach()

    it('should return all feed items with no query params', () => {
      return request(app)
        .get('/feeds')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => expect(res.body).to.be.an('array').and.to.have.lengthOf(2));
    }); // it()

    it('should return only feed items that match query params', () => {
      return request(app)
        .get(`/feeds?target.deed=${deed.id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
          expect(res.body).to.be.an('array').and.to.have.lengthOf(1);
          expect(res.body).to.have.deep.property('[0]._id', String(feedItem2._id));
        });
    }); // it()

    it('should combine query params into $or array', () => {
      return request(app)
        .get(`/feeds?target.deed=${deed.id}&target.group=${group.id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
          expect(res.body).to.be.an('array').and.to.have.lengthOf(2);
        });
    }); // it()

    it('should populate user and target.group', () => {
      return request(app)
        .get(`/feeds?target.group=${group.id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
          expect(res.body).to.be.an('array').and.to.have.lengthOf(1);
          expect(res.body).to.have.deep.property('[0]._id', String(feedItem1._id));
          expect(res.body).to.have.deep.property('[0].user.firstName', testUtils.credentials.firstName);
          expect(res.body).to.have.deep.property('[0].target.group.name', group.name);
        });
    }); // it()
  }); // describe()
}); // describe()
