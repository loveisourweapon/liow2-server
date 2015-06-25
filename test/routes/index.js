var utils = require('../../utils/tests'),
    request = require('supertest'),
    expect = require('chai').expect,
    app = require('../../app'),
    accessToken = null;

describe('route /', function __describe() {
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

      utils.dbDisconnect(done);
    });
  }); // after()

  describe('GET', function __describe() {
    it('should return status 200 and an array', function __it(done) {
      request(app)
        .get('/')
        .set('Authorization', 'Bearer ' + accessToken)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function __requestEnd(err, res) {
          if (err) { return done(err); }

          expect(res.body).to.be.an('array');

          return done();
        });
    }); // it()
  }); // describe()

  describe('POST', function __describe() {
    it('should return status 201', function __it(done) {
      request(app)
        .post('/')
        .set('Authorization', 'Bearer ' + accessToken)
        .expect('Content-Type', /json/)
        .expect(201)
        .end(function __requestEnd(err, res) {
          if (err) { return done(err); }

          expect(res.body).to.be.empty.and.an('object');

          return done();
        });
    }); // it()
  }); // describe()
}); // describe()
