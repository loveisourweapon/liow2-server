var utils = require('../../utils/tests'),
    request = require('supertest'),
    expect = require('chai').expect,
    app = require('../../app');

describe('/', function __describe() {
  it('GET should return status 200 and HTML', function __it(done) {
    request(app)
      .get('/')
      .expect(200)
      .expect('Content-Type', /text\/html/)
      .end(done);
  }); // it()
}); // describe()

describe('/nonexistent', function __describe() {
  it('GET should return status 404 and an error message', function __it(done) {
    request(app)
      .get('/nonexistent')
      .expect(404)
      .expect(function __expect(res) {
        expect(res.body).to.have.property('message', 'Not Found')
      })
      .end(done);
  }); // it()
}); // describe()
