var _ = require('lodash');

module.exports = {

  /**
   * Check that exactly one of a set of properties is set on an object
   *
   * @param {Object} object
   * @param {string[]} properties
   *
   * @returns {boolean|Error}
   */
  oneOf(object, properties) {
    if (!_.isObject(object)) { return new Error('Object should be type Object'); }
    if (!_.isArray(properties)) { return new Error('Properties should be an Array of Strings'); }

    return Boolean(
      _.filter(properties, (property) => {
        return (
          _.has(object, property) &&
          _.isEmpty(_.omit(object, property))
        );
      }).length
    );
  }

};
