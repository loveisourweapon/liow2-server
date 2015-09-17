var expect = require('chai').expect,
    utils = require('../../utils/models');

describe('utils/models', () => {
  describe('#oneOf()', () => {
    it('should return an error when the first parameter isn\'t an Object', () => {
      var result = utils.oneOf(null, ['one', 'two']);

      expect(result).to.be.an.instanceof(Error).and.to.have.property('message', 'Object should be type Object');
    }); // it()

    it('should return an error when the second parameter isn\'t an Array', () => {
      var result = utils.oneOf({ one: 'first' }, 'one');

      expect(result).to.be.an.instanceof(Error).and.to.have.property('message', 'Properties should be an Array of Strings');
    }); // it()

    it('should return false when the object contains none of the properties', () => {
      var result = utils.oneOf({
        three: 'third'
      }, ['one', 'two']);

      expect(result).to.be.a('boolean').and.to.equal(false);
    }); // it()

    it('should return false when the object contains more than one of the properties', () => {
      var result = utils.oneOf({
        one: 'first',
        two: 'second'
      }, ['one', 'two', 'three']);

      expect(result).to.be.a('boolean').and.to.equal(false);
    }); // it()

    it('should return true when the object contains exactly one of the properties', () => {
      var result = utils.oneOf({
        two: 'second'
      }, ['one', 'two', 'three']);

      expect(result).to.be.a('boolean').and.to.equal(true);
    }); // it()
  }); // describe()

  describe('#hasOne()', () => {
    it('should return an error when not passed an array', () => {
      var result = utils.hasOne('string');

      expect(result).to.be.an.instanceOf(Error).and.to.have.property('message', 'Property should be an Array');
    }); // it()

    it('should return false when passed an empty array', () => {
      var result = utils.hasOne([]);

      expect(result).to.be.a('boolean').and.to.equal(false);
    }); // it()

    it('should return true when passed an array with at least one item', () => {
      var result = utils.hasOne([1]);

      expect(result).to.be.a('boolean').and.to.equal(true);
    }); // it()
  }); // describe()
}); // describe()
