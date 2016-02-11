var testUtils = require('../../utils/tests'),
    request = require('supertest-as-promised'),
    expect = require('chai').expect,
    app = require('../../app');

var ObjectId = require('mongoose').Types.ObjectId,
    News = require('../../models/News'),
    Like = require('../../models/Like'),
    Comment = require('../../models/Comment');

var newsId = null;
var validNews = {
  author: ObjectId(),
  title: 'News title',
  content: 'News content'
};

describe('/news', () => {
  before(testUtils.dbConnect);
  after(testUtils.dbDisconnect);
  afterEach(() => News.remove({}));

  describe('/', () => {
    it('GET should return status 200 and an empty array', () => {
      return request(app)
        .get('/news')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => expect(res.body).to.be.an('array').and.to.have.length(0));
    }); // it()

    it('GET should return status 200 and a non-empty array', () => {
      return new News(validNews).save()
        .then(() => {
          return request(app)
            .get('/news')
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(res => expect(res.body).to.be.an('array').and.to.have.length.above(0));
        });
    }); // it()

    it('POST invalid data should return status 400 and an error message', () => {
      return request(app)
        .post('/news')
        .send({})
        .expect(400)
        .expect('Content-Type', /json/)
        .expect(res => expect(res.body).property('message', 'News validation failed'));
    }); // it()

    it('POST valid data should return status 201 and the created News item', () => {
      return request(app)
        .post('/news')
        .send(validNews)
        .expect(201)
        .expect('Content-Type', /json/)
        .expect('Location', /news/)
        .expect(res => expect(res.body).be.be.an('object').and.to.have.property('_id'));
    }); // it()
  }); // describe()

  describe('/:news', () => {
    beforeEach(() => {
      return new News(validNews).save()
        .then(news => newsId = news._id);
    });

    it('GET invalid ID should return status 400 and an error message', () => {
      return request(app)
        .get('/news/invalid')
        .expect(400)
        .expect('Content-Type', /json/)
        .expect(res => expect(res.body).to.have.property('message', 'Invalid news'));
    }); // it()

    it('GET non-existent ID should return status 404 and an error message', () => {
      return request(app)
        .get(`/news/${ObjectId()}`)
        .expect(404)
        .expect('Content-Type', /json/)
        .expect(res => expect(res.body).to.have.property('message', 'Not Found'));
    }); // it()

    it('GET valid ID should return status 200 and the News item', () => {
      return request(app)
        .get(`/news/${newsId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => expect(res.body).to.have.property('_id', newsId.toString()));
    }); // it()

    it('PUT extra data should be ignored', () => {
      return request(app)
        .put(`/news/${newsId}`)
        .send({ extra: 'Extra data' })
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
          expect(res.body).to.have.property('_id', newsId.toString());
          expect(res.body).to.not.have.property('extra');
        });
    }); // it()

    it('PUT valid data should return status 200 and update the News item', () => {
      var update = { content: 'Updated content' };

      return request(app)
        .put(`/news/${newsId}`)
        .send(update)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body).to.have.property('_id', newsId.toString());
          expect(res.body).to.have.property('modified');
          expect(res.body).to.have.property('content', update.content);
        });
    }); // it()

    it('DELETE should return status 204 and delete the News item', () => {
      return request(app)
        .delete(`/news/${newsId}`)
        .expect(204)
        .expect((res) => expect(res.body).to.be.empty)
        .then(() => News.findById(newsId).exec())
        .catch(err => expect(err).to.have.property('message', 'Not Found'));
    }); // it()

    describe('/likes', () => {
      var likeId = null;
      var validLike = {
        user: ObjectId()
      };

      beforeEach(() => {
        validLike.target = { news: newsId };

        return new Like(validLike).save()
          .then(like => likeId = like._id);
      });
      afterEach(() => Like.remove({}));

      it('GET should return status 200 and a non-empty array', () => {
        return request(app)
          .get(`/news/${newsId}/likes`)
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(res => expect(res.body).to.be.an('array').and.to.have.length.above(0));
      }); // it()

      it('POST invalid data should return status 400 and an error message', () => {
        return request(app)
          .post(`/news/${newsId}/likes`)
          .send({})
          .expect(400)
          .expect('Content-Type', /json/)
          .expect(res => expect(res.body).to.have.property('message', 'Like validation failed'));
      }); // it()

      it('POST valid data should return status 201 and the created Like', () => {
        return request(app)
          .post(`/news/${newsId}/likes`)
          .send({ user: ObjectId() })
          .expect(201)
          .expect('Content-Type', /json/)
          .expect('Location', /likes/)
          .expect(res => {
            expect(res.body).be.be.an('object').and.to.have.property('_id');
            expect(res.body).to.have.deep.property('target.news', newsId.toString());
          });
      }); // it()

      describe('/:like', () => {
        it('DELETE invalid ID should return status 400 and an error message', () => {
          return request(app)
            .delete(`/news/${newsId}/likes/invalid`)
            .expect(400)
            .expect('Content-Type', /json/)
            .expect(res => expect(res.body).to.have.property('message', 'Invalid like'));
        }); // it()

        it('DELETE non-existent ID should return status 404 and an error message', () => {
          return request(app)
            .delete(`/news/${newsId}/likes/${ObjectId()}`)
            .expect(404)
            .expect('Content-Type', /json/)
            .expect(res => expect(res.body).to.have.property('message', 'Not Found'));
        }); // it()

        it('DELETE valid ID should return status 204 and delete the Like', () => {
          return request(app)
            .delete(`/news/${newsId}/likes/${likeId}`)
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
        validComment.target = { news: newsId };

        return new Comment(validComment).save()
          .then(comment => commentId = comment._id);
      });
      afterEach(() => Comment.remove({}));

      it('GET should return status 200 and a non-empty array', () => {
        return request(app)
          .get(`/news/${newsId}/comments`)
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(res => expect(res.body).to.be.an('array').and.to.have.length.above(0));
      }); // it()

      it('POST invalid data should return status 400 and an error message', () => {
        return request(app)
          .post(`/news/${newsId}/comments`)
          .send({})
          .expect(400)
          .expect('Content-Type', /json/)
          .expect(res => expect(res.body).to.have.property('message', 'Comment validation failed'));
      }); // it()

      it('POST valid data should return status 201 and the created Comment', () => {
        return request(app)
          .post(`/news/${newsId}/comments`)
          .send(validComment)
          .expect(201)
          .expect('Content-Type', /json/)
          .expect('Location', /comments/)
          .expect(res => {
            expect(res.body).be.be.an('object').and.to.have.property('_id');
            expect(res.body).to.have.deep.property('target.news', newsId.toString());
          });
      }); // it()

      describe('/:comment', () => {
        it('DELETE invalid ID should return status 400 and an error message', () => {
          return request(app)
            .delete(`/news/${newsId}/comments/invalid`)
            .expect(400)
            .expect('Content-Type', /json/)
            .expect(res => expect(res.body).to.have.property('message', 'Invalid comment'));
        }); // it()

        it('DELETE non-existent ID should return status 404 and an error message', () => {
          return request(app)
            .delete(`/news/${newsId}/comments/${ObjectId()}`)
            .expect(404)
            .expect('Content-Type', /json/)
            .expect(res => expect(res.body).to.have.property('message', 'Not Found'));
        }); // it()

        it('DELETE valid ID should return status 204 and delete the Comment', () => {
          return request(app)
            .delete(`/news/${newsId}/comments/${commentId}`)
            .expect(204)
            .expect(res => expect(res.body).to.be.empty)
            .then(() => Comment.findById(commentId).exec())
            .catch(err => expect(err).to.have.property('message', 'Not Found'));
        }); // it()

        it('PUT extra data should be ignored', () => {
          return request(app)
            .put(`/news/${newsId}/comments/${commentId}`)
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
            .put(`/news/${newsId}/comments/${commentId}`)
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
