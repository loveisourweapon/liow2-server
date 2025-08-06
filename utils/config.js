var has = require('lodash/has');
var mapValues = require('lodash/mapValues');
var snakeCase = require('lodash/snakeCase');
var isObject = require('lodash/isObject');
var isArray = require('lodash/isArray');
var config = require('../config');

var CONFIG_PREFIX = 'liow';

module.exports = () => buildConfig(config, [CONFIG_PREFIX]);

/**
 * Recursively build a config object overriding with environment variables
 *
 * @param {object}   config
 * @param {string[]} path
 *
 * @returns {object}
 */
function buildConfig(config, path) {
  return mapValues(config, (value, key) => {
    var newPath = path.concat(snakeCase(key));

    if (isObject(value) && !isArray(value)) {
      return buildConfig(value, newPath);
    }

    var envVar = newPath.join('_').toUpperCase();
    if (has(process.env, envVar)) {
      var envValue = process.env[envVar];
      // If the environment variable contains commas, split it into an array
      if (typeof envValue === 'string' && envValue.includes(',')) {
        return envValue.split(',').map((item) => item.trim());
      }
      return envValue;
    }
    return value;
  });
}
