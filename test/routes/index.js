var config = require('../../config/config'),
    request = require('supertest'),
    expect = require('chai').expect,
    mongoose = require('mongoose'),
    app = require('../../app');

var User = require('../../models/User'),
    credentials = {
      email: 'test@example.com',
      password: 'testing123'
    },
    accessToken;

function createTestUser(done) {
  User.findOrCreate({
    email: credentials.email,
    password: credentials.password
  }, function(err, user) {
    if (err) return done(err);

    return done(null, user);
  })
}

function getAccessToken(done) {
  createTestUser(function(err, user) {
    if (err) return done(err);

    request.agent(app)
      .post('/auth/login')
      .send('email=' + credentials.email)
      .send('password=' + credentials.password)
      .end(function (err, res) {
        if (err) return done(err);

        if (!res.body.accessToken) return done(new Error('Failed getting accessing token.'));

        accessToken = res.body.accessToken;
        return done(null, accessToken);
      });
  });
}

describe('Dummy routes', function() {
  before(function(done) {
    if (mongoose.connection.readyState === 0) {
      mongoose.connect(config.db.url, function(err) {
        if (err) throw err;

        getAccessToken(function(err) {
          if (err) throw err;

          return done();
        });
      });
    } else {
      getAccessToken(function(err) {
        if (err) throw err;

        return done();
      });
    }
  });

  after(function(done) {
    User.remove({}, function(err) {
      if (err) throw err;

      mongoose.connection.close(function(err) {
        if (err) throw err;

        return done();
      });
    });
  });

  describe('GET index', function() {
    it('should return status 200 and an array', function(done) {
      request(app)
        .get('/')
        .set('Authorization', 'Bearer ' + accessToken)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;

          expect(res.body).to.be.an('array');

          return done();
        });
    });
  });

  describe('POST index', function() {
    it('should return status 201', function(done) {
      request(app)
        .post('/')
        .set('Authorization', 'Bearer ' + accessToken)
        .expect('Content-Type', /json/)
        .expect(201)
        .end(function (err, res) {
          if (err) throw err;

          expect(res.body).to.be.empty;

          return done();
        });
    });
  });
});
