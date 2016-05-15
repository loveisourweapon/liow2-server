var merge = require('lodash/merge'),
    testUtils = require('../../utils/tests'),
    request = require('supertest-as-promised'),
    expect = require('chai').expect,
    app = require('../../app');

var ObjectId = require('mongoose').Types.ObjectId,
    Act = require('../../models/Act'),
    Like = require('../../models/Like'),
    Comment = require('../../models/Comment'),
    Group = require('../../models/Group'),
    Campaign = require('../../models/Campaign');

var validAct = {
  user: ObjectId(),
  deed: ObjectId()
};

describe('/acts', () => {
  before(testUtils.dbConnect);
  after(testUtils.dbDisconnect);
  afterEach(() => Act.remove({}));

  describe('/', () => {
    it('GET should return status 200 and an empty array', () => {
      return request(app)
        .get('/acts')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => expect(res.body).to.be.an('array').and.to.have.lengthOf(0));
    }); // it()

    it('GET should return status 200 and an array', () => {
      return new Act(validAct).save()
        .then(() => request(app)
          .get('/acts')
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(res => expect(res.body).to.be.an('array').and.to.have.lengthOf(1)));
    }); // it()

    it('POST invalid data should return status 400 and an error message', () => {
      return testUtils.getApiToken()
        .then(token => request(app)
          .post('/acts')
          .set('Authorization', `Bearer ${token}`)
          .send({})
          .expect(400)
          .expect('Content-Type', /json/)
          .expect(res => expect(res.body).to.have.property('message', 'Act validation failed')));
    }); // it()

    it('POST valid data should return status 201 and the created Act', () => {
      return testUtils.getApiToken()
        .then(token => request(app)
          .post('/acts')
          .set('Authorization', `Bearer ${token}`)
          .send(validAct)
          .expect(201)
          .expect('Content-Type', /json/)
          .expect('Location', /acts/)
          .expect(res => expect(res.body).be.be.an('object').and.to.have.property('_id')));
    }); // it()

    it('POST group without campaign should set active campaign', () => {
      return testUtils.getApiToken()
        .then(token => {
          return request(app)
            .post('/groups')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Group' })
            .then(resGroup => {
              return request(app)
                .post('/campaigns')
                .set('Authorization', `Bearer ${token}`)
                .send({ group: resGroup.body._id, deeds: [{ deed: ObjectId() }] })
                .then(resCampaign => {
                  return request(app)
                    .post('/acts')
                    .set('Authorization', `Bearer ${token}`)
                    .send(merge({ group: resGroup.body._id }, validAct))
                    .expect(res => expect(res.body).to.have.property('campaign', resCampaign.body._id));
                });
            });
        })
        .then(() => Campaign.remove({}))
        .then(() => Group.remove({}));
    }); // it()
  }); // describe()

  describe('/:act', () => {
    var actId = null;

    before(() => testUtils.saveUser(testUtils.credentials));
    beforeEach(() => {
      return testUtils.getApiToken()
        .then(token => request(app)
          .post('/acts')
          .set('Authorization', `Bearer ${token}`)
          .send(validAct)
          .then(res => (actId = res.body._id)));
    }); // beforeEach()
    after(testUtils.removeUsers);

    it('DELETE invalid ID should return status 400 and an error message', () => {
      return testUtils.getApiToken()
        .then(token => request(app)
          .delete('/acts/invalid')
          .set('Authorization', `Bearer ${token}`)
          .expect(400)
          .expect('Content-Type', /json/)
          .expect(res => expect(res.body).to.have.property('message', 'Invalid act')));
    }); // it()

    it('DELETE non-existent ID should return status 404 and an error message', () => {
      return testUtils.getApiToken()
        .then(token => request(app)
          .delete(`/acts/${ObjectId()}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(404)
          .expect('Content-Type', /json/)
          .expect(res => expect(res.body).to.have.property('message', 'Not Found')));
    }); // it()

    it('DELETE should return status 204 and delete the Act', () => {
      return testUtils.getApiToken()
        .then(token => request(app)
          .delete(`/acts/${actId}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(204)
          .expect(res => expect(res.body).to.be.empty)
          .then(() => Act.findById(actId).exec())
          .catch(err => expect(err).to.have.property('message', 'Not Found')));
    }); // it()

    describe('/likes', () => {
      var likeId = null;
      var validLike = {};

      beforeEach(() => {
        validLike.target = { act: actId };

        return testUtils.getApiToken()
          .then(token => request(app)
            .post(`/acts/${actId}/likes`)
            .set('Authorization', `Bearer ${token}`)
            .send(validLike)
            .then(res => (likeId = res.body._id)));
      }); // beforeEach()
      afterEach(() => Like.remove({}));

      it('GET should return status 200 and an array', () => {
        return request(app)
          .get(`/acts/${actId}/likes`)
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(res => expect(res.body).to.be.an('array').and.to.have.lengthOf(1));
      }); // it()

      it('POST valid data should return status 201 and the created Like', () => {
        return testUtils.getApiToken()
          .then(token => request(app)
            .post(`/acts/${actId}/likes`)
            .set('Authorization', `Bearer ${token}`)
            .send(validLike)
            .expect(201)
            .expect('Content-Type', /json/)
            .expect('Location', /likes/)
            .expect(res => {
              expect(res.body).be.be.an('object').and.to.have.property('_id');
              expect(res.body).to.have.deep.property('target.act', String(actId));
            }));
      }); // it()

      describe('/:like', () => {
        it('DELETE invalid ID should return status 400 and an error message', () => {
          return testUtils.getApiToken()
            .then(token => request(app)
              .delete(`/acts/${actId}/likes/invalid`)
              .set('Authorization', `Bearer ${token}`)
              .expect(400)
              .expect('Content-Type', /json/)
              .expect(res => expect(res.body).to.have.property('message', 'Invalid like')));
        }); // it()

        it('DELETE non-existent ID should return status 404 and an error message', () => {
          return testUtils.getApiToken()
            .then(token => request(app)
              .delete(`/acts/${actId}/likes/${ObjectId()}`)
              .set('Authorization', `Bearer ${token}`)
              .expect(404)
              .expect('Content-Type', /json/)
              .expect(res => expect(res.body).to.have.property('message', 'Not Found')));
        }); // it()

        it('DELETE valid ID should return status 204 and delete the Like', () => {
          return testUtils.getApiToken()
            .then(token => request(app)
              .delete(`/acts/${actId}/likes/${likeId}`)
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
        validComment.target = { act: actId };

        return testUtils.getApiToken()
          .then(token => request(app)
            .post(`/acts/${actId}/comments`)
            .set('Authorization', `Bearer ${token}`)
            .send(validComment)
            .then(res => (commentId = res.body._id)));
      }); // beforeEach()
      afterEach(() => Comment.remove({}));

      it('GET should return status 200 and an array', () => {
        return request(app)
          .get(`/acts/${actId}/comments`)
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(res => expect(res.body).to.be.an('array').and.to.have.lengthOf(1));
      }); // it()

      it('POST invalid data should return status 400 and an error message', () => {
        return testUtils.getApiToken()
          .then(token => request(app)
            .post(`/acts/${actId}/comments`)
            .set('Authorization', `Bearer ${token}`)
            .send({})
            .expect(400)
            .expect('Content-Type', /json/)
            .expect(res => expect(res.body).to.have.property('message', 'Comment validation failed')));
      }); // it()

      it('POST valid data should return status 201 and the created Comment', () => {
        return testUtils.getApiToken()
          .then(token => request(app)
            .post(`/acts/${actId}/comments`)
            .set('Authorization', `Bearer ${token}`)
            .send(validComment)
            .expect(201)
            .expect('Content-Type', /json/)
            .expect('Location', /comments/)
            .expect(res => {
              expect(res.body).be.be.an('object').and.to.have.property('_id');
              expect(res.body).to.have.deep.property('target.act', String(actId));
            }));
      }); // it()

      describe('/:comment', () => {
        it('DELETE invalid ID should return status 400 and an error message', () => {
          return testUtils.getApiToken()
            .then(token => request(app)
              .delete(`/acts/${actId}/comments/invalid`)
              .set('Authorization', `Bearer ${token}`)
              .expect(400)
              .expect('Content-Type', /json/)
              .expect(res => expect(res.body).to.have.property('message', 'Invalid comment')));
        }); // it()

        it('DELETE non-existent ID should return status 404 and an error message', () => {
          return testUtils.getApiToken()
            .then(token => request(app)
              .delete(`/acts/${actId}/comments/${ObjectId()}`)
              .set('Authorization', `Bearer ${token}`)
              .expect(404)
              .expect('Content-Type', /json/)
              .expect(res => expect(res.body).to.have.property('message', 'Not Found')));
        }); // it()

        it('DELETE valid ID should return status 204 and delete the Comment', () => {
          return testUtils.getApiToken()
            .then(token => request(app)
              .delete(`/acts/${actId}/comments/${commentId}`)
              .set('Authorization', `Bearer ${token}`)
              .expect(204)
              .expect(res => expect(res.body).to.be.empty)
              .then(() => Comment.findById(commentId).exec())
              .catch(err => expect(err).to.have.property('message', 'Not Found')));
        }); // it()

        it('PUT extra data should be ignored', () => {
          return testUtils.getApiToken()
            .then(token => request(app)
              .put(`/acts/${actId}/comments/${commentId}`)
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
              .put(`/acts/${actId}/comments/${commentId}`)
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
