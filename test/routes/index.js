var config = require('../../config/config'),
    request = require('supertest'),
    expect = require('chai').expect,
    mongoose = require('mongoose'),
    app = require('../../app');

describe('Dummy routes', function() {
  beforeEach(function (done) {
    function clearDB() {
      for (var i in mongoose.connection.collections) {
        mongoose.connection.collections[i].remove();
      }
      return done();
    }

    function reconnect() {
      mongoose.connect(config.db.url, function (err) {
        if (err) throw err;
        return clearDB();
      });
    }

    (function checkState() {
      switch (mongoose.connection.readyState) {
        case 0:
          reconnect();
          break;
        case 1:
          clearDB();
          break;
        default:
          process.nextTick(checkState);
      }
    })();
  });

  afterEach(function (done) {
    mongoose.models = {};
    mongoose.modelSchemas = {};
    mongoose.disconnect(function() {
      return done();
    });
  });

  describe('GET index', function() {
    it('should return status 200 and an empty array', function(done) {
      request(app)
        .get('/')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          expect(res.body).to.be.empty;
          done();
        });
    });
  });

  describe('POST index', function() {
    it('should return status 201', function(done) {
      request(app)
        .post('/')
        .expect('Content-Type', /json/)
        .expect(201)
        .end(function (err, res) {
          if (err) throw err;
          expect(res.body).to.be.empty;
          done();
        });
    });
  });
});
