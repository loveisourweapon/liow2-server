var testUtils = require('../../utils/tests'),
    request = require('supertest-as-promised'),
    expect = require('chai').expect,
    app = require('../../app');

var ObjectId = require('mongoose').Types.ObjectId,
    Comment = require('../../models/Comment'),
    Deed = require('../../models/Deed');

var validComment = {
  user: ObjectId(),
  content: { text: 'Comment text' }
};

describe('/comments', () => {
  before(() => {
    return testUtils.dbConnect()
      .then(() => new Deed({ title: 'Title', content: 'Content' }).save())
      .then(deed => (validComment.target = { deed: deed._id }));
  }); // before()
  after(() => {
    return Deed.remove({})
      .then(testUtils.dbDisconnect);
  }); // after()
  afterEach(() => Comment.remove({}));

  describe('/', () => {
    it('GET should return status 200 and an empty array', () => {
      return request(app)
        .get('/comments')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => expect(res.body).to.be.an('array').and.to.have.lengthOf(0));
    }); // it()

    it('GET should return status 200 and an array', () => {
      return new Comment(validComment).save()
        .then(() => request(app)
          .get('/comments')
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(res => expect(res.body).to.be.an('array').and.to.have.lengthOf(1)));
    }); // it()
  }); // describe()

  describe('/:comment', () => {
    var commentId = null;

    before(() => testUtils.saveUser(testUtils.credentials));
    beforeEach(() => {
      return testUtils.getApiToken()
        .then(token => request(app)
          .post(`/deeds/${validComment.target.deed}/comments`)
          .set('Authorization', `Bearer ${token}`)
          .send(validComment)
          .then(res => (commentId = res.body._id)));
    }); // beforeEach()
    after(testUtils.removeUsers);

    it('DELETE invalid ID should return status 400 and an error message', () => {
      return testUtils.getApiToken()
        .then(token => request(app)
          .delete(`/comments/invalid`)
          .set('Authorization', `Bearer ${token}`)
          .expect(400)
          .expect('Content-Type', /json/)
          .expect(res => expect(res.body).to.have.property('message', 'Invalid comment')));
    }); // it()

    it('DELETE non-existent ID should return status 404 and an error message', () => {
      return testUtils.getApiToken()
        .then(token => request(app)
          .delete(`/comments/${ObjectId()}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(404)
          .expect('Content-Type', /json/)
          .expect(res => expect(res.body).to.have.property('message', 'Not Found')));
    }); // it()

    it('DELETE valid ID should return status 204 and delete the Comment', () => {
      return testUtils.getApiToken()
        .then(token => request(app)
          .delete(`/comments/${commentId}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(204)
          .expect(res => expect(res.body).to.be.empty)
          .then(() => Comment.findById(commentId).exec())
          .catch(err => expect(err).to.have.property('message', 'Not Found')));
    }); // it()

    it('PUT extra data should be ignored', () => {
      return testUtils.getApiToken()
        .then(token => request(app)
          .put(`/comments/${commentId}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ extra: 'Extra data' })
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(res => {
            expect(res.body).to.have.property('_id', String(commentId));
            expect(res.body).to.not.have.property('extra');
          }));
    }); // it()

    it('PUT valid data should return status 200 and update the Comment', () => {
      var update = { content: { text: 'Updated text' } };

      return testUtils.getApiToken()
        .then(token => request(app)
          .put(`/comments/${commentId}`)
          .set('Authorization', `Bearer ${token}`)
          .send(update)
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(res => {
            expect(res.body).to.have.property('_id', String(commentId));
            expect(res.body).to.have.property('modified');
            expect(res.body).to.have.deep.property('content.text', update.content.text);
          }));
    }); // it()
  }); // describe()
}); // describe()
