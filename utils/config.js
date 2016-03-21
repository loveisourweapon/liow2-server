var _ = require('lodash'),
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
  return _.mapValues(config, (value, key) => {
    var newPath = path.concat(_.snakeCase(key));

    if (_.isObject(value)) {
      return buildConfig(value, newPath);
    }

    var envVar = newPath.join('_').toUpperCase();
    return _.has(process.env, envVar) ? process.env[envVar] : value;
  });
}
