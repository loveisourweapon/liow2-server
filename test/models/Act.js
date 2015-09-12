var utils = require('../../utils/tests'),
    expect = require('chai').expect;

var ObjectId = require('mongoose').Types.ObjectId;
    Act = require('../../models/Act');

var validAct = {
  user: ObjectId(),
  group: ObjectId(),
  deed: ObjectId(),
};

describe('Act', () => {
  before(utils.dbConnect);
  after(utils.dbDisconnect);

  describe('#save()', () => {
    afterEach((done) => {
      Act.remove({}, (err) => {
        if (err) { return done(err); }

        done();
      });
    }); // afterEach()

    it('should require user, group and deed', (done) => {
      new Act().save((err, act) => {
        expect(err).to.exist.and.to.have.property('name', 'ValidationError');
        expect(err).to.have.deep.property('errors.user.kind', 'required');
        expect(err).to.have.deep.property('errors.group.kind', 'required');
        expect(err).to.have.deep.property('errors.deed.kind', 'required');
        expect(act).to.not.exist;

        done();
      });
    }); // it()

    it('should save a valid Act', (done) => {
      new Act(validAct).save((err, act) => {
        expect(err).to.not.exist;
        expect(act).to.be.an('object').and.an.instanceof(Act);

        done();
      });
    }); // it()
  }); // describe()

  describe('#getFilter()', () => {
    it('should return an array of strings', () => {
      expect(Act.getFilter()).to.be.an('array').and.have.length.above(0);
    }); // it()
  }); // describe()
}); // describe()
