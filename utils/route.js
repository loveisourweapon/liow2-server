var _ = require('lodash'),
    ObjectId = require('mongoose').Types.ObjectId;

module.exports = {

  /**
   * Find a document from a mongoose model and attach it to the request
   */
  paramHandler(req, res, next, id, name) {
    if (_.isUndefined(this.findById) || _.isUndefined(this.modelName)) {
      return next(new Error('Must be called bound to a mongoose model'));
    }
    if (!ObjectId.isValid(id)) {
      return next(new Error(`Invalid ${name}`));
    }

    this.findById(id, (err, document) => {
      if (err) { return next(err); }
      if (!document) { return next(new Error(`${this.modelName} ${id} not found`)); }

      req[name] = document;
      next();
    });
  },

  /**
   * Get a collection of documents from a mongoose model
   */
  getAll(req, res, next) {
    if (_.isUndefined(this.find)) {
      return next(new Error('Must be called bound to a mongoose model'));
    }

    this.find((err, documents) => {
      if (err) { return next(err); }

      res.status(200).json(documents);
    });
  },

  /**
   * Get a single document from a mongoose model
   * Should already be populated by a param middleware
   */
  getByParam(req, res, next, param) {
    if (!_.has(req.params, param) || _.isUndefined(req[param])) {
      return next(new Error(`Invalid param ${param}`));
    }

    res.status(200).json(req[param]);
  },

  /**
   * Update a document
   * Should already be populated by a param middleware
   */
  putByParam(req, res, next, param) {
    if (_.isUndefined(this.findByIdAndUpdate) || _.isUndefined(this.getFilter)) {
      return next(new Error('Must be called bound to a mongoose model'));
    }
    if (!_.has(req.params, param) || _.isUndefined(req[param])) {
      return next(new Error(`Invalid param ${param}`));
    }

    req.body = _.pick(req.body, this.getFilter());
    req.body.modified = new Date();

    this.findByIdAndUpdate(req[param]._id, req.body, { new: true }, (err, document) => {
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
  }

};
