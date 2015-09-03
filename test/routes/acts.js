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

describe('/acts', function __describe() {
  before(utils.dbConnect);
  after(utils.dbDisconnect);

  afterEach(function __afterEach(done) {
    Act.remove({}, function __actRemove(err) {
      if (err) { return done(err); }

      done();
    });
  }); // afterEach()

  describe('/', function __describe() {
    it('GET should return status 200 and an empty array', function __it(done) {
      request(app)
        .get('/acts')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(function __expect(res) {
          expect(res.body).to.be.an('array').and.to.have.length(0);
        })
        .end(done);
    }); // it()

    it('GET should return status 200 and a non-empty array', function __it(done) {
      new Act(validAct).save(function __actSave(err) {
        if (err) { return done(err); }

        request(app)
          .get('/acts')
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(function __expect(res) {
            expect(res.body).to.be.an('array').and.to.have.length.above(0);
          })
          .end(done);
      });
    }); // it()

    it('POST invalid data should return status 400 and an error message', function __it(done) {
      request(app)
        .post('/acts')
        .send({})
        .expect(400)
        .expect('Content-Type', /json/)
        .expect(function __expect(res) {
          expect(res.body).property('message', 'Act validation failed');
        })
        .end(done);
    }); // it()

    it('POST valid data should return status 201 and the created Act', function __it(done) {
      request(app)
        .post('/acts')
        .send(validAct)
        .expect(201)
        .expect('Content-Type', /json/)
        .expect('Location', /acts/)
        .expect(function __expect(res) {
          expect(res.body).be.be.an('object').and.to.have.property('_id');
        })
        .end(done);
    }); // it()
  }); // describe()

  describe('/:act', function __describe() {
    beforeEach(function __beforeEach(done) {
      new Act(validAct).save(function __actSave(err, act) {
        if (err) { return done(err); }

        actId = act._id;

        done();
      });
    }); // beforeEach()

    it('GET invalid ID should return status 400 and an error message', function __it(done) {
      request(app)
        .get('/acts/invalid')
        .expect(400)
        .expect('Content-Type', /json/)
        .expect(function __expect(res) {
          expect(res.body).to.have.property('message', 'Invalid act');
        })
        .end(done);
    }); // it()

    it('GET non-existent ID should return status 400 and an error message', function __it(done) {
      request(app)
        .get('/acts/' + ObjectId())
        .expect(400)
        .expect('Content-Type', /json/)
        .expect(function __expect(res) {
          expect(res.body).to.have.property('message');
        })
        .end(function (err, res) {
          console.log('ERR', err);
          console.log('RES', res.body);

          done();
        });
        //.end(done);
    }); // it()

    it('GET valid ID should return status 200 and the Act', function __it(done) {
      request(app)
        .get('/acts/' + actId)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(function __expect(res) {
          expect(res.body).to.have.property('_id', actId.toString());
        })
        .end(done);
    }); // it()

    it('DELETE should return status 204 and delete the Act', function __it(done) {
      request(app)
        .delete('/acts/' + actId)
        .expect(204)
        .expect(function __expect(res) {
          expect(res.body).to.be.empty;
        })
        .end(function __end() {
          Act.findById(actId, function __actFindById(err, act) {
            expect(err).to.not.exist;
            expect(act).to.not.exist;

            done();
          });
        });
    }); // it()

    describe('/likes', function __describe() {
      var likeId = null;
      var validLike = {
        user: ObjectId()
      };

      beforeEach(function __beforeEach(done) {
        validLike.target = { act: actId };

        new Like(validLike).save(function __likeSave(err, like) {
          if (err) { return done(err); }

          likeId = like._id;

          done();
        });
      }); // beforeEach()

      afterEach(function __afterEach(done) {
        Like.remove({}, function __likeRemove(err) {
          if (err) { return done(err); }

          done();
        });
      }); // afterEach()

      it('GET should return status 200 and a non-empty array', function __it(done) {
        request(app)
          .get('/acts/' + actId + '/likes')
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(function __expect(res) {
            expect(res.body).to.be.an('array').and.to.have.length.above(0);
          })
          .end(done);
      }); // it()

      it('POST invalid data should return status 400 and an error message', function __it(done) {
        request(app)
          .post('/acts/' + actId + '/likes')
          .send({})
          .expect(400)
          .expect('Content-Type', /json/)
          .expect(function __expect(res) {
            expect(res.body).to.have.property('message', 'Like validation failed');
          })
          .end(done);
      }); // it()

      it('POST valid data should return status 201 and the created Like', function __it(done) {
        request(app)
          .post('/acts/' + actId + '/likes')
          .send({ user: ObjectId() })
          .expect(201)
          .expect('Content-Type', /json/)
          .expect('Location', /likes/)
          .expect(function __expect(res) {
            expect(res.body).be.be.an('object').and.to.have.property('_id');
            expect(res.body).to.have.deep.property('target.act', actId.toString());
          })
          .end(done);
      }); // it()

      describe('/:like', function __describe() {
        it('DELETE invalid ID should return status 400 and an error message', function __it(done) {
          request(app)
            .delete('/acts/' + actId + '/likes/invalid')
            .expect(400)
            .expect('Content-Type', /json/)
            .expect(function __expect(res) {
              expect(res.body).to.have.property('message', 'Invalid like');
            })
            .end(done);
        }); // it()

        it('DELETE non-existent ID should return status 400 and an error message', function __it(done) {
          request(app)
            .delete('/acts/' + actId + '/likes/' + ObjectId())
            .expect(400)
            .expect('Content-Type', /json/)
            .expect(function __expect(res) {
              expect(res.body).to.have.property('message');
            })
            .end(done);
        }); // it()

        it('DELETE valid ID should return status 204 and delete the Like', function __it(done) {
          request(app)
            .delete('/acts/' + actId + '/likes/' + likeId)
            .expect(204)
            .expect(function __expect(res) {
              expect(res.body).to.be.empty;
            })
            .end(function __end() {
              Like.findById(likeId, function __likeFindById(err, like) {
                expect(err).to.not.exist;
                expect(like).to.not.exist;

                done();
              });
            });
        }); // it()
      }); // describe()
    }); // describe()

    describe('/comments', function __describe() {
      var commentId = null;
      var validComment = {
        user: ObjectId(),
        content: { text: 'Comment text' }
      };

      beforeEach(function __beforeEach(done) {
        validComment.target = { act: actId };

        new Comment(validComment).save(function __commentSave(err, comment) {
          if (err) { return done(err); }

          commentId = comment._id;

          done();
        });
      }); // beforeEach()

      afterEach(function __afterEach(done) {
        Comment.remove({}, function __commentRemove(err) {
          if (err) { return done(err); }

          done();
        });
      }); // afterEach()

      it('GET should return status 200 and a non-empty array', function __it(done) {
        request(app)
          .get('/acts/' + actId + '/comments')
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(function __expect(res) {
            expect(res.body).to.be.an('array').and.to.have.length.above(0);
          })
          .end(done);
      }); // it()

      it('POST invalid data should return status 400 and an error message', function __it(done) {
        request(app)
          .post('/acts/' + actId + '/comments')
          .send({})
          .expect(400)
          .expect('Content-Type', /json/)
          .expect(function __expect(res) {
            expect(res.body).to.have.property('message', 'Comment validation failed');
          })
          .end(done);
      }); // it()

      it('POST valid data should return status 201 and the created Comment', function __it(done) {
        request(app)
          .post('/acts/' + actId + '/comments')
          .send(validComment)
          .expect(201)
          .expect('Content-Type', /json/)
          .expect('Location', /comments/)
          .expect(function __expect(res) {
            expect(res.body).be.be.an('object').and.to.have.property('_id');
            expect(res.body).to.have.deep.property('target.act', actId.toString());
          })
          .end(done);
      }); // it()

      describe('/:comment', function __describe() {
        it('DELETE invalid ID should return status 400 and an error message', function __it(done) {
          request(app)
            .delete('/acts/' + actId + '/comments/invalid')
            .expect(400)
            .expect('Content-Type', /json/)
            .expect(function __expect(res) {
              expect(res.body).to.have.property('message', 'Invalid comment');
            })
            .end(done);
        }); // it()

        it('DELETE non-existent ID should return status 400 and an error message', function __it(done) {
          request(app)
            .delete('/acts/' + actId + '/comments/' + ObjectId())
            .expect(400)
            .expect('Content-Type', /json/)
            .expect(function __expect(res) {
              expect(res.body).to.have.property('message');
            })
            .end(done);
        }); // it()

        it('DELETE valid ID should return status 204 and delete the Comment', function __it(done) {
          request(app)
            .delete('/acts/' + actId + '/comments/' + commentId)
            .expect(204)
            .expect(function __expect(res) {
              expect(res.body).to.be.empty;
            })
            .end(function __end() {
              Comment.findById(commentId, function __commentFindById(err, comment) {
                expect(err).to.not.exist;
                expect(comment).to.not.exist;

                done();
              });
            });
        }); // it()

        it('PUT extra data should be ignored', function __it(done) {
          request(app)
            .put('/acts/' + actId + '/comments/' + commentId)
            .send({ extra: 'Extra data' })
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(function __expect(res) {
              expect(res.body).to.have.property('_id', commentId.toString());
              expect(res.body).to.not.have.property('extra');
            })
            .end(done);
        }); // it()

        it('PUT valid data should return status 200 and update the Comment', function __it(done) {
          var update = { content: { text: 'Updated text' } };

          request(app)
            .put('/acts/' + actId + '/comments/' + commentId)
            .send(update)
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(function __expect(res) {
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
