var testUtils = require('../../utils/tests'),
    request = require('supertest-as-promised'),
    expect = require('chai').expect,
    app = require('../../app');

var ObjectId = require('mongoose').Types.ObjectId,
    Deed = require('../../models/Deed'),
    Like = require('../../models/Like'),
    Comment = require('../../models/Comment');

var deedId = null;
var validDeed = {
  title: 'Deed title',
  content: 'Deed content'
};

describe('/deeds', () => {
  before(testUtils.dbConnect);
  beforeEach(testUtils.removeUsers);
  after(testUtils.dbDisconnect);
  afterEach(() => Deed.remove({}));

  describe('/', () => {
    it('GET should return status 200 and an empty array', () => {
      return request(app)
        .get('/deeds')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => expect(res.body).to.be.an('array').and.to.have.length(0));
    }); // it()

    it('GET should return status 200 and a non-empty array', () => {
      return new Deed(validDeed).save()
        .then(() => {
          return request(app)
            .get('/deeds')
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(res => expect(res.body).to.be.an('array').and.to.have.length.above(0));
        });
    }); // it()

    it('POST invalid data should return status 400 and an error message', () => {
      return testUtils.getApiToken()
        .then(token => {
          return request(app)
            .post('/deeds')
            .set('Authorization', `Bearer ${token}`)
            .send({})
            .expect(400)
            .expect('Content-Type', /json/)
            .expect(res => expect(res.body).property('message', 'Deed validation failed'));
        });
    }); // it()

    it('POST valid data should return status 201 and the created Deed', () => {
      return testUtils.getApiToken()
        .then(token => {
          return request(app)
            .post('/deeds')
            .set('Authorization', `Bearer ${token}`)
            .send(validDeed)
            .expect(201)
            .expect('Content-Type', /json/)
            .expect('Location', /deeds/)
            .expect(res => expect(res.body).be.be.an('object').and.to.have.property('_id'));
        });
    }); // it()
  }); // describe()

  describe('/:deed', () => {
    beforeEach(() => {
      return new Deed(validDeed).save()
        .then(deed => deedId = deed._id);
    });

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
        .expect(res => expect(res.body).to.have.property('_id', deedId.toString()));
    }); // it()

    it('PUT extra data should be ignored', () => {
      return request(app)
        .put(`/deeds/${deedId}`)
        .send({ extra: 'Extra data' })
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
          expect(res.body).to.have.property('_id', deedId.toString());
          expect(res.body).to.not.have.property('extra');
        });
    }); // it()

    it('PUT valid data should return status 200 and update the Deed', () => {
      var update = { content: 'Updated content' };

      return request(app)
        .put(`/deeds/${deedId}`)
        .send(update)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
          expect(res.body).to.have.property('_id', deedId.toString());
          expect(res.body).to.have.property('modified');
          expect(res.body).to.have.property('content', update.content);
        });
    }); // it()

    it('DELETE should return status 204 and delete the Deed', () => {
      return request(app)
        .delete(`/deeds/${deedId}`)
        .expect(204)
        .expect(res => expect(res.body).to.be.empty)
        .then(() => Deed.findById(deedId).exec())
        .catch(err => expect(err).to.have.property('message', 'Not Found'));
    }); // it()

    describe('/likes', () => {
      var likeId = null;
      var validLike = {
        user: ObjectId()
      };

      beforeEach(() => {
        validLike.target = { deed: deedId };

        return new Like(validLike).save()
          .then(like => likeId = like._id);
      });
      afterEach(() => Like.remove({}));

      it('GET should return status 200 and a non-empty array', () => {
        return request(app)
          .get(`/deeds/${deedId}/likes`)
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(res => expect(res.body).to.be.an('array').and.to.have.length.above(0));
      }); // it()

      it('POST invalid data should return status 400 and an error message', () => {
        return request(app)
          .post(`/deeds/${deedId}/likes`)
          .send({})
          .expect(400)
          .expect('Content-Type', /json/)
          .expect(res => expect(res.body).to.have.property('message', 'Like validation failed'));
      }); // it()

      it('POST valid data should return status 201 and the created Like', () => {
        return request(app)
          .post(`/deeds/${deedId}/likes`)
          .send({ user: ObjectId() })
          .expect(201)
          .expect('Content-Type', /json/)
          .expect('Location', /likes/)
          .expect(res => {
            expect(res.body).be.be.an('object').and.to.have.property('_id');
            expect(res.body).to.have.deep.property('target.deed', deedId.toString());
          });
      }); // it()

      describe('/:like', () => {
        it('DELETE invalid ID should return status 400 and an error message', () => {
          return request(app)
            .delete(`/deeds/${deedId}/likes/invalid`)
            .expect(400)
            .expect('Content-Type', /json/)
            .expect(res => expect(res.body).to.have.property('message', 'Invalid like'));
        }); // it()

        it('DELETE non-existent ID should return status 404 and an error message', () => {
          return request(app)
            .delete(`/deeds/${deedId}/likes/${ObjectId()}`)
            .expect(404)
            .expect('Content-Type', /json/)
            .expect(res => expect(res.body).to.have.property('message', 'Not Found'));
        }); // it()

        it('DELETE valid ID should return status 204 and delete the Like', () => {
          return request(app)
            .delete(`/deeds/${deedId}/likes/${likeId}`)
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
        validComment.target = { deed: deedId };

        return new Comment(validComment).save()
          .then(comment => commentId = comment._id);
      });
      afterEach(() => Comment.remove({}));

      it('GET should return status 200 and a non-empty array', () => {
        return request(app)
          .get(`/deeds/${deedId}/comments`)
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(res => expect(res.body).to.be.an('array').and.to.have.length.above(0));
      }); // it()

      it('POST invalid data should return status 400 and an error message', () => {
        return request(app)
          .post(`/deeds/${deedId}/comments`)
          .send({})
          .expect(400)
          .expect('Content-Type', /json/)
          .expect(res => expect(res.body).to.have.property('message', 'Comment validation failed'));
      }); // it()

      it('POST valid data should return status 201 and the created Comment', () => {
        return request(app)
          .post(`/deeds/${deedId}/comments`)
          .send(validComment)
          .expect(201)
          .expect('Content-Type', /json/)
          .expect('Location', /comments/)
          .expect(res => {
            expect(res.body).be.be.an('object').and.to.have.property('_id');
            expect(res.body).to.have.deep.property('target.deed', deedId.toString());
          });
      }); // it()

      describe('/:comment', () => {
        it('DELETE invalid ID should return status 400 and an error message', () => {
          return request(app)
            .delete(`/deeds/${deedId}/comments/invalid`)
            .expect(400)
            .expect('Content-Type', /json/)
            .expect(res => expect(res.body).to.have.property('message', 'Invalid comment'));
        }); // it()

        it('DELETE non-existent ID should return status 404 and an error message', () => {
          return request(app)
            .delete(`/deeds/${deedId}/comments/${ObjectId()}`)
            .expect(404)
            .expect('Content-Type', /json/)
            .expect(res => expect(res.body).to.have.property('message', 'Not Found'));
        }); // it()

        it('DELETE valid ID should return status 204 and delete the Comment', () => {
          return request(app)
            .delete(`/deeds/${deedId}/comments/${commentId}`)
            .expect(204)
            .expect(res => expect(res.body).to.be.empty)
            .then(() => Comment.findById(commentId).exec())
            .catch(err => expect(err).to.have.property('message', 'Not Found'));
        }); // it()

        it('PUT extra data should be ignored', () => {
          return request(app)
            .put(`/deeds/${deedId}/comments/${commentId}`)
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
            .put(`/deeds/${deedId}/comments/${commentId}`)
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
