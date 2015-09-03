var utils = require('../../utils/tests'),
    request = require('supertest'),
    expect = require('chai').expect,
    app = require('../../app');

var ObjectId = require('mongoose').Types.ObjectId,
    Country = require('../../models/Country'),
    countryId = null;

var validCountry = {
  name: 'Australia',
  code: 'AU'
};

describe('/countries', function __describe() {
  before(utils.dbConnect);
  after(utils.dbDisconnect);

  beforeEach(function __beforeEach(done) {
    new Country(validCountry).save(function __countrySave(err, country) {
      if (err) { return done(err); }

      countryId = country._id;

      done();
    });
  }); // beforeEach()

  afterEach(function __afterEach(done) {
    Country.remove({}, function __countryRemove(err) {
      if (err) { return done(err); }

      done();
    });
  }); // afterEach()

  describe('/', function __describe() {
    it('GET should return status 200 and an array', function __it(done) {
      request(app)
        .get('/countries')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(function __expect(res) {
          expect(res.body).to.be.an('array');
        })
        .end(done);
    }); // it()
  }); // describe()

  describe('/:country', function __describe() {
    it('GET non-existent ID should return status 400 and an error message', function __it(done) {
      request(app)
        .get('/countries/' + ObjectId())
        .expect(400)
        .expect('Content-Type', /json/)
        .expect(function __expect(res) {
          expect(res.body).to.have.property('message');
        })
        .end(done);
    }); // it()

    it('GET valid ID should return status 200 and a Country', function __it(done) {
      request(app)
        .get('/countries/' + countryId)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(function __expect(res) {
          expect(res.body).to.be.an('object').and.to.have.property('_id');
        })
        .end(done);
    }); // it()
  }); // describe()

  describe('/:country/groups', function __describe() {
    it('GET should return status 200 and an array', function __it(done) {
      request(app)
        .get('/countries/' + countryId + '/groups')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(function __expect(res) {
          expect(res.body).to.be.an('array');
        })
        .end(done);
    }); // it()
  }); // describe()
}); // describe()
