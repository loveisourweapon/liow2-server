var modelUtils = require('../utils/models'),
    mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId;

var DeedPublishSchema = new mongoose.Schema({
  deed: { type: ObjectId, ref: 'Deed', required: true },
  published: { type: Boolean, default: false, required: true }
});

var CampaignSchema = new mongoose.Schema({
  group: { type: ObjectId, ref: 'Group', required: true },
  dateStart: Date,
  dateEnd: Date,
  active: { type: Boolean, default: true, required: true },
  deeds: {
    type: [DeedPublishSchema],
    required: true,
    validate: [modelUtils.hasOne, 'At least one deed is required', 'hasdeed']
  },
  created: { type: Date, default: Date.now, required: true },
  modified: Date
});

CampaignSchema.plugin(modelUtils.findOneOrThrow);

CampaignSchema.statics.getFilter = function () {
  return ['group', 'dateStart', 'dateEnd', 'active', 'deeds'];
};

module.exports = mongoose.model('Campaign', CampaignSchema);
