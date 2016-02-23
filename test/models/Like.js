var _ = require('lodash'),
    testUtils = require('../../utils/tests'),
    expect = require('chai').expect;

var ObjectId = require('mongoose').Types.ObjectId,
    Like = require('../../models/Like');

var validLike = {
  user: ObjectId(),
  target: {
    deed: ObjectId()
  }
};

describe('Like', () => {
  before(testUtils.dbConnect);
  after(testUtils.dbDisconnect);

  describe('#save()', () => {
    afterEach(() => Like.remove({}));

    it('should require user and target', () => {
      return new Like().save()
        .catch(err => {
          expect(err).to.exist.and.to.have.property('name', 'ValidationError');
          expect(err).to.have.deep.property('errors.user.kind', 'required');
          expect(err).to.have.deep.property('errors.target.kind', 'required');
        });
    }); // it()

    it('should require a single target', () => {
      return new Like(_.defaults({ target: {} }, validLike)).save()
        .catch(err => {
          expect(err).to.exist.and.to.have.deep.property('errors.target.kind', 'onetarget');

          return new Like(_.defaults({
            target: {
              deed: ObjectId(),
              act: ObjectId()
            }
          }, validLike)).save();
        })
        .catch(err => expect(err).to.exist.and.to.have.deep.property('errors.target.kind', 'onetarget'));
    }); // it()

    it('should save a valid Like', () => {
      return new Like(validLike).save()
        .then(like => expect(like).to.be.an('object').and.an.instanceof(Like));
    }); // it()
  }); // describe()

  describe('#getFilter()', () => {
    it('should return an array of strings', () => {
      expect(Like.getFilter()).to.be.an('array');
    }); // it()
  }); // describe()
}); // describe()
