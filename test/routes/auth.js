var utils = require('../../utils/tests'),
  credentials = utils.credentials,
  request = require('supertest'),
  expect = require('chai').expect,
  app = require('../../app');

describe('/auth', () => {
  before(utils.dbConnect);
  after(utils.dbDisconnect);

  describe('/login', () => {
    after(utils.removeUsers);
    before(done => utils.saveUser(credentials, done));

    it('POST valid credentials should return status 200 with API token', done => {
      request(app)
        .post('/auth/login')
        .send(`email=${credentials.email}`)
        .send(`password=${credentials.password}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => expect(res.body.token).to.exist.and.to.be.a('string'))
        .end(done);
    }); // it()

    it('POST unknown email address should return status 401 and an error message', done => {
      request(app)
        .post('/auth/login')
        .send('email=wrong@example.com')
        .send(`password=${credentials.password}`)
        .expect(401)
        .expect('Content-Type', /json/)
        .expect(res => expect(res.body).to.have.property('message', 'Invalid email and/or password'))
        .end(done);
    }); // it()

    it('POST incorrect password should return status 401 and an error message', done => {
      request(app)
        .post('/auth/login')
        .send(`email=${credentials.email}`)
        .send('password=wrongpassword')
        .expect(401)
        .expect('Content-Type', /json/)
        .expect(res => expect(res.body).to.have.property('message', 'Invalid email and/or password'))
        .end(done);
    }); // it()
  }); // describe()

  // TODO: add tests for /facebook endpoint
}); // describe()
