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

describe('/countries', () => {
  before(utils.dbConnect);
  after(utils.dbDisconnect);

  beforeEach((done) => {
    new Country(validCountry).save((err, country) => {
      if (err) { return done(err); }

      countryId = country._id;

      done();
    });
  }); // beforeEach()

  afterEach((done) => {
    Country.remove({}, (err) => {
      if (err) { return done(err); }

      done();
    });
  }); // afterEach()

  describe('/', () => {
    it('GET should return status 200 and an array', (done) => {
      request(app)
        .get('/countries')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body).to.be.an('array');
        })
        .end(done);
    }); // it()
  }); // describe()

  describe('/:country', () => {
    it('GET non-existent ID should return status 400 and an error message', (done) => {
      request(app)
        .get(`/countries/${ObjectId()}`)
        .expect(400)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body).to.have.property('message');
        })
        .end(done);
    }); // it()

    it('GET valid ID should return status 200 and a Country', (done) => {
      request(app)
        .get(`/countries/${countryId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body).to.have.property('_id', countryId.toString());
        })
        .end(done);
    }); // it()
  }); // describe()

  describe('/:country/groups', () => {
    it('GET should return status 200 and an array', (done) => {
      request(app)
        .get(`/countries/${countryId}/groups`)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body).to.be.an('array');
        })
        .end(done);
    }); // it()
  }); // describe()
}); // describe()
