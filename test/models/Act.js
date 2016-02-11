var testUtils = require('../../utils/tests'),
    expect = require('chai').expect;

var ObjectId = require('mongoose').Types.ObjectId,
    Act = require('../../models/Act');

var validAct = {
  user: ObjectId(),
  deed: ObjectId()
};

describe('Act', () => {
  before(testUtils.dbConnect);
  after(testUtils.dbDisconnect);

  describe('#save()', () => {
    afterEach(() => Act.remove({}));

    it('should require user and deed', () => {
      return new Act().save()
        .catch(err => {
          expect(err).to.exist.and.to.have.property('name', 'ValidationError');
          expect(err).to.have.deep.property('errors.user.kind', 'required');
          expect(err).to.have.deep.property('errors.deed.kind', 'required');
        });
    }); // it()

    it('should save a valid Act', () => {
      return new Act(validAct).save()
        .then(act => expect(act).to.be.an('object').and.an.instanceof(Act));
    }); // it()
  }); // describe()

  describe('#getFilter()', () => {
    it('should return an array of strings', () => {
      expect(Act.getFilter()).to.be.an('array').and.have.length.above(0);
    }); // it()
  }); // describe()
}); // describe()
