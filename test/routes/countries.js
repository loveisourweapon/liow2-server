var testUtils = require('../../utils/tests'),
    request = require('supertest-as-promised'),
    expect = require('chai').expect,
    app = require('../../app');

var ObjectId = require('mongoose').Types.ObjectId,
    Country = require('../../models/Country');

var validCountry = {
  name: 'Australia',
  code: 'AU'
};

describe('/countries', () => {
  before(testUtils.dbConnect);
  after(testUtils.dbDisconnect);
  afterEach(() => Country.remove({}));

  describe('/', () => {
    it('GET should return status 200 and an array', () => {
      return request(app)
        .get('/countries')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => expect(res.body).to.be.an('array'));
    }); // it()
  }); // describe()

  describe('/:country', () => {
    var countryId = null;

    beforeEach(() => {
      return new Country(validCountry).save()
        .then(country => (countryId = country._id));
    }); // beforeEach()

    it('GET non-existent ID should return status 404 and an error message', () => {
      return request(app)
        .get(`/countries/${ObjectId()}`)
        .expect(404)
        .expect('Content-Type', /json/)
        .expect(res => expect(res.body).to.have.property('message', 'Not Found'));
    }); // it()

    it('GET valid ID should return status 200 and a Country', () => {
      return request(app)
        .get(`/countries/${countryId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => expect(res.body).to.have.property('_id', String(countryId)));
    }); // it()

    describe('/:country/groups', () => {
      it('GET should return status 200 and an array', () => {
        return request(app)
          .get(`/countries/${countryId}/groups`)
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(res => expect(res.body).to.be.an('array'));
      }); // it()
    }); // describe()
  }); // describe()
}); // describe()
