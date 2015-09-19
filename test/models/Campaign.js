var utils = require('../../utils/tests'),
    expect = require('chai').expect,
    _ = require('lodash');

var ObjectId = require('mongoose').Types.ObjectId,
    Campaign = require('../../models/Campaign');

var validCampaign = {
  group: ObjectId(),
  deeds: [ObjectId()]
};

describe('Campaign', () => {
  before(utils.dbConnect);
  after(utils.dbDisconnect);

  describe('#save()', () => {
    afterEach((done) => {
      Campaign.remove({}, (err) => {
        if (err) { return done(err); }

        done();
      });
    }); // afterEach()

    it('should require group and deeds', (done) => {
      new Campaign().save((err, campaign) => {
        expect(err).to.exist.and.to.have.property('name', 'ValidationError');
        expect(err).to.have.deep.property('errors.group.kind', 'required');
        expect(err).to.have.deep.property('errors.deeds.kind', 'required');
        expect(campaign).to.not.exist;

        done();
      });
    }); // it()

    it('should require at least one deed', (done) => {
      new Campaign(_.defaults({ deeds: [] }, validCampaign)).save((err, campaign) => {
        expect(err).to.have.deep.property('errors.deeds.kind', 'required');
        expect(campaign).to.not.exist;

        done();
      });
    }); // it()

    it('should save a valid Campaign', (done) => {
      new Campaign(validCampaign).save((err, campaign) => {
        expect(err).to.not.exist;
        expect(campaign).to.be.an('object').and.an.instanceof(Campaign);

        done();
      });
    }); // it()

    it('should default active to true', (done) => {
      new Campaign(validCampaign).save((err, campaign) => {
        expect(err).to.not.exist;
        expect(campaign).to.have.property('active', true);

        done();
      });
    }); // it()
  }); // describe()

  describe('#getFilter()', () => {
    it('should return an array of strings', () => {
      expect(Campaign.getFilter()).to.be.an('array').and.have.length.above(0);
    }); // it()
  }); // describe()
}); // describe()
