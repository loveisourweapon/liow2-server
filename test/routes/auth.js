var testUtils = require('../../utils/tests'),
    credentials = testUtils.credentials,
    request = require('supertest-as-promised'),
    expect = require('chai').expect,
    app = require('../../app');

var User = require('../../models/User'),
    Token = require('../../models/Token');

describe('/auth', () => {
  before(testUtils.dbConnect);
  after(testUtils.dbDisconnect);

  describe('/login', () => {
    beforeEach(() => testUtils.saveUser(credentials));
    afterEach(testUtils.removeUsers);

    it('POST unknown email address should return status 401 and an error message', () => {
      return request(app)
        .post('/auth/login')
        .send({
          email: 'wrong@example.com',
          password: credentials.password
        })
        .expect(401)
        .expect('Content-Type', /json/)
        .expect(res => expect(res.body).to.have.property('message', 'Invalid email and/or password'));
    }); // it()

    it('POST incorrect password should return status 401 and an error message', () => {
      return request(app)
        .post('/auth/login')
        .send({
          email: credentials.email,
          password: 'wrongpassword'
        })
        .expect(401)
        .expect('Content-Type', /json/)
        .expect(res => expect(res.body).to.have.property('message', 'Invalid email and/or password'));
    }); // it()

    it('POST valid credentials should return status 200 with API token', () => {
      return request(app)
        .post('/auth/login')
        .send({
          email: credentials.email,
          password: credentials.password
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => expect(res.body.token).to.exist.and.to.be.a('string'));
    }); // it()
  }); // describe()

  // TODO: add tests for /facebook endpoint
  describe('/facebook', () => {
    // POST
  }); // describe()

  describe('/confirm', () => {
    var user = null;
    var token = null;

    beforeEach(() => {
      return testUtils.saveUser(credentials)
        .then(newUser => (user = newUser))
        .then(() => new Token({ type: 'confirm', user }).save())
        .then(newToken => (token = newToken));
    }); // beforeEach()
    afterEach(() => Token.remove({}).then(testUtils.removeUsers));

    it('GET without email param should return status 400 and an error message', () => {
      return request(app)
        .get('/auth/confirm')
        .send()
        .expect(400)
        .expect('Content-Type', /json/)
        .expect(res => expect(res.body).to.have.property('message', 'Email address required'));
    }); // it()

    it('GET with invalid email param should return status 204 and no content', () => {
      return request(app)
        .get('/auth/confirm')
        .query({ email: 'wrong@example.com' })
        .send()
        .expect(204)
        .expect(res => expect(res.body).to.be.empty);
    }); // it()

    it('GET with valid email param should return status 204 and no content', () => {
      return request(app)
        .get('/auth/confirm')
        .query({ email: credentials.email })
        .send()
        .expect(204)
        .expect(res => expect(res.body).to.be.empty);
    }); // it()

    it('POST non-existent token should return status 404 and not found message', () => {
      return request(app)
        .post('/auth/confirm')
        .send({ token: 'invalid' })
        .expect(404)
        .expect('Content-Type', /json/)
        .expect(res => expect(res.body).to.have.property('message', 'Not Found'));
    }); // it()

    it('POST expired token should return status 404 and not found message', () => {
      return Token.findByIdAndUpdate(token._id, { expires: new Date() }).exec()
        .then(() => request(app)
          .post('/auth/confirm')
          .send({ token: token.token })
          .expect(404)
          .expect('Content-Type', /json/)
          .expect(res => expect(res.body).to.have.property('message', 'Not Found')));
    }); // it()

    it('POST valid token should set the linked user to confirmed', () => {
      return User.findById(user._id).exec()
        .then(user => expect(user).to.have.property('confirmed', false))
        .then(() => request(app)
          .post('/auth/confirm')
          .send({ token: token.token })
          .expect(204)
          .expect(res => expect(res.body).to.be.empty))
        .then(() => User.findById(user._id).exec())
        .then(user => expect(user).to.have.property('confirmed', true));
    }); // it()

    it('POST valid token should remove the token', () => {
      return Token.findById(token._id).exec()
        .then(token => expect(token).to.be.an.instanceof(Token))
        .then(() => request(app)
          .post('/auth/confirm')
          .send({ token: token.token })
          .expect(204)
          .expect(res => expect(res.body).to.be.empty))
        .then(() => Token.findById(token._id).exec())
        .catch(err => expect(err).to.have.property('message', 'Not Found'));
    }); // it()
  }); // describe()

  describe('/forgot', () => {
    beforeEach(() => testUtils.saveUser(credentials));
    afterEach(testUtils.removeUsers);

    it('GET without email param should return status 400 and an error message', () => {
      return request(app)
        .get('/auth/forgot')
        .send()
        .expect(400)
        .expect('Content-Type', /json/)
        .expect(res => expect(res.body).to.have.property('message', 'Email address required'));
    }); // it()

    it('GET with invalid email param should return status 204 and no content', () => {
      return request(app)
        .get('/auth/forgot')
        .query({ email: 'wrong@example.com' })
        .send()
        .expect(204)
        .expect(res => expect(res.body).to.be.empty);
    }); // it()

    it('GET with valid email param should return status 204 and no content', () => {
      return request(app)
        .get('/auth/forgot')
        .query({ email: credentials.email })
        .send()
        .expect(204)
        .expect(res => expect(res.body).to.be.empty);
    }); // it()
  }); // describe()

  describe('/reset', () => {
    var user = null;
    var token = null;
    var password = 'password123';

    beforeEach(() => {
      return testUtils.saveUser(credentials)
        .then(newUser => (user = newUser))
        .then(() => new Token({ type: 'reset', user }).save())
        .then(newToken => (token = newToken));
    }); // beforeEach()
    afterEach(() => Token.remove({}).then(testUtils.removeUsers));

    it('POST non-existent token should return status 404 and not found message', () => {
      return request(app)
        .post('/auth/reset')
        .send({ token: 'invalid', password })
        .expect(404)
        .expect('Content-Type', /json/)
        .expect(res => expect(res.body).to.have.property('message', 'Not Found'));
    }); // it()

    it('POST expired token should return status 404 and not found message', () => {
      return Token.findByIdAndUpdate(token._id, { expires: new Date() }).exec()
        .then(() => request(app)
          .post('/auth/reset')
          .send({ token: token.token, password })
          .expect(404)
          .expect('Content-Type', /json/)
          .expect(res => expect(res.body).to.have.property('message', 'Not Found')));
    }); // it()

    it('POST valid token should set updated the linked user\'s password', () => {
      return User.findById(user._id).exec()
        .then(user => user.validatePassword(credentials.password))
        .then(result => expect(result).to.be.true)
        .then(() => request(app)
          .post('/auth/reset')
          .send({ token: token.token, password })
          .expect(204)
          .expect(res => expect(res.body).to.be.empty))
        .then(() => User.findById(user._id).exec())
        .then(user => user.validatePassword(password))
        .then(result => expect(result).to.be.true);
    }); // it()

    it('POST valid token should remove the token', () => {
      return Token.findById(token._id).exec()
        .then(token => expect(token).to.be.an.instanceof(Token))
        .then(() => request(app)
          .post('/auth/reset')
          .send({ token: token.token, password })
          .expect(204)
          .expect(res => expect(res.body).to.be.empty))
        .then(() => Token.findById(token._id).exec())
        .catch(err => expect(err).to.have.property('message', 'Not Found'));
    }); // it()
  }); // describe()
}); // describe()
