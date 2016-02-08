var _ = require('lodash'),
    jwt = require('jsonwebtoken'),
    config = require('../config'),
    mongoose = require('mongoose'),
    ObjectId = mongoose.Types.ObjectId,
    HttpError = require('../utils/general').HttpError;

/**
 * Check if n is numeric
 *
 * @param {*} n
 *
 * @returns {boolean}
 */
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

module.exports = {

  /**
   * Find a document from a mongoose model and attach it to the request
   */
  paramHandler(req, res, next, id, name, model) {
    if (!_.has(model, 'base') || model.base !== mongoose) {
      return next(new Error('Must be called with a mongoose model'));
    }
    if (!ObjectId.isValid(id)) {
      return next(new Error(`Invalid ${name}`));
    }

    model.findById(id, (err, document) => {
      if (err) { return next(err); }
      if (!document) { return next(new Error(`${model.modelName} ${id} not found`)); }

      req[name] = document;
      next();
    });
  },

  /**
   * Get a collection of documents from a mongoose model
   */
  getAll(req, res, next, model, populate) {
    if (!_.has(model, 'base') || model.base !== mongoose) {
      return next(new Error('Must be called with to a mongoose model'));
    }

    // Extract query conditions
    var conditions = {};
    if (req.query.query && _.isFunction(model.getSearchable)) {
      // Search if search query included
      conditions.$or = _.map(model.getSearchable(), (field) => {
        return { [field]: new RegExp(_.escapeRegExp(req.query.query), 'i') };
      });
    } else {
      // Match schema fields
      var fields = _.filter(_.keys(req.query), (field) => _.has(model.schema.paths, field));
      if (fields.length) {
        conditions.$and = _.map(fields, (field) => {
          return { [field]: req.query[field] };
        });
      }
    }

    model
      .find(conditions)
      .populate(_.isString(populate) ? populate : '')
      .limit(req.query.limit && isNumeric(req.query.limit) ? parseFloat(req.query.limit) : null)
      .exec((err, documents) => {
        if (err) { return next(err); }

        // Limit returned fields
        if (req.query.fields && _.isString(req.query.fields)) {
          documents = _.map(documents, _.partialRight(_.pick, req.query.fields.split(',')));
        }

        res.status(200).json(documents);
      });
  },

  /**
   * Get a single document from a mongoose model
   * Should already be populated by a param middleware
   */
  getByParam(req, res, next, param, populate) {
    if (!_.has(req.params, param) || _.isUndefined(req[param])) {
      return next(new Error(`Invalid param ${param}`));
    }

    if (_.isString(populate)) {
      req[param].populate(populate);
    }

    res.status(200).json(req[param]);
  },

  /**
   * Get a collection of documents based on a target parameter
   * Target should already be populated by param middleware
   */
  getByTarget(req, res, next, model, target) {
    if (!_.has(model, 'base') || model.base !== mongoose) {
      return next(new Error('Must be called with a mongoose model'));
    }
    if (!_.has(req.params, target) || _.isUndefined(req[target])) {
      return next(new Error(`Invalid target ${target}`));
    }

    model.find({ [`target.${target}`]: req[target]._id }, (err, documents) => {
      if (err) { return next(err); }

      res.status(200).json(documents);
    });
  },

  /**
   * Update a document
   * Should already be populated by a param middleware
   */
  putByParam(req, res, next, model, param) {
    if (!_.has(model, 'base') || model.base !== mongoose) {
      return next(new Error('Must be called with a mongoose model'));
    }
    if (!_.has(req.params, param) || _.isUndefined(req[param])) {
      return next(new Error(`Invalid param ${param}`));
    }

    req.body = _.pick(req.body, model.getFilter());
    req.body.modified = new Date();

    model.findByIdAndUpdate(req[param]._id, req.body, { new: true }, (err, document) => {
      if (err) { return next(err); }

      res.status(200).json(document);
    });
  },

  /**
   * Remove a document
   * Should already be populated by a param middleware
   */
  deleteByParam(req, res, next, param) {
    if (!_.has(req.params, param) || _.isUndefined(req[param])) {
      return next(new Error(`Invalid param ${param}`));
    }

    req[param].remove((err) => {
      if (err) { return next(err); }

      res.status(204).send();
    });
  },

  /**
   * Middleware to ensure authenticated user
   */
  ensureAuthenticated(req, res, next) {
    if (!req.headers.authorization) {
      return next(new HttpError('Please make sure your request has an Authorization header', 401));
    }

    var token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, config.secret, (err, userId) => {
      if (err) { return next(err); }

      req.user = userId;
      next();
    });
  }

};
