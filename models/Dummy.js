var mongoose = require('mongoose');

var Dummy = new mongoose.Schema({
  name: String
});

module.exports = mongoose.model('Dummy', Dummy);
