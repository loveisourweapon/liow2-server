var testUtils = require('../../utils/tests'),
    request = require('supertest-as-promised'),
    expect = require('chai').expect,
    app = require('../../app');

var User = require('../../models/User'),
    Country = require('../../models/Country');

describe('/users', () => {
  before(() => {
    return testUtils.dbConnect()
      .then(() => testUtils.saveUser(testUtils.credentials));
  }); // before()
  after(() => {
    return testUtils.removeUsers()
      .then(testUtils.dbDisconnect);
  }); // after()

  describe('/', () => {
    it('GET should return a count of the number of users', () => {
      return request(app)
        .get('/users?count=true')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => expect(res).to.have.property('text', '1'));
    }); // it()

    it('GET should return a count of the number of users even without ?count=true flag', () => {
      return request(app)
        .get('/users')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.body).to.be.empty;
          expect(res).to.have.property('text', '1');
        });
    }); // it()
  }); // describe()

  describe('/me', () => {
    it('GET should return the details of the current user', () => {
      return testUtils.getApiToken()
        .then(token => request(app)
          .get('/users/me')
          .set('Authorization', `Bearer ${token}`)
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(res => {
            expect(res.body).to.have.property('_id');
            expect(res.body).to.have.property('email', testUtils.credentials.email);
          }));
    }); // it()

    it('GET should populate the linked country', () => {
      var countryId = null;

      return new Country({ name: 'Australia', code: 'AU' }).save()
        .then(country => {
          countryId = country._id;
          return User.findOne({ email: testUtils.credentials.email }).exec();
        })
        .then(user => {
          user.country = countryId;
          return user.save();
        })
        .then(testUtils.getApiToken)
        .then(token => request(app)
          .get('/users/me')
          .set('Authorization', `Bearer ${token}`)
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(res => expect(res.body).to.have.deep.property('country._id', String(countryId)))
          .then(() => Country.remove({})));
    }); // it()
  }); // describe()

  describe('/:user', () => {
    var userId = null;

    beforeEach(() => {
      return User.findOne({ email: testUtils.credentials.email }).exec()
        .then(user => userId = user._id);
    }); // beforeEach()

    it('PATCH extra data should be ignored', () => {
      return testUtils.getApiToken()
        .then(token => request(app)
          .patch(`/users/${userId}`)
          .set('Authorization', `Bearer ${token}`)
          .send([{ op: 'add', path: '/extra', value: 'data' }])
          .expect(200)
          .expect(res => expect(res.body).to.have.property('_id', String(userId)))
          .then(() => User.findById(userId).exec())
          .then(user => expect(user).to.not.have.property('extra')));
    }); // it()

    it('PATCH valid data should return status 204 and update the User', () => {
      return User.findById(userId).exec()
        .then(user => expect(user).to.have.property('firstName', testUtils.credentials.firstName))
        .then(testUtils.getApiToken)
        .then(token => request(app)
          .patch(`/users/${userId}`)
          .set('Authorization', `Bearer ${token}`)
          .send([{ op: 'replace', path: '/firstName', value: 'Foobar' }])
          .expect(200)
          .expect(res => expect(res.body).to.have.property('_id', String(userId)))
          .then(() => User.findById(userId).exec())
          .then(user => expect(user).to.have.property('firstName', 'Foobar')));
    }); // it()
  }); // describe()
}); // describe()
