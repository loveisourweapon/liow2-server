var request = require('supertest-as-promised'),
    expect = require('chai').expect,
    app = require('../app');

describe('Error handler', () => {
  it('should return 404 when requesting an invalid route', () => {
    return request(app)
      .get('/noroute')
      .expect(404)
      .expect('Content-Type', /json/)
      .expect(res => expect(res.body).to.have.property('message', 'Not Found'));
  }); // it()

  it('should return a non-empty error object', () => {
    return request(app)
      .get('/noroute')
      .expect(404)
      .expect(res => expect(res.body.error).to.exist.and.to.be.not.empty);
  }); // it()
}); // describe()
