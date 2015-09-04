var expect = require('chai').expect,
    oneOf = require('../../utils/models').oneOf;

describe('utils/models', function __describe() {
  describe('#oneOf()', function __describe() {
    it('should return an error when the first parameter isn\'t an Object', function __it() {
      var result = oneOf(null, ['one', 'two']);

      expect(result).to.be.an.instanceof(Error).and.to.have.property('message', 'Object should be type Object');
    }); // it()

    it('should return an error when the second parameter isn\'t an Array', function __it() {
      var result = oneOf({ one: 'first' }, 'one');

      expect(result).to.be.an.instanceof(Error).and.to.have.property('message', 'Properties should be an Array of Strings');
    }); // it()

    it('should return false when the object contains none of the properties', function __it() {
      var result = oneOf({
        three: 'third'
      }, ['one', 'two']);

      expect(result).to.be.a('boolean').and.to.equal(false);
    }); // it()

    it('should return false when the object contains more than one of the properties', function __it() {
      var result = oneOf({
        one: 'first',
        two: 'second'
      }, ['one', 'two', 'three']);

      expect(result).to.be.a('boolean').and.to.equal(false);
    }); // it()

    it('should return true when the object contains exactly one of the properties', function __it() {
      var result = oneOf({
        two: 'second'
      }, ['one', 'two', 'three']);

      expect(result).to.be.a('boolean').and.to.equal(true);
    }); // it()
  }); // describe()
}); // describe()
