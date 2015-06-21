var config = require('../../config/config'),
    expect = require('chai').expect,
    mongoose = require('mongoose'),
    Dummy = require('../../models/Dummy');

describe('Dummy model', function() {
  before(function(done) {
    if (mongoose.connection.readyState === 0) {
      mongoose.connect(config.db.url, function(err) {
        if (err) throw err;

        return done();
      });
    } else {
      return done();
    }
  });

  after(function(done) {
    mongoose.connection.close(function(err) {
      if (err) throw err;

      return done();
    });
  });

  beforeEach(function(done) {
    Dummy.remove({}, function(err) {
      if (err) throw err;

      return done();
    });
  });

  afterEach(function(done) {
    Dummy.remove({}, function(err) {
      if (err) throw err;

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
