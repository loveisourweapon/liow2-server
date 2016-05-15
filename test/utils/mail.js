var assign = require('lodash/assign'),
    mailUtils = require('../../utils/mail'),
    testUtils = require('../../utils/tests'),
    expect = require('chai').expect;

var ObjectId = require('mongoose').Types.ObjectId,
    Token = require('../../models/Token');

describe('utils/mail', () => {
  before(testUtils.dbConnect);
  after(testUtils.dbDisconnect);
  afterEach(() => Token.remove({}));

  var user = assign({
    _id: ObjectId(),
    name: `${testUtils.credentials.firstName} ${testUtils.credentials.lastName}`
  }, testUtils.credentials);

  describe('#sendConfirmEmail()', () => {
    it('should send the confirm email address email', () => {
      return mailUtils.sendConfirmEmail(user)
        .then(data => {
          expect(data).to.have.property('text');
          expect(data).to.have.property('html');
          expect(data.subject).to.equal('Confirm your Love is our Weapon registration');
        });
    }); // it()

    it('should send the email to the specified user', () => {
      return mailUtils.sendConfirmEmail(user)
        .then(data => expect(data.to).to.match(new RegExp(testUtils.credentials.email)));
    }); // it()
  }); // describe()

  describe('#sendPasswordReset()', () => {
    it('should send the password reset email', () => {
      return mailUtils.sendPasswordReset(user)
        .then(data => {
          expect(data).to.have.property('text');
          expect(data).to.have.property('html');
          expect(data.subject).to.equal('Reset your Love is our Weapon password');
        });
    }); // it()

    it('should send the email to the specified user', () => {
      return mailUtils.sendPasswordReset(user)
        .then(data => expect(data.to).to.match(new RegExp(testUtils.credentials.email)));
    }); // it()
  }); // describe()
}); // describe()
