var _ = require('lodash'),
    HttpError = require('./general').HttpError,
    FeedItem = require('../models/FeedItem');

module.exports = {

  /**
   * Check that exactly one of a set of properties is set on an object
   *
   * @param {object} object
   * @param {string[]} properties
   *
   * @returns {boolean|Error}
   */
  oneOf(object, properties) {
    if (!_.isObject(object)) { return new Error('Object should be type Object'); }
    if (!_.isArray(properties)) { return new Error('Properties should be an Array of Strings'); }

    return _.some(properties, property => {
      return (
        _.has(object, property) &&
        _.isEmpty(_.omit(object, property))
      );
    });
  },

  /**
   * Check that an array has at least one element
   *
   * @param {array} property
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
   * @param {Schema} schema
   */
  findOneOrThrow(schema) {
    schema.post('findOne', (res, next) => {
      if (!res) {
        return next(new HttpError('Not Found', 404));
      }

      next();
    });
  },

  /**
   * Mongoose plugin to also save a linked FeedItem when saving a document
   *
   * @param {Schema} schema
   * @param {object} opts
   * @param {string} opts.type
   */
  addFeedItem(schema, opts) {
    // Save a FeedItem after saving the document
    schema.post('save', function (doc) {
      if (_.hasIn(doc, 'deed') || _.hasIn(doc, 'target.deed') || _.hasIn(doc, 'target.group')) {
        var feedItem = _.pick(doc.toObject(), ['user', 'group', 'campaign']);
        feedItem.target = doc.deed ? { deed: doc.deed } : doc.target;
        feedItem[opts.type.toLowerCase()] = doc._id;

        FeedItem.findOrCreate(feedItem);
      }
    });

    // Find and remove the FeedItem when removing the document
    schema.post('remove', function (doc) {
      FeedItem.findOne({ $or: [{ act: doc._id }, { comment: doc._id }] }).exec()
        .then(feedItem => feedItem.remove());
    });
  }

};
