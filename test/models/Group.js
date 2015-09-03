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

describe('Group', function __describe() {
  before(utils.dbConnect);
  after(utils.dbDisconnect);

  describe('#save()', function __describe() {
    afterEach(function __afterEach(done) {
      Group.remove({}, function __groupRemove(err) {
        if (err) { return done(err); }

        done();
      });
    }); // afterEach()

    it('should require name, url_name, owner and admins', function __it(done) {
      new Group().save(function __groupSave(err, group) {
        expect(err).to.exist.and.to.have.property('name', 'ValidationError');
        expect(err).to.have.deep.property('errors.name.kind', 'required');
        expect(err).to.have.deep.property('errors.url_name.kind', 'required');
        expect(err).to.have.deep.property('errors.owner.kind', 'required');
        expect(err).to.have.deep.property('errors.admins.kind', 'required');
        expect(group).to.not.exist;

        done();
      });
    }); // it()

    it('should require owner to be an admin', function __it(done) {
      new Group(_.defaults({ owner: ObjectId() }, validGroup)).save(function __groupSave(err, group) {
        expect(err).to.have.deep.property('errors.admins.kind', 'ownerisadmin');
        expect(group).to.not.exist;

        done();
      });
    }); // it()

    it('should create url_name as a kebab case copy of name', function __it(done) {
      new Group(validGroup).save(function __groupSave(err, group) {
        expect(err).to.not.exist;
        expect(group).to.have.property('url_name', _.kebabCase(validGroup.name));

        done();
      });
    }); // it()

    it('should save a valid Group', function __it(done) {
      new Group(validGroup).save(function __groupSave(err, group) {
        expect(err).to.not.exist;
        expect(group).to.be.an('object').and.an.instanceof(Group);

        done();
      });
    }); // it()
  }); // describe()

  describe('#getFilter()', function __describe() {
    it('should return an array of strings', function __it() {
      expect(Group.getFilter()).to.be.an('array').and.have.length.above(0);
    }); // it()
  }); // describe()
}); // describe()
