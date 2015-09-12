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
  }

};
