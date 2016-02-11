var _ = require('lodash'),
    testUtils = require('../../utils/tests'),
    expect = require('chai').expect;

var ObjectId = require('mongoose').Types.ObjectId,
    Group = require('../../models/Group');

var groupOwner = ObjectId();
var validGroup = {
  name: 'Group Name',
  owner: groupOwner,
  admins: [groupOwner]
};

describe('Group', () => {
  before(testUtils.dbConnect);
  after(testUtils.dbDisconnect);

  describe('#save()', () => {
    afterEach(() => Group.remove({}));

    it('should require name, urlName, owner and admins', () => {
      return new Group().save()
        .catch(err => {
          expect(err).to.exist.and.to.have.property('name', 'ValidationError');
          expect(err).to.have.deep.property('errors.name.kind', 'required');
          expect(err).to.have.deep.property('errors.urlName.kind', 'required');
          expect(err).to.have.deep.property('errors.owner.kind', 'required');
          expect(err).to.have.deep.property('errors.admins.kind', 'required');
        });
    }); // it()

    it('should require owner to be an admin', () => {
      return new Group(_.defaults({ owner: ObjectId() }, validGroup)).save()
        .catch(err => expect(err).to.have.deep.property('errors.admins.kind', 'ownerisadmin'));
    }); // it()

    it('should save a valid Group', () => {
      return new Group(validGroup).save()
        .then(group => expect(group).to.be.an('object').and.an.instanceof(Group));
    }); // it()

    it('should create urlName as a kebab case copy of name', () => {
      return new Group(validGroup).save()
        .then(group => expect(group).to.have.property('urlName', _.kebabCase(validGroup.name)));
    }); // it()
  }); // describe()

  describe('#getFilter()', () => {
    it('should return an array of strings', () => {
      expect(Group.getFilter()).to.be.an('array').and.have.length.above(0);
    }); // it()
  }); // describe()

  describe('#getSearchable()', () => {
    it('should return an array of strings', () => {
      expect(Group.getSearchable()).to.be.an('array').and.have.length.above(0);
    }); // it()
  }); // describe()
}); // describe()
