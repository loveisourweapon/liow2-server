var config = require('../../config/config'),
    expect = require('chai').expect,
    mongoose = require('mongoose'),
    Dummy = require('../../models/Dummy');

describe('Dummy model', function() {
  beforeEach(function (done) {
    function clearDB() {
      for (var i in mongoose.connection.collections) {
        mongoose.connection.collections[i].remove();
      }
    }

    if (mongoose.connection.readyState === 0) {
      mongoose.connect(config.db, function (err) {
        if (err) throw err;
        clearDB();
        return done();
      });
    } else {
      clearDB();
      return done();
    }
  });

  afterEach(function (done) {
    mongoose.disconnect(function() {
      return done();
    });
  });

  it('should create a new Dummy', function () {
    var dummy = new Dummy({ name: 'test' });

    expect(dummy).to.be.an('object');
    expect(dummy).to.be.an.instanceof(Dummy);
    expect(dummy.name).to.equal('test');
  });
});
