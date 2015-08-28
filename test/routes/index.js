var utils = require('../../utils/tests'),
    request = require('supertest'),
    expect = require('chai').expect,
    app = require('../../app'),
    accessToken = null;

describe('route /', function __describe() {
  describe('GET', function __describe() {
    it('should return status 200 and HTML', function __it(done) {
      request(app)
        .get('/')
        .expect('Content-Type', /text\/html/)
        .expect(200)
        .end(done);
    }); // it()
  }); // describe()
}); // describe()
