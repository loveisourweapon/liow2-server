var testUtils = require('../../utils/tests'),
    request = require('supertest-as-promised'),
    expect = require('chai').expect,
    app = require('../../app');

var ObjectId = require('mongoose').Types.ObjectId,
    Like = require('../../models/Like'),
    Deed = require('../../models/Deed');

var validLike = {
  user: ObjectId()
};

describe('/likes', () => {
  before(() => {
    return testUtils.dbConnect()
      .then(() => new Deed({ title: 'Title', content: 'Content' }).save())
      .then(deed => validLike.target = { deed: deed._id });
  }); // before()
  after(() => {
    return Deed.remove({})
      .then(testUtils.dbDisconnect);
  }); // after()
  afterEach(() => Like.remove({}));

  describe('/', () => {
    it('GET should return status 200 and an empty array', () => {
      return request(app)
        .get('/likes')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => expect(res.body).to.be.an('array').and.to.have.lengthOf(0));
    }); // it()

    it('GET should return status 200 and an array', () => {
      return new Like(validLike).save()
        .then(() => request(app)
          .get('/likes')
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(res => expect(res.body).to.be.an('array').and.to.have.lengthOf(1)));
    }); // it()
  }); // describe()

  describe('/:like', () => {
    var likeId = null;

    before(() => testUtils.saveUser(testUtils.credentials));
    beforeEach(() => {
      return testUtils.getApiToken()
        .then(token => request(app)
          .post(`/deeds/${validLike.target.deed}/likes`)
          .set('Authorization', `Bearer ${token}`)
          .send(validLike)
          .then(res => likeId = res.body._id));
    }); // beforeEach()
    after(testUtils.removeUsers);

    it('DELETE invalid ID should return status 400 and an error message', () => {
      return testUtils.getApiToken()
        .then(token => request(app)
          .delete(`/likes/invalid`)
          .set('Authorization', `Bearer ${token}`)
          .expect(400)
          .expect('Content-Type', /json/)
          .expect(res => expect(res.body).to.have.property('message', 'Invalid like')));
    }); // it()

    it('DELETE non-existent ID should return status 404 and an error message', () => {
      return testUtils.getApiToken()
        .then(token => request(app)
          .delete(`/likes/${ObjectId()}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(404)
          .expect('Content-Type', /json/)
          .expect(res => expect(res.body).to.have.property('message', 'Not Found')));
    }); // it()

    it('DELETE valid ID should return status 204 and delete the Like', () => {
      return testUtils.getApiToken()
        .then(token => request(app)
          .delete(`/likes/${likeId}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(204)
          .expect(res => expect(res.body).to.be.empty)
          .then(() => Like.findById(likeId).exec())
          .catch(err => expect(err).to.have.property('message', 'Not Found')));
    }); // it()
  }); // describe()
}); // describe()
