var has = require('lodash/has'),
    mapValues = require('lodash/mapValues'),
    snakeCase = require('lodash/snakeCase'),
    isObject = require('lodash/isObject'),
    config = require('../config'),
    configPrefix = 'liow';

module.exports = () => buildConfig(config, [configPrefix]);

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

    if (isObject(value)) {
      return buildConfig(value, newPath);
    }

    var envVar = newPath.join('_').toUpperCase();
    return has(process.env, envVar) ? process.env[envVar] : value;
  });
}
