var utils = require('../../utils/tests'),
    request = require('supertest'),
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
  before(utils.dbConnect);
  after(utils.dbDisconnect);

  afterEach((done) => {
    News.remove({}, (err) => {
      if (err) { return done(err); }

      done();
    });
  }); // afterEach()

  describe('/', () => {
    it('GET should return status 200 and an empty array', (done) => {
      request(app)
        .get('/news')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body).to.be.an('array').and.to.have.length(0);
        })
        .end(done);
    }); // it()

    it('GET should return status 200 and a non-empty array', (done) => {
      new News(validNews).save((err) => {
        if (err) { return done(err); }

        request(app)
          .get('/news')
          .expect(200)
          .expect('Content-Type', /json/)
          .expect((res) => {
            expect(res.body).to.be.an('array').and.to.have.length.above(0);
          })
          .end(done);
      });
    }); // it()

    it('POST invalid data should return status 400 and an error message', (done) => {
      request(app)
        .post('/news')
        .send({})
        .expect(400)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body).property('message', 'News validation failed');
        })
        .end(done);
    }); // it()

    it('POST valid data should return status 201 and the created News item', (done) => {
      request(app)
        .post('/news')
        .send(validNews)
        .expect(201)
        .expect('Content-Type', /json/)
        .expect('Location', /news/)
        .expect((res) => {
          expect(res.body).be.be.an('object').and.to.have.property('_id');
        })
        .end(done);
    }); // it()
  }); // describe()

  describe('/:news', () => {
    beforeEach((done) => {
      new News(validNews).save((err, news) => {
        if (err) { return done(err); }

        newsId = news._id;

        done();
      });
    }); // beforeEach()

    it('GET invalid ID should return status 400 and an error message', (done) => {
      request(app)
        .get('/news/invalid')
        .expect(400)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body).to.have.property('message', 'Invalid news');
        })
        .end(done);
    }); // it()

    it('GET non-existent ID should return status 400 and an error message', (done) => {
      request(app)
        .get(`/news/${ObjectId()}`)
        .expect(400)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body).to.have.property('message');
        })
        .end(done);
    }); // it()

    it('GET valid ID should return status 200 and the News item', (done) => {
      request(app)
        .get(`/news/${newsId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body).to.have.property('_id', newsId.toString());
        })
        .end(done);
    }); // it()

    it('PUT extra data should be ignored', (done) => {
      request(app)
        .put(`/news/${newsId}`)
        .send({ extra: 'Extra data' })
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body).to.have.property('_id', newsId.toString());
          expect(res.body).to.not.have.property('extra');
        })
        .end(done);
    }); // it()

    it('PUT valid data should return status 200 and update the News item', (done) => {
      var update = { content: 'Updated content' };

      request(app)
        .put(`/news/${newsId}`)
        .send(update)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body).to.have.property('_id', newsId.toString());
          expect(res.body).to.have.property('modified');
          expect(res.body).to.have.property('content', update.content);
        })
        .end(done);
    }); // it()

    it('DELETE should return status 204 and delete the News item', (done) => {
      request(app)
        .delete(`/news/${newsId}`)
        .expect(204)
        .expect((res) => {
          expect(res.body).to.be.empty;
        })
        .end(() => {
          News.findById(newsId, (err, news) => {
            expect(err).to.not.exist;
            expect(news).to.not.exist;

            done();
          });
        });
    }); // it()

    describe('/likes', () => {
      var likeId = null;
      var validLike = {
        user: ObjectId()
      };

      beforeEach((done) => {
        validLike.target = { news: newsId };

        new Like(validLike).save((err, like) => {
          if (err) { return done(err); }

          likeId = like._id;

          done();
        });
      }); // beforeEach()

      afterEach((done) => {
        Like.remove({}, (err) => {
          if (err) { return done(err); }

          done();
        });
      }); // afterEach()

      it('GET should return status 200 and a non-empty array', (done) => {
        request(app)
          .get(`/news/${newsId}/likes`)
          .expect(200)
          .expect('Content-Type', /json/)
          .expect((res) => {
            expect(res.body).to.be.an('array').and.to.have.length.above(0);
          })
          .end(done);
      }); // it()

      it('POST invalid data should return status 400 and an error message', (done) => {
        request(app)
          .post(`/news/${newsId}/likes`)
          .send({})
          .expect(400)
          .expect('Content-Type', /json/)
          .expect((res) => {
            expect(res.body).to.have.property('message', 'Like validation failed');
          })
          .end(done);
      }); // it()

      it('POST valid data should return status 201 and the created Like', (done) => {
        request(app)
          .post(`/news/${newsId}/likes`)
          .send({ user: ObjectId() })
          .expect(201)
          .expect('Content-Type', /json/)
          .expect('Location', /likes/)
          .expect((res) => {
            expect(res.body).be.be.an('object').and.to.have.property('_id');
            expect(res.body).to.have.deep.property('target.news', newsId.toString());
          })
          .end(done);
      }); // it()

      describe('/:like', () => {
        it('DELETE invalid ID should return status 400 and an error message', (done) => {
          request(app)
            .delete(`/news/${newsId}/likes/invalid`)
            .expect(400)
            .expect('Content-Type', /json/)
            .expect((res) => {
              expect(res.body).to.have.property('message', 'Invalid like');
            })
            .end(done);
        }); // it()

        it('DELETE non-existent ID should return status 400 and an error message', (done) => {
          request(app)
            .delete(`/news/${newsId}/likes/${ObjectId()}`)
            .expect(400)
            .expect('Content-Type', /json/)
            .expect((res) => {
              expect(res.body).to.have.property('message');
            })
            .end(done);
        }); // it()

        it('DELETE valid ID should return status 204 and delete the Like', (done) => {
          request(app)
            .delete(`/news/${newsId}/likes/${likeId}`)
            .expect(204)
            .expect((res) => {
              expect(res.body).to.be.empty;
            })
            .end(() => {
              Like.findById(likeId, (err, like) => {
                expect(err).to.not.exist;
                expect(like).to.not.exist;

                done();
              });
            });
        }); // it()
      }); // describe()
    }); // describe()

    describe('/comments', () => {
      var commentId = null;
      var validComment = {
        user: ObjectId(),
        content: { text: 'Comment text' }
      };

      beforeEach((done) => {
        validComment.target = { news: newsId };

        new Comment(validComment).save((err, comment) => {
          if (err) { return done(err); }

          commentId = comment._id;

          done();
        });
      }); // beforeEach()

      afterEach((done) => {
        Comment.remove({}, (err) => {
          if (err) { return done(err); }

          done();
        });
      }); // afterEach()

      it('GET should return status 200 and a non-empty array', (done) => {
        request(app)
          .get(`/news/${newsId}/comments`)
          .expect(200)
          .expect('Content-Type', /json/)
          .expect((res) => {
            expect(res.body).to.be.an('array').and.to.have.length.above(0);
          })
          .end(done);
      }); // it()

      it('POST invalid data should return status 400 and an error message', (done) => {
        request(app)
          .post(`/news/${newsId}/comments`)
          .send({})
          .expect(400)
          .expect('Content-Type', /json/)
          .expect((res) => {
            expect(res.body).to.have.property('message', 'Comment validation failed');
          })
          .end(done);
      }); // it()

      it('POST valid data should return status 201 and the created Comment', (done) => {
        request(app)
          .post(`/news/${newsId}/comments`)
          .send(validComment)
          .expect(201)
          .expect('Content-Type', /json/)
          .expect('Location', /comments/)
          .expect((res) => {
            expect(res.body).be.be.an('object').and.to.have.property('_id');
            expect(res.body).to.have.deep.property('target.news', newsId.toString());
          })
          .end(done);
      }); // it()

      describe('/:comment', () => {
        it('DELETE invalid ID should return status 400 and an error message', (done) => {
          request(app)
            .delete(`/news/${newsId}/comments/invalid`)
            .expect(400)
            .expect('Content-Type', /json/)
            .expect((res) => {
              expect(res.body).to.have.property('message', 'Invalid comment');
            })
            .end(done);
        }); // it()

        it('DELETE non-existent ID should return status 400 and an error message', (done) => {
          request(app)
            .delete(`/news/${newsId}/comments/${ObjectId()}`)
            .expect(400)
            .expect('Content-Type', /json/)
            .expect((res) => {
              expect(res.body).to.have.property('message');
            })
            .end(done);
        }); // it()

        it('DELETE valid ID should return status 204 and delete the Comment', (done) => {
          request(app)
            .delete(`/news/${newsId}/comments/${commentId}`)
            .expect(204)
            .expect((res) => {
              expect(res.body).to.be.empty;
            })
            .end(() => {
              Comment.findById(commentId, (err, comment) => {
                expect(err).to.not.exist;
                expect(comment).to.not.exist;

                done();
              });
            });
        }); // it()

        it('PUT extra data should be ignored', (done) => {
          request(app)
            .put(`/news/${newsId}/comments/${commentId}`)
            .send({ extra: 'Extra data' })
            .expect(200)
            .expect('Content-Type', /json/)
            .expect((res) => {
              expect(res.body).to.have.property('_id', commentId.toString());
              expect(res.body).to.not.have.property('extra');
            })
            .end(done);
        }); // it()

        it('PUT valid data should return status 200 and update the Comment', (done) => {
          var update = { content: { text: 'Updated text' } };

          request(app)
            .put(`/news/${newsId}/comments/${commentId}`)
            .send(update)
            .expect(200)
            .expect('Content-Type', /json/)
            .expect((res) => {
              expect(res.body).to.have.property('_id', commentId.toString());
              expect(res.body).to.have.property('modified');
              expect(res.body).to.have.deep.property('content.text', update.content.text);
            })
            .end(done);
        }); // it()
      }); // describe()
    }); // describe()
  }); // describe()
}); // describe()
