var request = require('supertest-as-promised'),
    expect = require('chai').expect,
    app = require('../../app');

describe('/', () => {
  it('GET should return status 200 and HTML', () => {
    return request(app)
      .get('/')
      .expect(200)
      .expect('Content-Type', /text\/html/);
  }); // it()
}); // describe()

describe('/nonexistent', () => {
  it('GET should return status 404 and an error message', () => {
    return request(app)
      .get('/nonexistent')
      .expect(404)
      .expect(res => expect(res.body).to.have.property('message', 'Not Found'));
  }); // it()
}); // describe()
