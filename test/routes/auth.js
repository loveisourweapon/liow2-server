var testUtils = require('../../utils/tests'),
  credentials = testUtils.credentials,
  request = require('supertest-as-promised'),
  expect = require('chai').expect,
  app = require('../../app');

describe('/auth', () => {
  before(testUtils.dbConnect);
  after(testUtils.dbDisconnect);

  describe('/login', () => {
    after(testUtils.removeUsers);
    before(() => testUtils.saveUser(credentials));

    it('POST valid credentials should return status 200 with API token', () => {
      return request(app)
        .post('/auth/login')
        .send(`email=${credentials.email}`)
        .send(`password=${credentials.password}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => expect(res.body.token).to.exist.and.to.be.a('string'));
    }); // it()

    it('POST unknown email address should return status 401 and an error message', () => {
      return request(app)
        .post('/auth/login')
        .send('email=wrong@example.com')
        .send(`password=${credentials.password}`)
        .expect(401)
        .expect('Content-Type', /json/)
        .expect(res => expect(res.body).to.have.property('message', 'Invalid email and/or password'));
    }); // it()

    it('POST incorrect password should return status 401 and an error message', () => {
      return request(app)
        .post('/auth/login')
        .send(`email=${credentials.email}`)
        .send('password=wrongpassword')
        .expect(401)
        .expect('Content-Type', /json/)
        .expect(res => expect(res.body).to.have.property('message', 'Invalid email and/or password'));
    }); // it()
  }); // describe()

  // TODO: add tests for /facebook endpoint
}); // describe()
