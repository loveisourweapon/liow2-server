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
    var country = new Country(validCountry);

    country.save(function __countrySave(err, country) {
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

  describe('/ GET', function __describe() {
    it('should return status 200 and an array', function __it(done) {
      request(app)
        .get('/countries')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function __requestEnd(err, res) {
          if (err) { return done(err); }

          expect(res.body).to.be.an('array');

          done();
        });
    }); // it()
  }); // describe()

  describe('/:country_id GET', function __describe() {
    it('should return status 400 and an error message', function __it(done) {
      request(app)
        .get('/countries/' + ObjectId())
        .expect('Content-Type', /json/)
        .expect(400)
        .end(function __requestEnd(err, res) {
          if (err) { return done(err); }

          expect(res.body).to.have.property('message');

          done();
        });
    }); // it()

    it('should return status 200 and an object', function __it(done) {
      request(app)
        .get('/countries/' + countryId)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function __requestEnd(err, res) {
          if (err) { return done(err); }

          expect(res.body).to.be.an('object');

          done();
        });
    }); // it()
  }); // describe()

  describe('/:country_id/groups', function __describe() {
    it('should return status 200 and an array', function __it(done) {
      request(app)
        .get('/countries/' + countryId + '/groups')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function __requestEnd(err, res) {
          if (err) { return done(err); }

          expect(res.body).to.be.an('array');

          done();
        });
    }); // it()
  }); // describe()
}); // describe()
