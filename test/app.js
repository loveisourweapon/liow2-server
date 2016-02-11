var request = require('supertest-as-promised'),
    expect = require('chai').expect,
    app = require('../app');

describe('Error handler', () => {
  it('should return 404 when requesting an invalid route', () => {
    return request(app)
      .get('/noroute')
      .expect(404)
      .expect('Content-Type', /json/)
      .expect(res => expect(res.body.message).to.exist.and.to.equal('Not Found'));
  }); // it()

  describe('development', () => {
    var appEnv = app.get('env');
    before(() => { app.set('env', 'development'); });
    after(() => { app.set('env', appEnv); });

    it('should return a non-empty error object', () => {
      return request(app)
        .get('/noroute')
        .expect(404)
        .expect(res => expect(res.body.error).to.exist.and.to.not.be.empty);
    }); // it()
  }); // describe()

  describe('production', () => {
    var appEnv = app.get('env');
    before(() => { app.set('env', 'production'); });
    after(() => { app.set('env', appEnv); });

    it('should return an empty error object', () => {
      return request(app)
        .get('/noroute')
        .expect(404)
        .expect(res => expect(res.body.error).to.exist.and.to.be.empty);
    }); // it()
  }); // describe()
}); // describe()
