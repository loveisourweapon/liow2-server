var utils = require('../utils/models'),
    mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId;

var CampaignSchema = new mongoose.Schema({
  group: { type: ObjectId, ref: 'Group', required: true },
  dateStart: Date,
  dateEnd: Date,
  active: { type: Boolean, default: true, required: true },
  deeds: {
    type: [{ type: ObjectId, ref: 'Deed' }],
    required: true,
    validate: [utils.hasOne, 'At least one deed is required', 'hasdeed']
  }
});

CampaignSchema.statics.getFilter = function() {
  return ['dateStart', 'dateEnd', 'active', 'deeds'];
};

module.exports = mongoose.model('Campaign', CampaignSchema);
