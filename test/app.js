var utils = require('../utils/tests'),
    request = require('supertest'),
    expect = require('chai').expect,
    app = require('../app'),
    accessToken = null;

describe('Error handler', function __describe() {
  before(function __before(done) {
    utils.getAccessToken(function __getAccessToken(err, token) {
      if (err) { return done(err); }

      accessToken = token;
      return done();
    });
  }); // before()

  after(function __after(done) {
    utils.removeUsers(function __removeUsers(err) {
      if (err) { return done(err); }

      utils.dbClose(done);
    });
  }); // after()

  it('should return 404 when requesting an invalid route', function __it(done) {
    request(app)
      .get('/noroute')
      .set('Authorization', 'Bearer ' + accessToken)
      .expect(404)
      .expect('Content-Type', /json/)
      .end(function __requestEnd(err, res) {
        if (err) { return done(err); }

        expect(res.body.message).to.exist.and.to.equal('Not Found');

        return done();
      });
  }); // it()

  describe('development', function __describe() {
    before(function __before(done) {
      app.set('env', 'development');
      return done();
    }); // before

    after(function __after(done) {
      app.set('env', process.env.NODE_ENV);
      return done();
    }); // after

    it('should return a non-empty error object', function __it(done) {
      request(app)
        .get('/noroute')
        .set('Authorization', 'Bearer ' + accessToken)
        .expect(404)
        .end(function __requestEnd(err, res) {
          if (err) { return done(err); }

          expect(res.body.error).to.exist.and.to.not.be.empty;

          return done();
        });
    }); // it()
  }); // describe

  describe('production', function __describe() {
    before(function __before(done) {
      app.set('env', 'production');
      return done();
    }); // before

    after(function __after(done) {
      app.set('env', process.env.NODE_ENV);
      return done();
    }); // after

    it('should return an empty error object', function __it(done) {
      request(app)
        .get('/noroute')
        .set('Authorization', 'Bearer ' + accessToken)
        .expect(404)
        .end(function __requestEnd(err, res) {
          if (err) { return done(err); }

          expect(res.body.error).to.exist.and.to.be.empty;

          return done();
        });
    }); // it()
  }); // describe
}); // describe()
