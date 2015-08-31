var utils = require('../../utils/tests'),
    expect = require('chai').expect;

var ObjectId = require('mongoose').Types.ObjectId,
    Comment = require('../../models/Comment');

describe('Comment', function __describe() {
  before(utils.dbConnect);
  after(utils.dbDisconnect);

  describe('#save()', function __describe() {
    afterEach(function __afterEach(done) {
      Comment.remove({}, function __commentRemove(err) {
        if (err) { return done(err); }

        done();
      });
    }); // afterEach()

    it('should require user and target', function __it(done) {
      var comment = new Comment();

      comment.save(function __commentSave(err, comment) {
        expect(err).to.exist.and.to.have.property('name', 'ValidationError');
        expect(err).to.have.deep.property('errors.user.kind', 'required');
        expect(err).to.have.deep.property('errors.target.kind', 'required');
        expect(comment).to.not.exist;

        done();
      });
    }); // it()

    it('should require a single target', function __it(done) {
      var comment = new Comment({
        user: ObjectId(),
        target: {}
      });

      comment.save(function __commentSave(err, comment) {
        expect(err).to.have.deep.property('errors.target.kind', 'onetarget');
        expect(comment).to.not.exist;

        comment = new Comment({
          user: ObjectId(),
          target: {
            user: ObjectId(),
            deed: ObjectId()
          }
        });

        comment.save(function __commentSave(err, comment) {
          expect(err).to.have.deep.property('errors.target.kind', 'onetarget');
          expect(comment).to.not.exist;

          done();
        });
      });
    }); // it()

    it('should save a valid Comment', function __it(done) {
      var comment = new Comment({
        user: ObjectId(),
        target: { deed: ObjectId() }
      });

      comment.save(function __commentSave(err, comment) {
        expect(err).to.not.exist;
        expect(comment).to.be.an('object').and.an.instanceof(Comment);

        done();
      });
    }); // it()
  }); // describe()

  describe('#getFilter()', function __describe() {
    it('should return an array of strings', function __it(done) {
      var filter = Comment.getFilter();

      expect(filter).to.be.an('array').and.have.length.above(0);

      done();
    }); // it()
  }); // describe()
}); // describe()
