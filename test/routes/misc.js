var request = require('supertest'),
    expect = require('chai').expect,
    app = require('../../app');

describe('/', () => {
  it('GET should return status 200 and HTML', (done) => {
    request(app)
      .get('/')
      .expect(200)
      .expect('Content-Type', /text\/html/)
      .end(done);
  }); // it()
}); // describe()

describe('/nonexistent', () => {
  it('GET should return status 404 and an error message', (done) => {
    request(app)
      .get('/nonexistent')
      .expect(404)
      .expect((res) => {
        expect(res.body).to.have.property('message', 'Not Found');
      })
      .end(done);
  }); // it()
}); // describe()
