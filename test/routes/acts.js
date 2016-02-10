var utils = require('../../utils/tests'),
    request = require('supertest'),
    expect = require('chai').expect,
    app = require('../../app');

var ObjectId = require('mongoose').Types.ObjectId,
    Act = require('../../models/Act'),
    Like = require('../../models/Like'),
    Comment = require('../../models/Comment');

var actId = null;
var validAct = {
  user: ObjectId(),
  group: ObjectId(),
  deed: ObjectId()
};

describe('/acts', () => {
  before(utils.dbConnect);
  beforeEach(utils.removeUsers);
  after(utils.dbDisconnect);

  afterEach(done => {
    Act.remove({}, err => {
      if (err) { return done(err); }

      done();
    });
  }); // afterEach()

  describe('/', () => {
    it('GET should return status 200 and an empty array', done => {
      request(app)
        .get('/acts')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => expect(res.body).to.be.an('array').and.to.have.length(0))
        .end(done);
    }); // it()

    it('GET should return status 200 and a non-empty array', done => {
      new Act(validAct).save(err => {
        if (err) { return done(err); }

        request(app)
          .get('/acts')
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(res => expect(res.body).to.be.an('array').and.to.have.length.above(0))
          .end(done);
      });
    }); // it()

    it('POST invalid data should return status 400 and an error message', done => {
      utils.getApiToken((err, token) => {
        expect(err).to.not.exist;

        request(app)
          .post('/acts')
          .set('Authorization', `Bearer ${token}`)
          .send({})
          .expect(400)
          .expect('Content-Type', /json/)
          .expect(res => expect(res.body).property('message', 'Act validation failed'))
          .end(done);
      });
    }); // it()

    it('POST valid data should return status 201 and the created Act', done => {
      utils.getApiToken((err, token) => {
        expect(err).to.not.exist;

        request(app)
          .post('/acts')
          .set('Authorization', `Bearer ${token}`)
          .send(validAct)
          .expect(201)
          .expect('Content-Type', /json/)
          .expect('Location', /acts/)
          .expect(res => expect(res.body).be.be.an('object').and.to.have.property('_id'))
          .end(done);
      });
    }); // it()
  }); // describe()

  describe('/:act', () => {
    beforeEach(done => {
      new Act(validAct).save((err, act) => {
        if (err) { return done(err); }

        actId = act._id;

        done();
      });
    }); // beforeEach()

    it('GET invalid ID should return status 400 and an error message', done => {
      request(app)
        .get('/acts/invalid')
        .expect(400)
        .expect('Content-Type', /json/)
        .expect(res => expect(res.body).to.have.property('message', 'Invalid act'))
        .end(done);
    }); // it()

    it('GET non-existent ID should return status 400 and an error message', done => {
      request(app)
        .get(`/acts/${ObjectId()}`)
        .expect(400)
        .expect('Content-Type', /json/)
        .expect(res => expect(res.body).to.have.property('message'))
        .end(done);
    }); // it()

    it('GET valid ID should return status 200 and the Act', done => {
      request(app)
        .get(`/acts/${actId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => expect(res.body).to.have.property('_id', actId.toString()))
        .end(done);
    }); // it()

    it('DELETE should return status 204 and delete the Act', done => {
      request(app)
        .delete(`/acts/${actId}`)
        .expect(204)
        .expect(res => expect(res.body).to.be.empty)
        .end(() => {
          Act.findById(actId, (err, act) => {
            expect(err).to.not.exist;
            expect(act).to.not.exist;

            done();
          });
        });
    }); // it()

    describe('/likes', () => {
      var likeId = null;
      var validLike = {
        user: ObjectId()
      };

      beforeEach(done => {
        validLike.target = { act: actId };

        new Like(validLike).save((err, like) => {
          if (err) { return done(err); }

          likeId = like._id;

          done();
        });
      }); // beforeEach()

      afterEach(done => {
        Like.remove({}, err => {
          if (err) { return done(err); }

          done();
        });
      }); // afterEach()

      it('GET should return status 200 and a non-empty array', done => {
        request(app)
          .get(`/acts/${actId}/likes`)
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(res => expect(res.body).to.be.an('array').and.to.have.length.above(0))
          .end(done);
      }); // it()

      it('POST valid data should return status 201 and the created Like', done => {
        utils.getApiToken((err, token) => {
          expect(err).to.not.exist;

          request(app)
            .post(`/acts/${actId}/likes`)
            .set('Authorization', `Bearer ${token}`)
            .send({})
            .expect(201)
            .expect('Content-Type', /json/)
            .expect('Location', /likes/)
            .expect(res => {
              expect(res.body).be.be.an('object').and.to.have.property('_id');
              expect(res.body).to.have.deep.property('target.act', actId.toString());
            })
            .end(done);
        });
      }); // it()

      describe('/:like', () => {
        it('DELETE invalid ID should return status 400 and an error message', done => {
          request(app)
            .delete(`/acts/${actId}/likes/invalid`)
            .expect(400)
            .expect('Content-Type', /json/)
            .expect(res => expect(res.body).to.have.property('message', 'Invalid like'))
            .end(done);
        }); // it()

        it('DELETE non-existent ID should return status 400 and an error message', done => {
          request(app)
            .delete(`/acts/${actId}/likes/${ObjectId()}`)
            .expect(400)
            .expect('Content-Type', /json/)
            .expect(res => expect(res.body).to.have.property('message'))
            .end(done);
        }); // it()

        it('DELETE valid ID should return status 204 and delete the Like', done => {
          request(app)
            .delete(`/acts/${actId}/likes/${likeId}`)
            .expect(204)
            .expect(res => expect(res.body).to.be.empty)
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

      beforeEach(done => {
        validComment.target = { act: actId };

        new Comment(validComment).save((err, comment) => {
          if (err) { return done(err); }

          commentId = comment._id;

          done();
        });
      }); // beforeEach()

      afterEach(done => {
        Comment.remove({}, err => {
          if (err) { return done(err); }

          done();
        });
      }); // afterEach()

      it('GET should return status 200 and a non-empty array', done => {
        request(app)
          .get(`/acts/${actId}/comments`)
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(res => expect(res.body).to.be.an('array').and.to.have.length.above(0))
          .end(done);
      }); // it()

      it('POST invalid data should return status 400 and an error message', done => {
        utils.getApiToken((err, token) => {
          expect(err).to.not.exist;

          request(app)
            .post(`/acts/${actId}/comments`)
            .set('Authorization', `Bearer ${token}`)
            .send({})
            .expect(400)
            .expect('Content-Type', /json/)
            .expect(res => expect(res.body).to.have.property('message', 'Comment validation failed'))
            .end(done);
        });
      }); // it()

      it('POST valid data should return status 201 and the created Comment', done => {
        utils.getApiToken((err, token) => {
          expect(err).to.not.exist;

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
            })
            .end(done);
        });
      }); // it()

      describe('/:comment', () => {
        it('DELETE invalid ID should return status 400 and an error message', done => {
          request(app)
            .delete(`/acts/${actId}/comments/invalid`)
            .expect(400)
            .expect('Content-Type', /json/)
            .expect(res => expect(res.body).to.have.property('message', 'Invalid comment'))
            .end(done);
        }); // it()

        it('DELETE non-existent ID should return status 400 and an error message', done => {
          request(app)
            .delete(`/acts/${actId}/comments/${ObjectId()}`)
            .expect(400)
            .expect('Content-Type', /json/)
            .expect(res => expect(res.body).to.have.property('message'))
            .end(done);
        }); // it()

        it('DELETE valid ID should return status 204 and delete the Comment', done => {
          request(app)
            .delete(`/acts/${actId}/comments/${commentId}`)
            .expect(204)
            .expect(res => expect(res.body).to.be.empty)
            .end(() => {
              Comment.findById(commentId, (err, comment) => {
                expect(err).to.not.exist;
                expect(comment).to.not.exist;

                done();
              });
            });
        }); // it()

        it('PUT extra data should be ignored', done => {
          request(app)
            .put(`/acts/${actId}/comments/${commentId}`)
            .send({ extra: 'Extra data' })
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(res => {
              expect(res.body).to.have.property('_id', commentId.toString());
              expect(res.body).to.not.have.property('extra');
            })
            .end(done);
        }); // it()

        it('PUT valid data should return status 200 and update the Comment', done => {
          var update = { content: { text: 'Updated text' } };

          request(app)
            .put(`/acts/${actId}/comments/${commentId}`)
            .send(update)
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(res => {
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
