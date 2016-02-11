var testUtils = require('../../utils/tests'),
    request = require('supertest-as-promised'),
    expect = require('chai').expect,
    app = require('../../app');

var ObjectId = require('mongoose').Types.ObjectId,
    Act = require('../../models/Act'),
    Like = require('../../models/Like'),
    Comment = require('../../models/Comment');

var actId = null;
var validAct = {
  user: ObjectId(),
  deed: ObjectId()
};

describe('/acts', () => {
  before(testUtils.dbConnect);
  beforeEach(testUtils.removeUsers);
  after(testUtils.dbDisconnect);
  afterEach(() => Act.remove({}));

  describe('/', () => {
    it('GET should return status 200 and an empty array', () => {
      return request(app)
        .get('/acts')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => expect(res.body).to.be.an('array').and.to.have.length(0));
    }); // it()

    it('GET should return status 200 and a non-empty array', () => {
      return new Act(validAct).save()
        .then(() => {
          return request(app)
            .get('/acts')
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(res => expect(res.body).to.be.an('array').and.to.have.length.above(0));
        });
    }); // it()

    it('POST invalid data should return status 400 and an error message', () => {
      return testUtils.getApiToken()
        .then(token => {
          return request(app)
            .post('/acts')
            .set('Authorization', `Bearer ${token}`)
            .send({})
            .expect(400)
            .expect('Content-Type', /json/)
            .expect(res => expect(res.body).property('message', 'Act validation failed'));
        });
    }); // it()

    it('POST valid data should return status 201 and the created Act', () => {
      return testUtils.getApiToken()
        .then(token => {
          return request(app)
            .post('/acts')
            .set('Authorization', `Bearer ${token}`)
            .send(validAct)
            .expect(201)
            .expect('Content-Type', /json/)
            .expect('Location', /acts/)
            .expect(res => expect(res.body).be.be.an('object').and.to.have.property('_id'));
        });
    }); // it()
  }); // describe()

  describe('/:act', () => {
    beforeEach(() => {
      return new Act(validAct).save()
        .then(act => actId = act._id);
    });

    it('GET invalid ID should return status 400 and an error message', () => {
      return request(app)
        .get('/acts/invalid')
        .expect(400)
        .expect('Content-Type', /json/)
        .expect(res => expect(res.body).to.have.property('message', 'Invalid act'));
    }); // it()

    it('GET non-existent ID should return status 404 and an error message', () => {
      return request(app)
        .get(`/acts/${ObjectId()}`)
        .expect(404)
        .expect('Content-Type', /json/)
        .expect(res => expect(res.body).to.have.property('message', 'Not Found'));
    }); // it()

    it('GET valid ID should return status 200 and the Act', () => {
      return request(app)
        .get(`/acts/${actId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => expect(res.body).to.have.property('_id', actId.toString()));
    }); // it()

    it('DELETE should return status 204 and delete the Act', () => {
      return request(app)
        .delete(`/acts/${actId}`)
        .expect(204)
        .expect(res => expect(res.body).to.be.empty)
        .then(() => Act.findById(actId).exec())
        .catch(err => expect(err).to.have.property('message', 'Not Found'));
    }); // it()

    describe('/likes', () => {
      var likeId = null;
      var validLike = {
        user: ObjectId()
      };

      beforeEach(() => {
        validLike.target = { act: actId };

        return new Like(validLike).save()
          .then(like => likeId = like._id);
      });
      afterEach(() => Like.remove({}));

      it('GET should return status 200 and a non-empty array', () => {
        return request(app)
          .get(`/acts/${actId}/likes`)
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(res => expect(res.body).to.be.an('array').and.to.have.length.above(0));
      }); // it()

      it('POST valid data should return status 201 and the created Like', () => {
        return testUtils.getApiToken()
          .then(token => {
            return request(app)
              .post(`/acts/${actId}/likes`)
              .set('Authorization', `Bearer ${token}`)
              .send({})
              .expect(201)
              .expect('Content-Type', /json/)
              .expect('Location', /likes/)
              .expect(res => {
                expect(res.body).be.be.an('object').and.to.have.property('_id');
                expect(res.body).to.have.deep.property('target.act', actId.toString());
              });
          });
      }); // it()

      describe('/:like', () => {
        it('DELETE invalid ID should return status 400 and an error message', () => {
          return request(app)
            .delete(`/acts/${actId}/likes/invalid`)
            .expect(400)
            .expect('Content-Type', /json/)
            .expect(res => expect(res.body).to.have.property('message', 'Invalid like'));
        }); // it()

        it('DELETE non-existent ID should return status 404 and an error message', () => {
          return request(app)
            .delete(`/acts/${actId}/likes/${ObjectId()}`)
            .expect(404)
            .expect('Content-Type', /json/)
            .expect(res => expect(res.body).to.have.property('message', 'Not Found'));
        }); // it()

        it('DELETE valid ID should return status 204 and delete the Like', () => {
          return request(app)
            .delete(`/acts/${actId}/likes/${likeId}`)
            .expect(204)
            .expect(res => expect(res.body).to.be.empty)
            .then(() => Like.findById(likeId).exec())
            .catch(err => expect(err).to.have.property('message', 'Not Found'));
        }); // it()
      }); // describe()
    }); // describe()

    describe('/comments', () => {
      var commentId = null;
      var validComment = {
        user: ObjectId(),
        content: { text: 'Comment text' }
      };

      beforeEach(() => {
        validComment.target = { act: actId };

        return new Comment(validComment).save()
          .then(comment => commentId = comment._id);
      });
      afterEach(() => Comment.remove({}));

      it('GET should return status 200 and a non-empty array', () => {
        return request(app)
          .get(`/acts/${actId}/comments`)
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(res => expect(res.body).to.be.an('array').and.to.have.length.above(0));
      }); // it()

      it('POST invalid data should return status 400 and an error message', () => {
        return testUtils.getApiToken()
          .then(token => {
            return request(app)
              .post(`/acts/${actId}/comments`)
              .set('Authorization', `Bearer ${token}`)
              .send({})
              .expect(400)
              .expect('Content-Type', /json/)
              .expect(res => expect(res.body).to.have.property('message', 'Comment validation failed'));
          });
      }); // it()

      it('POST valid data should return status 201 and the created Comment', () => {
        return testUtils.getApiToken()
          .then(token => {
            request(app)
              .post(`/acts/${actId}/comments`)
              .set('Authorization', `Bearer ${token}`)
              .send(validComment)
              .expect(201)
              .expect('Content-Type', /json/)
              .expect('Location', /comments/)
              .expect(res => {
                expect(res.body).be.be.an('object').and.to.have.property('_id');
                expect(res.body).to.have.deep.property('target.act', actId.toString());
              });
          });
      }); // it()

      describe('/:comment', () => {
        it('DELETE invalid ID should return status 400 and an error message', () => {
          return request(app)
            .delete(`/acts/${actId}/comments/invalid`)
            .expect(400)
            .expect('Content-Type', /json/)
            .expect(res => expect(res.body).to.have.property('message', 'Invalid comment'));
        }); // it()

        it('DELETE non-existent ID should return status 404 and an error message', () => {
          return request(app)
            .delete(`/acts/${actId}/comments/${ObjectId()}`)
            .expect(404)
            .expect('Content-Type', /json/)
            .expect(res => expect(res.body).to.have.property('message', 'Not Found'));
        }); // it()

        it('DELETE valid ID should return status 204 and delete the Comment', () => {
          return request(app)
            .delete(`/acts/${actId}/comments/${commentId}`)
            .expect(204)
            .expect(res => expect(res.body).to.be.empty)
            .then(() => Comment.findById(commentId).exec())
            .catch(err => expect(err).to.have.property('message', 'Not Found'));
        }); // it()

        it('PUT extra data should be ignored', () => {
          return request(app)
            .put(`/acts/${actId}/comments/${commentId}`)
            .send({ extra: 'Extra data' })
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(res => {
              expect(res.body).to.have.property('_id', commentId.toString());
              expect(res.body).to.not.have.property('extra');
            });
        }); // it()

        it('PUT valid data should return status 200 and update the Comment', () => {
          var update = { content: { text: 'Updated text' } };

          return request(app)
            .put(`/acts/${actId}/comments/${commentId}`)
            .send(update)
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(res => {
              expect(res.body).to.have.property('_id', commentId.toString());
              expect(res.body).to.have.property('modified');
              expect(res.body).to.have.deep.property('content.text', update.content.text);
            });
        }); // it()
      }); // describe()
    }); // describe()
  }); // describe()
}); // describe()
