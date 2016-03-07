var testUtils = require('../../utils/tests'),
    request = require('supertest-as-promised'),
    expect = require('chai').expect,
    app = require('../../app');

var ObjectId = require('mongoose').Types.ObjectId,
    User = require('../../models/User'),
    Group = require('../../models/Group');

describe('/users', () => {
  var user = null;

  before(() => {
    return testUtils.dbConnect()
      .then(() => testUtils.saveUser(testUtils.credentials))
      .then(newUser => (user = newUser));
  });
  after(() => testUtils.removeUsers().then(testUtils.dbDisconnect));

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
            expect(res.body).to.have.property('firstName', testUtils.credentials.firstName);
          }));
    }); // it()

    it('GET should populate a linked group', () => {
      var group = null;

      return new Group({ name: 'Group', owner: user._id, admins: [user._id] }).save()
        .then(newGroup => (group = newGroup))
        .then(() => User.findOne({ email: testUtils.credentials.email }).exec())
        .then(user => {
          user.groups.push(group._id);
          return user.save();
        })
        .then(testUtils.getApiToken)
        .then(token => request(app)
          .get('/users/me')
          .set('Authorization', `Bearer ${token}`)
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(res => expect(res.body).to.have.deep.property('groups[0]._id', group.id))
          .then(() => Group.remove({})));
    }); // it()
  }); // describe()

  describe('/:user', () => {
    var user = null;

    beforeEach(() => {
      return User.findOne({ email: testUtils.credentials.email }).exec()
        .then(newUser => (user = newUser));
    }); // beforeEach()

    it('GET invalid ID should return status 400 and an error message', () => {
      return request(app)
        .get('/users/invalid')
        .expect(400)
        .expect('Content-Type', /json/)
        .expect(res => expect(res.body).to.have.property('message', 'Invalid user'));
    }); // it()

    it('GET non-existent ID should return status 404 and an error message', () => {
      return request(app)
        .get(`/users/${ObjectId()}`)
        .expect(404)
        .expect('Content-Type', /json/)
        .expect(res => expect(res.body).to.have.property('message', 'Not Found'));
    }); // it()

    it('GET valid ID should return status 200 and a User', () => {
      return request(app)
        .get(`/users/${user.id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => expect(res.body).to.have.property('_id', user.id));
    }); // it()

    it('PATCH extra data should be ignored', () => {
      return testUtils.getApiToken()
        .then(token => request(app)
          .patch(`/users/${user.id}`)
          .set('Authorization', `Bearer ${token}`)
          .send([{ op: 'add', path: '/extra', value: 'data' }])
          .expect(200)
          .expect(res => expect(res.body).to.have.property('_id', user.id))
          .then(() => User.findById(user._id).exec())
          .then(user => expect(user).to.not.have.property('extra')));
    }); // it()

    it('PATCH valid data should return status 204 and update the User', () => {
      return User.findById(user._id).exec()
        .then(user => expect(user).to.have.property('firstName', testUtils.credentials.firstName))
        .then(testUtils.getApiToken)
        .then(token => request(app)
          .patch(`/users/${user.id}`)
          .set('Authorization', `Bearer ${token}`)
          .send([{ op: 'replace', path: '/firstName', value: 'Foobar' }])
          .expect(200)
          .expect(res => expect(res.body).to.have.property('_id', user.id))
          .then(() => User.findById(user._id).exec())
          .then(user => expect(user).to.have.property('firstName', 'Foobar')));
    }); // it()
  }); // describe()
}); // describe()
