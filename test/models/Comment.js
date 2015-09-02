var utils = require('../../utils/tests'),
    expect = require('chai').expect,
    _ = require('lodash');

var ObjectId = require('mongoose').Types.ObjectId,
    Comment = require('../../models/Comment');

var validComment = {
  user: ObjectId(),
  target: {
    deed: ObjectId()
  },
  content: {
    text: 'Comment text'
  }
};

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

    it('should require user, target and content', function __it(done) {
      new Comment().save(function __commentSave(err, comment) {
        expect(err).to.exist.and.to.have.property('name', 'ValidationError');
        expect(err).to.have.deep.property('errors.user.kind', 'required');
        expect(err).to.have.deep.property('errors.target.kind', 'required');
        expect(err).to.have.deep.property('errors.content.kind', 'required');
        expect(comment).to.not.exist;

        done();
      });
    }); // it()

    it('should require a single target', function __it(done) {
      new Comment(_.defaults({ target: {} }, validComment)).save(function __commentSave(err, comment) {
        expect(err).to.have.deep.property('errors.target.kind', 'onetarget');
        expect(comment).to.not.exist;

        new Comment(
          _.defaults({
            target: {
              user: ObjectId(),
              deed: ObjectId()
            }
          }, validComment)
        ).save(function __commentSave(err, comment) {
          expect(err).to.have.deep.property('errors.target.kind', 'onetarget');
          expect(comment).to.not.exist;

          done();
        });
      });
    }); // it()

    it('should require content text or image', function __it(done) {
      new Comment(_.defaults({ content: {} }, validComment)).save(function __commentSave(err, comment) {
        expect(err).to.have.deep.property('errors.content.kind', 'hascontent');
        expect(comment).to.not.exist;

        done();
      });

    }); // it()

    it('should save a valid Comment', function __it(done) {
      new Comment(validComment).save(function __commentSave(err, comment) {
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
