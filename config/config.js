var _ = require('lodash'),
    dev = require('./config.dev'),
    test = require('./config.test'),
    travis = require('./config.travis'),
    prod = require('./config.prod');

var config = {};

if (process.env.NODE_ENV === 'development') {
  _.extend(config, dev);
} else if (process.env.NODE_ENV === 'testing') {
  _.extend(config, test);
} else if (process.env.NODE_ENV === 'travis') {
  _.extend(config, travis);
} else if (process.env.NODE_ENV === 'production') {
  _.extend(config, prod);
}

module.exports = config;
