var _ = require('lodash'),
    jwt = require('jsonwebtoken'),
    config = require('../config'),
    mongoose = require('mongoose'),
    ObjectId = mongoose.Types.ObjectId,
    HttpError = require('../utils/general').HttpError,
    User = require('../models/User'),
    Group = require('../models/Group');

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

/**
 * Find a document from a mongoose model and attach it to the request
 *
 * @param {Request}  req
 * @param {Response} res
 * @param {function} next
 * @param {ObjectId} id
 * @param {string}   name
 * @param {Model}    model
 */
function paramHandler(req, res, next, id, name, model) {
  if (!_.has(model, 'base') || model.base !== mongoose) {
    return next(new Error('Must be called with a mongoose model'));
  }
  if (!ObjectId.isValid(id)) {
    return next(new Error(`Invalid ${name}`));
  }

  model.findById(id)
    .exec()
    .then(document => {
      req[name] = document;
      next();
    })
    .catch(err => next(err));
}

/**
 * Get a collection of documents from a mongoose model
 *
 * @param {Request}  req
 * @param {Response} res
 * @param {function} next
 * @param {Model}    model
 * @param {string}   populate
 */
function getAll(req, res, next, model, populate) {
  if (!_.has(model, 'base') || model.base !== mongoose) {
    return next(new Error('Must be called with to a mongoose model'));
  }

  // Extract query conditions
  var conditions = {};
  if (req.query.query && _.isFunction(model.getSearchable)) {
    // Search if search query included
    conditions.$or = _.map(model.getSearchable(), field => {
      return { [field]: new RegExp(_.escapeRegExp(req.query.query), 'i') };
    });
  } else {
    // Match schema fields
    var fields = _.filter(_.keys(req.query), field => _.has(model.schema.paths, field));
    if (fields.length) {
      conditions.$and = _.map(fields, field => {
        return { [field]: req.query[field] };
      });
    }
  }

  if (req.query.count === 'true') {
    // Count documents
    model.find(conditions)
      .count()
      .exec()
      .then(count => res.status(200).send(String(count)))
      .catch(err => next(err));
  } else {
    // Retrieve documents
    model.find(conditions)
      .populate(_.isString(populate) ? populate : '')
      .limit(req.query.limit && isNumeric(req.query.limit) ? parseFloat(req.query.limit) : null)
      .exec()
      .then(documents => {
        // Limit returned fields
        if (req.query.fields && _.isString(req.query.fields)) {
          documents = _.map(documents, _.partialRight(_.pick, req.query.fields.split(',')));
        }

        res.status(200).json(documents);
      })
      .catch(err => next(err));
  }
}

/**
 * Get a single document from a mongoose model
 * Should already be populated by a param middleware
 *
 * @param {Request}  req
 * @param {Response} res
 * @param {function} next
 * @param {string}   param
 * @param {string}   populate
 */
function getByParam(req, res, next, param, populate) {
  if (!_.has(req.params, param) || _.isUndefined(req[param])) {
    return next(new Error(`Invalid param ${param}`));
  }

  if (_.isString(populate)) {
    req[param].populate(populate);
  }

  res.status(200).json(req[param]);
}

/**
 * Get a collection of documents based on a target parameter
 * Target should already be populated by param middleware
 *
 * @param {Request}  req
 * @param {Response} res
 * @param {function} next
 * @param {Model}    model
 * @param {string}   target
 */
function getByTarget(req, res, next, model, target) {
  if (!_.has(model, 'base') || model.base !== mongoose) {
    return next(new Error('Must be called with a mongoose model'));
  }
  if (!_.has(req.params, target) || _.isUndefined(req[target])) {
    return next(new Error(`Invalid target ${target}`));
  }

  model.find({ [`target.${target}`]: req[target]._id })
    .exec()
    .then(documents => res.status(200).json(documents))
    .catch(err => next(err));
}

