var _ = require('lodash'),
    testUtils = require('../../utils/tests'),
    expect = require('chai').expect;

var ObjectId = require('mongoose').Types.ObjectId,
    Comment = require('../../models/Comment');

var validComment = {
  user: ObjectId(),
  target: { deed: ObjectId() },
  content: { text: 'Comment text' }
};

describe('Comment', () => {
  before(testUtils.dbConnect);
  after(testUtils.dbDisconnect);

  describe('#save()', () => {
    afterEach(() => Comment.remove({}));

    it('should require user, target and content', () => {
      return new Comment().save()
        .catch(err => {
          expect(err).to.exist.and.to.have.property('name', 'ValidationError');
          expect(err).to.have.deep.property('errors.user.kind', 'required');
          expect(err).to.have.deep.property('errors.target.kind', 'required');
          expect(err).to.have.deep.property('errors.content.kind', 'required');
        });
    }); // it()

    it('should require a single target', () => {
      return new Comment(_.defaults({ target: {} }, validComment)).save()
        .catch(err => {
          expect(err).to.have.deep.property('errors.target.kind', 'onetarget');

          return new Comment(_.defaults({
            target: {
              user: ObjectId(),
              deed: ObjectId()
            }
          }, validComment)).save();
        })
        .catch(err => expect(err).to.have.deep.property('errors.target.kind', 'onetarget'));
    }); // it()

    it('should require content text or image', () => {
      return new Comment(_.defaults({ content: {} }, validComment)).save()
        .catch(err => expect(err).to.have.deep.property('errors.content.kind', 'hascontent'));
    }); // it()

    it('should save a valid Comment', () => {
      return new Comment(validComment).save()
        .then(comment => expect(comment).to.be.an('object').and.an.instanceof(Comment));
    }); // it()
  }); // describe()

  describe('#getFilter()', () => {
    it('should return an array of strings', () => {
      expect(Comment.getFilter()).to.be.an('array').and.have.length.above(0);
    }); // it()
  }); // describe()
}); // describe()
