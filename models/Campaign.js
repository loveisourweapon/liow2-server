var mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId;

var CampaignSchema = new mongoose.Schema({
  group: { type: ObjectId, ref: 'Group', required: true }
});

module.exports = mongoose.model('Campaign', CampaignSchema);
