var testUtils = require('../../utils/tests'),
    request = require('supertest-as-promised'),
    expect = require('chai').expect,
    app = require('../../app');

var ObjectId = require('mongoose').Types.ObjectId,
    User = require('../../models/User'),
    Group = require('../../models/Group');

describe('/users', () => {
  before(testUtils.dbConnect);
  after(testUtils.dbDisconnect);
  afterEach(testUtils.removeUsers);

  describe('/', () => {
    it('GET should return status 200 and an empty array', () => {
      return request(app)
        .get('/users')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => expect(res.body).to.be.an('array').and.to.have.lengthOf(0));
    }); // it()

    it('GET should return status 200 and an array', () => {
      return testUtils.saveUser(testUtils.credentials)
        .then(() => request(app)
          .get('/users')
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(res => expect(res.body).to.be.an('array').and.to.have.lengthOf(1)));
    }); // it()

    it('GET should return a count of the number of users', () => {
      return testUtils.saveUser(testUtils.credentials)
        .then(() => request(app)
          .get('/users?count=true')
          .expect(200)
          .expect('Content-Type', /html/)
          .expect(res => expect(res).to.have.property('text', '1')));
    }); // it()

    it('POST invalid data should return status 400 and an error message', () => {
      return request(app)
        .post('/users')
        .send({})
        .expect(400)
        .expect('Content-Type', /json/)
        .expect(res => expect(res.body).to.have.property('message', 'User validation failed'));
    }); // it()

    it('POST valid data should return status 201 and the created User', () => {
      return request(app)
        .post('/users')
        .send(testUtils.credentials)
        .expect(201)
        .expect('Content-Type', /json/)
        .expect('Location', /users/)
        .expect(res => expect(res.body).be.be.an('object').and.to.have.property('_id'));
    }); // it()
  }); // describe()

  describe('/me', () => {
    var user = null;
    beforeEach(() => testUtils.saveUser(testUtils.credentials).then(newUser => (user = newUser)));

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
    beforeEach(() => testUtils.saveUser(testUtils.credentials).then(newUser => (user = newUser)));

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

    it('PUT extra data should be ignored', () => {
      return testUtils.getApiToken()
        .then(token => request(app)
          .put(`/users/${user.id}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ extra: 'Extra data' })
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(res => {
            expect(res.body).to.have.property('_id', user.id);
            expect(res.body).to.not.have.property('extra');
          }));
    }); // it()

    it('PUT valid data should return status 200 and update the User', () => {
      var update = { firstName: 'Foobar' };

      return testUtils.getApiToken()
        .then(token => request(app)
          .put(`/users/${user.id}`)
          .set('Authorization', `Bearer ${token}`)
          .send(update)
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(res => {
            expect(res.body).to.have.property('_id', user.id);
            expect(res.body).to.have.property('modified');
            expect(res.body).to.have.property('firstName', update.firstName);
          }));
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
