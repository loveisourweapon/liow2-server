var utils = require('../../utils/tests'),
    credentials = utils.credentials,
    request = require('supertest'),
    expect = require('chai').expect,
    app = require('../../app');

describe('/auth', function __describe() {
  before(utils.dbConnect);
  after(utils.dbDisconnect);

  describe('/login', function __describe() {
    after(utils.removeUsers);

    before(function __before(done) {
      utils.saveUser(credentials, done);
    }); // before()

    it('POST valid credentials should return status 200 with accessToken', function __it(done) {
      request(app)
        .post('/auth/login')
        .send('email=' + credentials.email)
        .send('password=' + credentials.password)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(function __expect(res) {
          expect(res.body.accessToken).to.exist.and.to.be.a('string');
        })
        .end(done);
    }); // it()

    it('POST unknown email address should return status 401 and an error message', function __it(done) {
      request(app)
        .post('/auth/login')
        .send('email=wrong@example.com')
        .send('password=' + credentials.password)
        .expect(401)
        .expect('Content-Type', /json/)
        .expect(function __expect(res) {
          expect(res.body).to.have.property('message', 'Incorrect email');
        })
        .end(done);
    }); // it()

    it('POST incorrect password should return status 401 and an error message', function __it(done) {
      request(app)
        .post('/auth/login')
        .send('email=' + credentials.email)
        .send('password=wrongpassword')
        .expect(401)
        .expect('Content-Type', /json/)
        .expect(function __expect(res) {
          expect(res.body).to.have.property('message', 'Incorrect password');
        })
        .end(done);
    }); // it()
  }); // describe()

  describe('/facebook', function __describe() {
    it('GET should redirect to Facebook for login', function __it(done) {
      request(app)
        .get('/auth/facebook')
        .redirects(0)
        .expect(302)
        .expect('Location', /facebook\.com/i)
        .end(done);
    }); // it()
  }); // describe()
}); // describe()
