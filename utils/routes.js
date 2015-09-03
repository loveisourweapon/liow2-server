var ObjectId = require('mongoose').Types.ObjectId;

function paramHandler(req, res, next, id, name) {
  if (!ObjectId.isValid(id)) { return next(new Error('Invalid ' + name)); }

  this.findById(id, function __findById(err, document) {
    if (err) { return next(err); }
    if (!document) { return next(new Error(this.modelName + ' ' + id + ' not found')); }

    req[name] = document;
    next();
  }.bind(this));
}

module.exports = {
  paramHandler: paramHandler
};
