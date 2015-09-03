var utils = require('../../utils/tests'),
    expect = require('chai').expect;

var ObjectId = require('mongoose').Types.ObjectId;
    Act = require('../../models/Act');

var validAct = {
  user: ObjectId(),
  group: ObjectId(),
  deed: ObjectId(),
};

describe('Act', function __describe() {
  before(utils.dbConnect);
  after(utils.dbDisconnect);

  describe('#save()', function __describe() {
    afterEach(function __afterEach(done) {
      Act.remove({}, function __actRemove(err) {
        if (err) { return done(err); }

        done();
      });
    }); // afterEach()

    it('should require user, group and deed', function __it(done) {
      new Act().save(function __actSave(err, act) {
        expect(err).to.exist.and.to.have.property('name', 'ValidationError');
        expect(err).to.have.deep.property('errors.user.kind', 'required');
        expect(err).to.have.deep.property('errors.group.kind', 'required');
        expect(err).to.have.deep.property('errors.deed.kind', 'required');
        expect(act).to.not.exist;

        done();
      });
    }); // it()

    it('should save a valid Act', function __it(done) {
      new Act(validAct).save(function __actSave(err, act) {
        expect(err).to.not.exist;
        expect(act).to.be.an('object').and.an.instanceof(Act);

        done();
      });
    }); // it()
  }); // describe()

  describe('#getFilter()', function __describe() {
    it('should return an array of strings', function __it() {
      expect(Act.getFilter()).to.be.an('array').and.have.length.above(0);
    }); // it()
  }); // describe()
}); // describe()
