var _ = require('lodash'),
    HttpError = require('./general').HttpError;

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

    return _.some(properties, (property) => {
      return (
        _.has(object, property) &&
        _.isEmpty(_.omit(object, property))
      );
    });
  },

  /**
   * Check that an array has at least one element
   *
   * @param {Array} property
   *
   * @returns {boolean|Error}
   */
  hasOne(property) {
    if (!_.isArray(property)) { return new Error('Property should be an Array'); }

    return property.length > 0;
  },

  /**
   * Mongoose plugin to throw an error when findOne and findById queries return no result
   *
   * @param {Object} schema
   */
  findOneOrThrow(schema) {
    schema.post('findOne', (res, next) => {
      if (!res) {
        return next(new HttpError('Not Found', 404));
      }

      next();
    });
  }

};
