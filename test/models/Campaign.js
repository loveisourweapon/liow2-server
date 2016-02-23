var _ = require('lodash'),
    testUtils = require('../../utils/tests'),
    expect = require('chai').expect;

var ObjectId = require('mongoose').Types.ObjectId,
    Campaign = require('../../models/Campaign');

var validCampaign = {
  group: ObjectId(),
  deeds: [{ deed: ObjectId() }]
};

describe('Campaign', () => {
  before(testUtils.dbConnect);
  after(testUtils.dbDisconnect);

  describe('#save()', () => {
    afterEach(() => Campaign.remove({}));

    it('should require group and deeds', () => {
      return new Campaign().save()
        .catch(err => {
          expect(err).to.exist.and.to.have.property('name', 'ValidationError');
          expect(err).to.have.deep.property('errors.group.kind', 'required');
          expect(err).to.have.deep.property('errors.deeds.kind', 'required');
        });
    }); // it()

    it('should require at least one deed', () => {
      return new Campaign(_.defaults({ deeds: [] }, validCampaign)).save()
        .catch(err => expect(err).to.have.deep.property('errors.deeds.kind', 'required'));
    }); // it()

    it('should save a valid Campaign', () => {
      return new Campaign(validCampaign).save()
        .then(campaign => expect(campaign).to.be.an('object').and.an.instanceof(Campaign));
    }); // it()

    it('should default active to true', () => {
      return new Campaign(validCampaign).save()
        .then(campaign => expect(campaign).to.have.property('active', true));
    }); // it()
  }); // describe()

  describe('#getFilter()', () => {
    it('should return an array of strings', () => {
      expect(Campaign.getFilter()).to.be.an('array').and.have.length.above(0);
    }); // it()
  }); // describe()
}); // describe()
