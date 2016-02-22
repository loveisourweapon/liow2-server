var expect = require('chai').expect,
    utils = require('../../utils/general');

describe('utils/general', () => {
  describe('#HttpError()', () => {
    it('should report it\'s name as HttpError', () => {
      var error = new utils.HttpError();

      expect(error).to.have.property('name', 'HttpError');
    }); // it()

    it('should include a stack trace', () => {
      var error = new utils.HttpError();

      expect(error).to.have.property('stack');
    }); // it()

    it('should have a defaults of message \'Error\' and status 400', () => {
      var error = new utils.HttpError();

      expect(error).to.have.property('message', 'Error');
      expect(error).to.have.property('status', 400);
    }); // it()

    it('should use the message and status code passed in as an arguments', () => {
      var details = {
        message: 'Not Found',
        status: 404
      };
      var error = new utils.HttpError(details.message, details.status);

      expect(error).to.have.property('message', details.message);
      expect(error).to.have.property('status', details.status);
    }); // it()
  }); // describe()

  describe('#isNumeric', () => {
    it('should return true for numbers', () => {
      expect(utils.isNumeric(0)).to.be.true;
      expect(utils.isNumeric(1)).to.be.true;
      expect(utils.isNumeric(-1)).to.be.true;
      expect(utils.isNumeric(999999)).to.be.true;
    }); // it()

    it('should return true for numeric strings', () => {
      expect(utils.isNumeric('0')).to.be.true;
      expect(utils.isNumeric('1')).to.be.true;
      expect(utils.isNumeric('-1')).to.be.true;
      expect(utils.isNumeric('999999')).to.be.true;
    }); // it()

    it('should return false for non-numeric input', () => {
      expect(utils.isNumeric(false)).to.be.false;
      expect(utils.isNumeric('')).to.be.false;
      expect(utils.isNumeric('foo')).to.be.false;
      expect(utils.isNumeric({})).to.be.false;
    }); // it()
  }); // describe()
}); // describe()
