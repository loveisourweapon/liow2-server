var utils = require('../../utils/tests'),
    expect = require('chai').expect;

var ObjectId = require('mongoose').Types.ObjectId,
    Like = require('../../models/Like');

describe('Like', function __describe() {
  before(utils.dbConnect);
  after(utils.dbDisconnect);

  describe('#save()', function __describe() {
    afterEach(function __afterEach(done) {
      Like.remove({}, function __likeRemove(err) {
        if (err) { return done(err); }

        done();
      });
    }); // afterEach()

    it('should require user and target', function __it(done) {
      var like = new Like();

      like.save(function __likeSave(err, like) {
        expect(err).to.exist.and.to.have.property('name', 'ValidationError');
        expect(err).to.have.deep.property('errors.user.kind', 'required');
        expect(err).to.have.deep.property('errors.target.kind', 'required');
        expect(like).to.not.exist;

        done();
      });
    }); // it()

    it('should require a single target', function __it(done) {
      var like = new Like({
        user: ObjectId(),
        target: {}
      });

      like.save(function __likeSave(err, like) {
        expect(err).to.exist.and.to.have.deep.property('errors.target.kind', 'onetarget');
        expect(like).to.not.exist;

        like = new Like({
          user: ObjectId(),
          target: {
            deed: ObjectId(),
            act: ObjectId()
          }
        });

        like.save(function __likeSave(err, like) {
          expect(err).to.exist.and.to.have.deep.property('errors.target.kind', 'onetarget');
          expect(like).to.not.exist;

          done();
        });
      });
    }); // it()

    it('should save a valid Like', function __it(done) {
      var like = new Like({
        user: ObjectId(),
        target: { deed: ObjectId() }
      });

      like.save(function __likeSave(err, like) {
        expect(err).to.not.exist;
        expect(like).to.be.an('object').and.an.instanceof(Like);

        done();
      });
    }); // it()
  }); // describe()

  describe('#getFilter()', function __describe() {
    it('should return an array of strings', function __it(done) {
      var filter = Like.getFilter();

      expect(filter).to.be.an('array').and.have.length.above(0);

      done();
    }); // it()
  }); // describe()
}); // describe()
