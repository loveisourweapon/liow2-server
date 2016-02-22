var testUtils = require('../../utils/tests'),
    request = require('supertest-as-promised'),
    expect = require('chai').expect,
    app = require('../../app');

var ObjectId = require('mongoose').Types.ObjectId,
    Group = require('../../models/Group');

var groupId = null;
var groupOwner = ObjectId();
var validGroup = {
  name: 'Group Name',
  owner: groupOwner,
  admins: [groupOwner]
};

describe('/groups', () => {
  before(testUtils.dbConnect);
  after(testUtils.dbDisconnect);
  afterEach(() => Group.remove({}));

  describe('/', () => {
    it('GET should return status 200 and an empty array', () => {
      return request(app)
        .get('/groups')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => expect(res.body).to.be.an('array').and.to.have.lengthOf(0));
    }); // it()

    it('GET should return status 200 and an array', () => {
      return new Group(validGroup).save()
        .then(() => {
          return request(app)
            .get('/groups')
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(res => expect(res.body).to.be.an('array').and.to.have.lengthOf(1));
        });
    }); // it()

    it('POST invalid data should return status 400 and an error message', () => {
      return testUtils.getApiToken()
        .then(token => {
          return request(app)
            .post('/groups')
            .set('Authorization', `Bearer ${token}`)
            .send({})
            .expect(400)
            .expect('Content-Type', /json/)
            .expect(res => expect(res.body).to.have.property('message', 'Group validation failed'));
        });
    }); // it()

    it('POST valid data should return status 201 and the created Group', () => {
      return testUtils.getApiToken()
        .then(token => {
          return request(app)
            .post('/groups')
            .set('Authorization', `Bearer ${token}`)
            .send(validGroup)
            .expect(201)
            .expect('Content-Type', /json/)
            .expect('Location', /groups/)
            .expect(res => expect(res.body).be.be.an('object').and.to.have.property('_id'));
        });
    }); // it()
  }); // describe()

  describe('/:group', () => {
    beforeEach(() => {
      return testUtils.getApiToken()
        .then(token => {
          return request(app)
            .post('/groups')
            .set('Authorization', `Bearer ${token}`)
            .send(validGroup)
            .then(res => groupId = res.body._id);
        });
    }); // beforeEach()

    it('GET invalid ID should return status 400 and an error message', () => {
      return request(app)
        .get('/groups/invalid')
        .expect(400)
        .expect('Content-Type', /json/)
        .expect(res => expect(res.body).to.have.property('message', 'Invalid group'));
    }); // it()

    it('GET non-existent ID should return status 404 and an error message', () => {
      return request(app)
        .get(`/groups/${ObjectId()}`)
        .expect(404)
        .expect('Content-Type', /json/)
        .expect(res => expect(res.body).to.have.property('message', 'Not Found'));
    }); // it()

    it('GET valid ID should return status 200 and a Group', () => {
      return request(app)
        .get(`/groups/${groupId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => expect(res.body).to.have.property('_id', String(groupId)));
    }); // it()

    it('DELETE valid ID should return status 204 and delete the Group', () => {
      return testUtils.getApiToken()
        .then(token => {
          return request(app)
            .delete(`/groups/${groupId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(204)
            .expect(res => expect(res.body).to.be.empty)
            .then(() => Group.findById(groupId).exec())
            .catch(err => expect(err).to.have.property('message', 'Not Found'));
        });
    }); // it()

    it('PUT extra data should be ignored', () => {
      return testUtils.getApiToken()
        .then(token => {
          return request(app)
            .put(`/groups/${groupId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ extra: 'Extra data' })
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(res => {
              expect(res.body).to.have.property('_id', String(groupId));
              expect(res.body).to.not.have.property('extra');
            });
        });
    }); // it()

    it('PUT valid data should return status 200 and update the Group', () => {
      var update = { welcomeMessage: 'Updated text' };

      return testUtils.getApiToken()
        .then(token => {
          return request(app)
            .put(`/groups/${groupId}`)
            .set('Authorization', `Bearer ${token}`)
            .send(update)
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(res => {
              expect(res.body).to.have.property('_id', String(groupId));
              expect(res.body).to.have.property('modified');
              expect(res.body).to.have.property('welcomeMessage', update.welcomeMessage);
            });
        });
    }); // it()
  }); // describe()
}); // describe()
