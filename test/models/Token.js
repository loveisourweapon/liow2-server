var moment = require('moment'),
    testUtils = require('../../utils/tests'),
    expect = require('chai').expect;

var ObjectId = require('mongoose').Types.ObjectId,
    Token = require('../../models/Token');

var validToken = {
  type: 'confirm',
  user: ObjectId()
};

describe('Token', () => {
  before(testUtils.dbConnect);
  after(testUtils.dbDisconnect);

  describe('#save()', () => {
    afterEach(() => Token.remove({}));

    it('should require type, expires and user', () => {
      return new Token().save()
        .catch(err => {
          expect(err).to.exist.and.to.have.property('name', 'ValidationError');
          expect(err).to.have.deep.property('errors.type.kind', 'required');
          expect(err).to.have.deep.property('errors.expires.kind', 'required');
          expect(err).to.have.deep.property('errors.user.kind', 'required');
        });
    }); // it()

    it('should save a valid Token', () => {
      return new Token(validToken).save()
        .then(token => expect(token).to.be.an('object').and.an.instanceof(Token));
    }); // it()

    it('should automatically generate a 24 character token', () => {
      return new Token(validToken).save()
        .then(token => {
          expect(token).to.have.property('token');
          expect(token.token).to.be.a('string').and.to.have.lengthOf(24);
        });
    }); // it()

    it('should automatically generate expires based on type', () => {
      return new Token(validToken).save()
        .then(token => {
          expect(token).to.have.property('expires');
          expect(moment(token.expires).format('ll')).to.equal(moment().add(3, 'days').format('ll'));
        });
    }); // it()
  }); // describe()
}); // describe()