/**
 * Update a document
 * Should already be populated by a param middleware
 *
 * @param {Request}  req
 * @param {Response} res
 * @param {function} next
 * @param {Model}    model
 * @param {string}   param
 */
function putByParam(req, res, next, model, param) {
  if (!_.has(model, 'base') || model.base !== mongoose) {
    return next(new Error('Must be called with a mongoose model'));
  }
  if (!_.has(req.params, param) || _.isUndefined(req[param])) {
    return next(new Error(`Invalid param ${param}`));
  }

  req.body = _.pick(req.body, model.getFilter());
  req.body.modified = new Date();

  model.findById(req[param]._id)
    .exec()
    .then(document => _.merge(document, req.body).save())
    .then(document => res.status(200).json(document))
    .catch(err => next(err));
}

/**
 * Remove a document
 * Should already be populated by a param middleware
 *
 * @param {Request}  req
 * @param {Response} res
 * @param {function} next
 * @param {string}   param
 */
function deleteByParam(req, res, next, param) {
  if (!_.has(req.params, param) || _.isUndefined(req[param])) {
    return next(new Error(`Invalid param ${param}`));
  }

  req[param].remove()
    .then(() => res.status(204).send())
    .catch(err => next(err));
}

/**
 * Middleware to ensure authenticated user
 *
 * @param {Request}  req
 * @param {Response} res
 * @param {function} next
 */
function ensureAuthenticated(req, res, next) {
  if (!req.headers.authorization) {
    return next(new HttpError('Please make sure your request has an Authorization header', 401));
  }

  var token = req.headers.authorization.split(' ')[1];
  jwt.verify(token, config.secret, (err, userId) => {
    if (err) { return next(err); }

    User.findById(userId)
      .exec()
      .then(user => {
        req.authUser = user;
        next();
      })
      .catch(err => next(err));
  });
}

/**
 * Middleware to ensure the logged in user is a super admin
 *
 * @param {Request}  req
 * @param {Response} res
 * @param {function} next
 */
function ensureSuperAdmin(req, res, next) {
  if (req.authUser.superAdmin) {
    next();
  } else {
    next(new HttpError('Must be logged in as an admin', 403));
  }
}

/**
 * Middleware to ensure logged in user is the same as the same as the specified user
 *
 * @param {Request}  req
 * @param {Response} res
 * @param {function} next
 * @param {string}   userIdPath
 */
function ensureSameUser(req, res, next, userIdPath) {
  if (_.get(req, userIdPath).equals(req.authUser._id)) {
    next();
  } else {
    next(new HttpError('Must be logged in as this user', 403));
  }
}

/**
 * Middleware to ensure logged in user is admin of the specified group
 * Find group by looking up groupPath inside req
 *
 * @param {Request}  req
 * @param {Response} res
 * @param {function} next
 * @param {string}   groupIdPath
 */
function ensureAdminOf(req, res, next, groupIdPath) {
  Group.findById(_.get(req, groupIdPath))
    .exec()
    .then(group => {
      if (_.hasIn(req, 'authUser._id') && _.some(group.admins, admin => admin.equals(req.authUser._id))) {
        next();
      } else {
        next(new HttpError('Must be an admin of group', 403));
      }
    })
    .catch(() => next(new HttpError('Not Found', 404)));
}

/**
 * Filter JSON-Patch operations
 *
 * @param {array} operations
 * @param {string[]} properties
 *
 * @returns {array}
 */
function filterJsonPatch(operations, properties) {
  return _.filter(operations, operation => {
    return _.some(properties, property => operation.path.indexOf(`/${property}`) !== -1);
  });
}

module.exports = {
  paramHandler,
  getAll,
  getByParam,
  getByTarget,
  putByParam,
  deleteByParam,
  ensureAuthenticated,
  ensureSuperAdmin,
  ensureSameUser,
  ensureAdminOf,
  filterJsonPatch
};
