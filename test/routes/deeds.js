var utils = require('../../utils/tests'),
    request = require('supertest'),
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
  before(utils.dbConnect);
  after(utils.dbDisconnect);

  afterEach((done) => {
    Deed.remove({}, (err) => {
      if (err) { return done(err); }

      done();
    });
  }); // afterEach()

  describe('/', () => {
    it('GET should return status 200 and an empty array', (done) => {
      request(app)
        .get('/deeds')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body).to.be.an('array').and.to.have.length(0);
        })
        .end(done);
    }); // it()

    it('GET should return status 200 and a non-empty array', (done) => {
      new Deed(validDeed).save((err) => {
        if (err) { return done(err); }

        request(app)
          .get('/deeds')
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
        .post('/deeds')
        .send({})
        .expect(400)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body).property('message', 'Deed validation failed');
        })
        .end(done);
    }); // it()

    it('POST valid data should return status 201 and the created Deed', (done) => {
      request(app)
        .post('/deeds')
        .send(validDeed)
        .expect(201)
        .expect('Content-Type', /json/)
        .expect('Location', /deeds/)
        .expect((res) => {
          expect(res.body).be.be.an('object').and.to.have.property('_id');
        })
        .end(done);
    }); // it()
  }); // describe()

  describe('/:deed', () => {
    beforeEach((done) => {
      new Deed(validDeed).save((err, deed) => {
        if (err) { return done(err); }

        deedId = deed._id;

        done();
      });
    }); // beforeEach()

    it('GET invalid ID should return status 400 and an error message', (done) => {
      request(app)
        .get('/deeds/invalid')
        .expect(400)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body).to.have.property('message', 'Invalid deed');
        })
        .end(done);
    }); // it()

    it('GET non-existent ID should return status 400 and an error message', (done) => {
      request(app)
        .get(`/deeds/${ObjectId()}`)
        .expect(400)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body).to.have.property('message');
        })
        .end(done);
    }); // it()

    it('GET valid ID should return status 200 and the Deed', (done) => {
      request(app)
        .get(`/deeds/${deedId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body).to.have.property('_id', deedId.toString());
        })
        .end(done);
    }); // it()

    it('PUT extra data should be ignored', (done) => {
      request(app)
        .put(`/deeds/${deedId}`)
        .send({ extra: 'Extra data' })
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body).to.have.property('_id', deedId.toString());
          expect(res.body).to.not.have.property('extra');
        })
        .end(done);
    }); // it()

    it('PUT valid data should return status 200 and update the Deed', (done) => {
      var update = { content: 'Updated content' };

      request(app)
        .put(`/deeds/${deedId}`)
        .send(update)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body).to.have.property('_id', deedId.toString());
          expect(res.body).to.have.property('modified');
          expect(res.body).to.have.property('content', update.content);
        })
        .end(done);
    }); // it()

    it('DELETE should return status 204 and delete the Deed', (done) => {
      request(app)
        .delete(`/deeds/${deedId}`)
        .expect(204)
        .expect((res) => {
          expect(res.body).to.be.empty;
        })
        .end(() => {
          Deed.findById(deedId, (err, deed) => {
            expect(err).to.not.exist;
            expect(deed).to.not.exist;

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
        validLike.target = { deed: deedId };

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
          .get(`/deeds/${deedId}/likes`)
          .expect(200)
          .expect('Content-Type', /json/)
          .expect((res) => {
            expect(res.body).to.be.an('array').and.to.have.length.above(0);
          })
          .end(done);
      }); // it()

      it('POST invalid data should return status 400 and an error message', (done) => {
        request(app)
          .post(`/deeds/${deedId}/likes`)
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
          .post(`/deeds/${deedId}/likes`)
          .send({ user: ObjectId() })
          .expect(201)
          .expect('Content-Type', /json/)
          .expect('Location', /likes/)
          .expect((res) => {
            expect(res.body).be.be.an('object').and.to.have.property('_id');
            expect(res.body).to.have.deep.property('target.deed', deedId.toString());
          })
          .end(done);
      }); // it()

      describe('/:like', () => {
        it('DELETE invalid ID should return status 400 and an error message', (done) => {
          request(app)
            .delete(`/deeds/${deedId}/likes/invalid`)
            .expect(400)
            .expect('Content-Type', /json/)
            .expect((res) => {
              expect(res.body).to.have.property('message', 'Invalid like');
            })
            .end(done);
        }); // it()

        it('DELETE non-existent ID should return status 400 and an error message', (done) => {
          request(app)
            .delete(`/deeds/${deedId}/likes/${ObjectId()}`)
            .expect(400)
            .expect('Content-Type', /json/)
            .expect((res) => {
              expect(res.body).to.have.property('message');
            })
            .end(done);
        }); // it()

        it('DELETE valid ID should return status 204 and delete the Like', (done) => {
          request(app)
            .delete(`/deeds/${deedId}/likes/${likeId}`)
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
        validComment.target = { deed: deedId };

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
          .get(`/deeds/${deedId}/comments`)
          .expect(200)
          .expect('Content-Type', /json/)
          .expect((res) => {
            expect(res.body).to.be.an('array').and.to.have.length.above(0);
          })
          .end(done);
      }); // it()

      it('POST invalid data should return status 400 and an error message', (done) => {
        request(app)
          .post(`/deeds/${deedId}/comments`)
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
          .post(`/deeds/${deedId}/comments`)
          .send(validComment)
          .expect(201)
          .expect('Content-Type', /json/)
          .expect('Location', /comments/)
          .expect((res) => {
            expect(res.body).be.be.an('object').and.to.have.property('_id');
            expect(res.body).to.have.deep.property('target.deed', deedId.toString());
          })
          .end(done);
      }); // it()

      describe('/:comment', () => {
        it('DELETE invalid ID should return status 400 and an error message', (done) => {
          request(app)
            .delete(`/deeds/${deedId}/comments/invalid`)
            .expect(400)
            .expect('Content-Type', /json/)
            .expect((res) => {
              expect(res.body).to.have.property('message', 'Invalid comment');
            })
            .end(done);
        }); // it()

        it('DELETE non-existent ID should return status 400 and an error message', (done) => {
          request(app)
            .delete(`/deeds/${deedId}/comments/${ObjectId()}`)
            .expect(400)
            .expect('Content-Type', /json/)
            .expect((res) => {
              expect(res.body).to.have.property('message');
            })
            .end(done);
        }); // it()

        it('DELETE valid ID should return status 204 and delete the Comment', (done) => {
          request(app)
            .delete(`/deeds/${deedId}/comments/${commentId}`)
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
            .put(`/deeds/${deedId}/comments/${commentId}`)
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
            .put(`/deeds/${deedId}/comments/${commentId}`)
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
