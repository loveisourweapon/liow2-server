var _ = require('lodash'),
    jwt = require('jsonwebtoken'),
    config = require('../config'),
    utils = require('../utils/general'),
    HttpError = utils.HttpError,
    mongoose = require('mongoose'),
    ObjectId = mongoose.Types.ObjectId,
    User = require('../models/User'),
    Group = require('../models/Group'),
    Campaign = require('../models/Campaign');

/**
 * Find a document from a mongoose model and attach it to the request
 *
 * @param {Request}  req
 * @param {Response} res
 * @param {function} next
 * @param {string}   id
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

  model.findById(id).exec()
    .then(document => {
      req[name] = document;
      next();
    })
    .catch(err => next(err));
}

/**
 * Extract query conditions
 *
 * @param {object} query
 * @param {Model}  model
 * @param {string} [op='$and']
 *
 * @returns {object}
 */
function buildQueryConditions(query, model, op) {
  op = op || '$and';

  var conditions = {};
  if (query.query && _.isFunction(model.getSearchable)) {
    // Search if search query included
    conditions.$or = _.map(model.getSearchable(), field => {
      return { [field]: new RegExp(_.escapeRegExp(query.query), 'i') };
    });
  } else {
    // Match schema fields
    var fields = _.filter(
      _.keys(query),
      field => _.has(model.schema.paths, ~field.indexOf('.') ? field.substr(0, field.indexOf('.')) : field)
    );
    if (fields.length) {
      conditions[op] = _.map(fields, field => ({
        [field]: (query[field] === 'true' || query[field] === 'false') ?
          { $exists: query[field] === 'true' } :
          { $in: _.map(query[field].split(','), value => ObjectId.isValid(value) ? ObjectId(value) : value) }
      }));
    }
  }

  return conditions;
}

/**
 * Filter fields from document
 *
 * @param {object[]} documents
 * @param {object}   query
 *
 * @returns {object[]}
 */
function filterDocumentFields(documents, query) {
  return _.isString(query.fields) ? _.map(
    documents,
    _.partialRight(_.pick, query.fields.split(','))
  ) : documents;
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
    return next(new Error('Must be called with a mongoose model'));
  }

  var conditions = buildQueryConditions(req.query, model);

  if (req.query.count === 'true') {
    // Count documents
    model.find(conditions).count().exec()
      .then(count => res.status(200).send(String(count)))
      .catch(err => next(err));
  } else {
    // Retrieve documents
    model.find(conditions)
      .populate(_.isString(populate) ? populate : '')
      .limit(req.query.limit && utils.isNumeric(req.query.limit) ? parseFloat(req.query.limit) : null)
      .sort({ _id: 1 })
      .exec()
      .then(documents => res.status(200).json(filterDocumentFields(documents, req.query)))
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

  model.find({ [`target.${target}`]: req[target]._id }).exec()
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

  req.body = filterProperties(req.body, model);
  req.body.modified = new Date();
  _.assign(req[param], req.body).save()
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

    User.findById(userId).exec()
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
    return next(null);
  } else {
    return next(new HttpError('Must be logged in as an admin', 403));
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
    return next();
  } else {
    return next(new HttpError('Must be logged in as this user', 403));
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
  Group.findById(_.get(req, groupIdPath)).exec()
    .then(group => {
      if (_.hasIn(req, 'authUser._id') && _.some(group.admins, admin => admin.equals(req.authUser._id))) {
        return next();
      } else {
        return next(new HttpError('Must be an admin of group', 403));
      }
    })
    .catch(() => next(new HttpError('Not Found', 404)));
}

/**
 * Filter the properties of a body
 *
 * @param {object} body
 * @param {Model}  model
 *
 * @returns {object}
 */
function filterProperties(body, model) {
  return _.isFunction(model.getFilter) ? _.pick(body, model.getFilter()) : body;
}

/**
 * Filter JSON-Patch operations
 *
 * @param {object[]} operations
 * @param {Model} model
 *
 * @returns {array}
 */
function filterJsonPatch(operations, model) {
  return _.isFunction(model.getFilter) ? _.filter(
    operations,
    operation => _.some(model.getFilter(), property => ~operation.path.indexOf(`/${property}`))
  ) : operations;
}

/**
 * Get the active campaign of a group in the request body
 *
 * @param {Request} req
 *
 * @returns {Promise}
 */
function getCurrentCampaign(req) {
  if (!req.body.group || req.body.campaign) {
    return Promise.resolve(req);
  }

  return Campaign.findOne({ group: req.body.group, active: true }, '_id').exec()
    .then(campaign => (req.body.campaign = campaign._id))
    .catch(() => null)
    .then(() => req);
}

module.exports = {
  paramHandler,
  buildQueryConditions,
  getAll,
  getByParam,
  getByTarget,
  putByParam,
  deleteByParam,
  ensureAuthenticated,
  ensureSuperAdmin,
  ensureSameUser,
  ensureAdminOf,
  filterProperties,
  filterJsonPatch,
  getCurrentCampaign
};
