var request = require('supertest'),
    expect = require('chai').expect,
    app = require('../app');

describe('Error handler', () => {
  it('should return 404 when requesting an invalid route', (done) => {
    request(app)
      .get('/noroute')
      .expect(404)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        expect(err).to.not.exist;
        expect(res.body.message).to.exist.and.to.equal('Not Found');

        done();
      });
  }); // it()

  describe('development', () => {
    var appEnv = app.get('env');
    before(() => { app.set('env', 'development'); });
    after(() => { app.set('env', appEnv); });

    it('should return a non-empty error object', (done) => {
      request(app)
        .get('/noroute')
        .expect(404)
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.body.error).to.exist.and.to.not.be.empty;

          done();
        });
    }); // it()
  }); // describe()

  describe('production', () => {
    var appEnv = app.get('env');
    before(() => { app.set('env', 'production'); });
    after(() => { app.set('env', appEnv); });

    it('should return an empty error object', (done) => {
      request(app)
        .get('/noroute')
        .expect(404)
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.body.error).to.exist.and.to.be.empty;

          done();
        });
    }); // it()
  }); // describe()
}); // describe()
