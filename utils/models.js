var _ = require('lodash');

function oneOf(object, properties) {
  if (!_.isObject(object)) { return new Error('Object should be type Object'); }
  if (!_.isArray(properties)) { return new Error('Properties should be an Array of Strings'); }

  return Boolean(
    _.filter(properties, function __each(property) {
      return (
        _.has(object, property) &&
        _.isEmpty(_.omit(object, property))
      );
    }).length
  );
}

module.exports = {
  oneOf: oneOf
};
