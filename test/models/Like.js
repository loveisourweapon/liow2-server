var utils = require('../../utils/tests'),
    expect = require('chai').expect,
    _ = require('lodash');

var ObjectId = require('mongoose').Types.ObjectId,
    Like = require('../../models/Like');

var validLike = {
  user: ObjectId(),
  target: {
    deed: ObjectId()
  }
};

describe('Like', () => {
  before(utils.dbConnect);
  after(utils.dbDisconnect);

  describe('#save()', () => {
    afterEach((done) => {
      Like.remove({}, (err) => {
        if (err) { return done(err); }

        done();
      });
    }); // afterEach()

    it('should require user and target', (done) => {
      new Like().save((err, like) => {
        expect(err).to.exist.and.to.have.property('name', 'ValidationError');
        expect(err).to.have.deep.property('errors.user.kind', 'required');
        expect(err).to.have.deep.property('errors.target.kind', 'required');
        expect(like).to.not.exist;

        done();
      });
    }); // it()

    it('should require a single target', (done) => {
      new Like(_.defaults({ target: {} }, validLike)).save((err, like) => {
        expect(err).to.exist.and.to.have.deep.property('errors.target.kind', 'onetarget');
        expect(like).to.not.exist;

        new Like(
          _.defaults({
            target: {
              deed: ObjectId(),
              act: ObjectId()
            }
          }, validLike)
        ).save((err, like) => {
          expect(err).to.exist.and.to.have.deep.property('errors.target.kind', 'onetarget');
          expect(like).to.not.exist;

          done();
        });
      });
    }); // it()

    it('should save a valid Like', (done) => {
      new Like(validLike).save((err, like) => {
        expect(err).to.not.exist;
        expect(like).to.be.an('object').and.an.instanceof(Like);

        done();
      });
    }); // it()
  }); // describe()

  describe('#getFilter()', () => {
    it('should return an array of strings', () => {
      expect(Like.getFilter()).to.be.an('array').and.have.length.above(0);
    }); // it()
  }); // describe()
}); // describe()
