var utils = require('../../utils/tests'),
    credentials = utils.credentials,
    request = require('supertest'),
    expect = require('chai').expect,
    app = require('../../app');

describe('route /auth', function __describe() {
  before(utils.dbConnect);
  after(utils.dbDisconnect);

  describe('/login POST', function __describe() {
    after(utils.removeUsers);

    before(function __before(done) {
      utils.saveUser(credentials, done);
    }); // before()

    it('should return status 200 with accessToken when sending valid credentials', function __it(done) {
      request(app)
        .post('/auth/login')
        .send('email=' + credentials.email)
        .send('password=' + credentials.password)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function __requestEnd(err, res) {
          if (err) { return done(err); }

          expect(res.body.accessToken).to.exist.and.to.be.a('string');

          return done();
        });
    }); // it()

    it('should return status 401 when sending an unknown email address', function __it(done) {
      request(app)
        .post('/auth/login')
        .send('email=wrong@example.com')
        .send('password=' + credentials.password)
        .expect('Content-Type', /json/)
        .expect(401)
        .end(function __requestEnd(err, res) {
          if (err) { return done(err); }

          expect(res.body.message).to.exist.and.to.equal('Incorrect email');

          return done();
        });
    }); // it()

    it('should return status 401 when sending an incorrect password', function __it(done) {
      request(app)
        .post('/auth/login')
        .send('email=' + credentials.email)
        .send('password=wrongpassword')
        .expect('Content-Type', /json/)
        .expect(401)
        .end(function __requestEnd(err, res) {
          if (err) { return done(err); }

          expect(res.body.message).to.exist.and.to.equal('Incorrect password');

          return done();
        });
    }); // it()
  }); // describe()
}); // describe()
