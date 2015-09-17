var utils = require('../../utils/tests'),
    expect = require('chai').expect,
    _ = require('lodash');

var ObjectId = require('mongoose').Types.ObjectId,
    Group = require('../../models/Group');

var groupOwner = ObjectId();
var validGroup = {
  name: 'Group Name',
  owner: groupOwner,
  admins: [groupOwner]
};

describe('Group', () => {
  before(utils.dbConnect);
  after(utils.dbDisconnect);

  describe('#save()', () => {
    afterEach((done) => {
      Group.remove({}, (err) => {
        if (err) { return done(err); }

        done();
      });
    }); // afterEach()

    it('should require name, urlName, owner and admins', (done) => {
      new Group().save((err, group) => {
        expect(err).to.exist.and.to.have.property('name', 'ValidationError');
        expect(err).to.have.deep.property('errors.name.kind', 'required');
        expect(err).to.have.deep.property('errors.urlName.kind', 'required');
        expect(err).to.have.deep.property('errors.owner.kind', 'required');
        expect(err).to.have.deep.property('errors.admins.kind', 'required');
        expect(group).to.not.exist;

        done();
      });
    }); // it()

    it('should require owner to be an admin', (done) => {
      new Group(_.defaults({ owner: ObjectId() }, validGroup)).save((err, group) => {
        expect(err).to.have.deep.property('errors.admins.kind', 'ownerisadmin');
        expect(group).to.not.exist;

        done();
      });
    }); // it()

    it('should create urlName as a kebab case copy of name', (done) => {
      new Group(validGroup).save((err, group) => {
        expect(err).to.not.exist;
        expect(group).to.have.property('urlName', _.kebabCase(validGroup.name));

        done();
      });
    }); // it()

    it('should save a valid Group', (done) => {
      new Group(validGroup).save((err, group) => {
        expect(err).to.not.exist;
        expect(group).to.be.an('object').and.an.instanceof(Group);

        done();
      });
    }); // it()
  }); // describe()

  describe('#getFilter()', () => {
    it('should return an array of strings', () => {
      expect(Group.getFilter()).to.be.an('array').and.have.length.above(0);
    }); // it()
  }); // describe()
}); // describe()
