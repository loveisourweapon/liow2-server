var _ = require('lodash'),
    testUtils = require('../../utils/tests'),
    request = require('supertest-as-promised'),
    expect = require('chai').expect,
    app = require('../../app');

var ObjectId = require('mongoose').Types.ObjectId,
    Deed = require('../../models/Deed'),
    Like = require('../../models/Like'),
    Comment = require('../../models/Comment');

var validDeed = {
  title: 'Deed title',
  content: 'Deed content'
};

describe('/deeds', () => {
  before(() => {
    return testUtils.dbConnect()
      .then(() => testUtils.saveUser(_.merge({ superAdmin: true }, testUtils.credentials)));
  }); // before()
  after(() => {
    return testUtils.removeUsers()
      .then(testUtils.dbDisconnect);
  }); // after()
  afterEach(() => Deed.remove({}));

  describe('/', () => {
    it('GET should return status 200 and an empty array', () => {
      return request(app)
        .get('/deeds')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => expect(res.body).to.be.an('array').and.to.have.lengthOf(0));
    }); // it()

    it('GET should return status 200 and a non-empty array', () => {
      return new Deed(validDeed).save()
        .then(() => request(app)
          .get('/deeds')
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(res => expect(res.body).to.be.an('array').and.to.have.lengthOf(1)));
    }); // it()

    it('POST invalid data should return status 400 and an error message', () => {
      return testUtils.getApiToken()
        .then(token => request(app)
          .post('/deeds')
          .set('Authorization', `Bearer ${token}`)
          .send({})
          .expect(400)
          .expect('Content-Type', /json/)
          .expect(res => expect(res.body).property('message', 'Deed validation failed')));
    }); // it()

    it('POST valid data should return status 201 and the created Deed', () => {
      return testUtils.getApiToken()
        .then(token => request(app)
          .post('/deeds')
          .set('Authorization', `Bearer ${token}`)
          .send(validDeed)
          .expect(201)
          .expect('Content-Type', /json/)
          .expect('Location', /deeds/)
          .expect(res => expect(res.body).be.be.an('object').and.to.have.property('_id')));
    }); // it()
  }); // describe()

  describe('/:deed', () => {
    var deedId = null;

    beforeEach(() => {
      return new Deed(validDeed).save()
        .then(deed => deedId = deed._id);
    }); // beforeEach()

    it('GET invalid ID should return status 400 and an error message', () => {
      return request(app)
        .get('/deeds/invalid')
        .expect(400)
        .expect('Content-Type', /json/)
        .expect(res => expect(res.body).to.have.property('message', 'Invalid deed'));
    }); // it()

    it('GET non-existent ID should return status 404 and an error message', () => {
      return request(app)
        .get(`/deeds/${ObjectId()}`)
        .expect(404)
        .expect('Content-Type', /json/)
        .expect(res => expect(res.body).to.have.property('message', 'Not Found'));
    }); // it()

    it('GET valid ID should return status 200 and the Deed', () => {
      return request(app)
        .get(`/deeds/${deedId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => expect(res.body).to.have.property('_id', String(deedId)));
    }); // it()

    it('PUT extra data should be ignored', () => {
      return testUtils.getApiToken()
        .then(token => request(app)
          .put(`/deeds/${deedId}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ extra: 'Extra data' })
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(res => {
            expect(res.body).to.have.property('_id', String(deedId));
            expect(res.body).to.not.have.property('extra');
          }));
    }); // it()

    it('PUT valid data should return status 200 and update the Deed', () => {
      var update = { content: 'Updated content' };

      return testUtils.getApiToken()
        .then(token => request(app)
          .put(`/deeds/${deedId}`)
          .set('Authorization', `Bearer ${token}`)
          .send(update)
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(res => {
            expect(res.body).to.have.property('_id', String(deedId));
            expect(res.body).to.have.property('modified');
            expect(res.body).to.have.property('content', update.content);
          }));
    }); // it()

    it('DELETE should return status 204 and delete the Deed', () => {
      return testUtils.getApiToken()
        .then(token => request(app)
          .delete(`/deeds/${deedId}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(204)
          .expect(res => expect(res.body).to.be.empty)
          .then(() => Deed.findById(deedId).exec())
          .catch(err => expect(err).to.have.property('message', 'Not Found')));
    }); // it()

    describe('/likes', () => {
      var likeId = null;
      var validLike = {};

      beforeEach(() => {
        validLike.target = { deed: deedId };

        return testUtils.getApiToken()
          .then(token => request(app)
            .post(`/deeds/${deedId}/likes`)
            .set('Authorization', `Bearer ${token}`)
            .send(validLike)
            .then(res => likeId = res.body._id));
      }); // beforeEach()
      afterEach(() => Like.remove({}));

      it('GET should return status 200 and a non-empty array', () => {
        return request(app)
          .get(`/deeds/${deedId}/likes`)
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(res => expect(res.body).to.be.an('array').and.to.have.lengthOf(1));
      }); // it()

      it('POST valid data should return status 201 and the created Like', () => {
        return testUtils.getApiToken()
          .then(token => request(app)
            .post(`/deeds/${deedId}/likes`)
            .set('Authorization', `Bearer ${token}`)
            .send(validLike)
            .expect(201)
            .expect('Content-Type', /json/)
            .expect('Location', /likes/)
            .expect(res => {
              expect(res.body).be.be.an('object').and.to.have.property('_id');
              expect(res.body).to.have.deep.property('target.deed', String(deedId));
            }));
      }); // it()

      describe('/:like', () => {
        it('DELETE invalid ID should return status 400 and an error message', () => {
          return testUtils.getApiToken()
            .then(token => request(app)
              .delete(`/deeds/${deedId}/likes/invalid`)
              .set('Authorization', `Bearer ${token}`)
              .expect(400)
              .expect('Content-Type', /json/)
              .expect(res => expect(res.body).to.have.property('message', 'Invalid like')));
        }); // it()

        it('DELETE non-existent ID should return status 404 and an error message', () => {
          return testUtils.getApiToken()
            .then(token => request(app)
              .delete(`/deeds/${deedId}/likes/${ObjectId()}`)
              .set('Authorization', `Bearer ${token}`)
              .expect(404)
              .expect('Content-Type', /json/)
              .expect(res => expect(res.body).to.have.property('message', 'Not Found')));
        }); // it()

        it('DELETE valid ID should return status 204 and delete the Like', () => {
          return testUtils.getApiToken()
            .then(token => request(app)
              .delete(`/deeds/${deedId}/likes/${likeId}`)
              .set('Authorization', `Bearer ${token}`)
              .expect(204)
              .expect(res => expect(res.body).to.be.empty)
              .then(() => Like.findById(likeId).exec())
              .catch(err => expect(err).to.have.property('message', 'Not Found')));
        }); // it()
      }); // describe()
    }); // describe()

    describe('/comments', () => {
      var commentId = null;
      var validComment = {
        content: { text: 'Comment text' }
      };

      beforeEach(() => {
        validComment.target = { deed: deedId };

        return testUtils.getApiToken()
          .then(token => request(app)
            .post(`/deeds/${deedId}/comments`)
            .set('Authorization', `Bearer ${token}`)
            .send(validComment)
            .then(res => commentId = res.body._id));
      }); // beforeEach()
      afterEach(() => Comment.remove({}));

      it('GET should return status 200 and an array', () => {
        return request(app)
          .get(`/deeds/${deedId}/comments`)
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(res => expect(res.body).to.be.an('array').and.to.have.lengthOf(1));
      }); // it()

      it('POST invalid data should return status 400 and an error message', () => {
        return testUtils.getApiToken()
          .then(token => request(app)
            .post(`/deeds/${deedId}/comments`)
            .set('Authorization', `Bearer ${token}`)
            .send({})
            .expect(400)
            .expect('Content-Type', /json/)
            .expect(res => expect(res.body).to.have.property('message', 'Comment validation failed')));
      }); // it()

      it('POST valid data should return status 201 and the created Comment', () => {
        return testUtils.getApiToken()
          .then(token => request(app)
            .post(`/deeds/${deedId}/comments`)
            .set('Authorization', `Bearer ${token}`)
            .send(validComment)
            .expect(201)
            .expect('Content-Type', /json/)
            .expect('Location', /comments/)
            .expect(res => {
              expect(res.body).be.be.an('object').and.to.have.property('_id');
              expect(res.body).to.have.deep.property('target.deed', String(deedId));
            }));
      }); // it()

      describe('/:comment', () => {
        it('DELETE invalid ID should return status 400 and an error message', () => {
          return testUtils.getApiToken()
            .then(token => request(app)
              .delete(`/deeds/${deedId}/comments/invalid`)
              .set('Authorization', `Bearer ${token}`)
              .expect(400)
              .expect('Content-Type', /json/)
              .expect(res => expect(res.body).to.have.property('message', 'Invalid comment')));
        }); // it()

        it('DELETE non-existent ID should return status 404 and an error message', () => {
          return testUtils.getApiToken()
            .then(token => request(app)
              .delete(`/deeds/${deedId}/comments/${ObjectId()}`)
              .set('Authorization', `Bearer ${token}`)
              .expect(404)
              .expect('Content-Type', /json/)
              .expect(res => expect(res.body).to.have.property('message', 'Not Found')));
        }); // it()

        it('DELETE valid ID should return status 204 and delete the Comment', () => {
          return testUtils.getApiToken()
            .then(token => request(app)
              .delete(`/deeds/${deedId}/comments/${commentId}`)
              .set('Authorization', `Bearer ${token}`)
              .expect(204)
              .expect(res => expect(res.body).to.be.empty)
              .then(() => Comment.findById(commentId).exec())
              .catch(err => expect(err).to.have.property('message', 'Not Found')));
        }); // it()

        it('PUT extra data should be ignored', () => {
          return testUtils.getApiToken()
            .then(token => request(app)
              .put(`/deeds/${deedId}/comments/${commentId}`)
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
              .put(`/deeds/${deedId}/comments/${commentId}`)
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
  }); // describe()
}); // describe()
