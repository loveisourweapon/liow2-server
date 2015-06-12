var _ = require('lodash');

// Default config
var config = {};

// Override with environment config
if (process.env.NODE_ENV === 'development') {
  _.merge(config, require('./config.dev'));
} else if (process.env.NODE_ENV === 'testing') {
  _.merge(config, require('./config.test'));
} else if (process.env.NODE_ENV === 'travis') {
  _.merge(config, require('./config.travis'));
} else if (process.env.NODE_ENV === 'production') {
  _.merge(config, require('./config.prod'));
}

// Override with local config if available
try {
  var local = require('./config.local');
  _.merge(config, local);
} catch(error) {
  console.log('Error: ' + error.message);
}

module.exports = config;
