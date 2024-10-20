var has = require('lodash/has'),
    hasIn = require('lodash/hasIn'),
    map = require('lodash/map'),
    keys = require('lodash/keys'),
    get = require('lodash/get'),
    pick = require('lodash/pick'),
    some = require('lodash/some'),
    filter = require('lodash/filter'),
    assign = require('lodash/assign'),
    partialRight = require('lodash/partialRight'),
    isString = require('lodash/isString'),
    isFunction = require('lodash/isFunction'),
    isUndefined = require('lodash/isUndefined'),
    escapeRegExp = require('lodash/escapeRegExp'),
    jwt = require('jsonwebtoken'),
    config = require('../utils/config')(),
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
  if (!has(model, 'base') || model.base !== mongoose) {
    return next(new Error('Must be called with a mongoose model'));
  }
  if (!utils.isValidObjectId(id)) {
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
 *
 * @returns {object}
 */
function buildQueryConditions(query, model) {
  var conditions = {};

  // Set join operator
  var op = has(query, 'operator') ? query.operator : '$and';

  // Match schema fields
  var fields = filter(
    keys(query),
    field => has(model.schema.paths, ~field.indexOf('.') ? field.substr(0, field.indexOf('.')) : field)
  );
  if (fields.length) {
    conditions[op] = map(fields, field => ({
      [field]: (query[field] === 'null') ?
      { $exists: false } :
      { $in: map(
        query[field].split(','),
        value => utils.isValidObjectId(value) ? ObjectId(value) : value
      ) }
    }));
  }

  // Search if search query included
  if (query.query && isFunction(model.getSearchable)) {
    conditions.$or = (conditions.$or || []).concat(
      map(model.getSearchable(), field => {
        return { [field]: new RegExp(escapeRegExp(query.query), 'i') };
      })
    );
  }

  return conditions;
}

/**
 * Find documents matching conditions
 *
 * @param {Model}  model
 * @param {object} conditions
 * @param {object} query
 * @param {array|string|object} populate
 *
 * @returns {Promise}
 */
function findDocuments(model, conditions, query, populate) {
  let skip = query.skip,
      limit = query.limit,
      sort = query.sort,
      sortDirection = 1;

  if (sort && sort[0] === '-') {
    sort = sort.substr(1);
    sortDirection = -1;
  }

  let findQuery = model.find(conditions)
    .sort({ [sort || '_id']: sortDirection })
    .skip(skip && utils.isNumeric(skip) ? parseFloat(skip) : null)
    .limit(limit && utils.isNumeric(limit) ? parseFloat(limit) : null);

  if (populate) {
    [].concat(populate).forEach(populate => findQuery.populate(populate));
  }

  return findQuery.exec();
}

/**
 * Count the number of documents returned with conditions
 *
 * @param {Model}  model
 * @param {object} conditions
 *
 * @returns {Promise}
 */
function countDocuments(model, conditions) {
  return model.find(conditions).count().exec();
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
  return isString(query.fields) ? map(
    documents,
    partialRight(pick, query.fields.split(','))
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
  if (!has(model, 'base') || model.base !== mongoose) {
    return next(new Error('Must be called with a mongoose model'));
  }

  var conditions = buildQueryConditions(req.query, model);

  if (req.query.count === 'true') {
    countDocuments(model, conditions)
      .then(count => res.status(200).send(String(count)))
      .catch(err => next(err));
  } else {
    findDocuments(model, conditions, req.query, populate)
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
  if (!has(req.params, param) || isUndefined(req[param])) {
    return next(new Error(`Invalid param ${param}`));
  }

  if (isString(populate)) {
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
  if (!has(model, 'base') || model.base !== mongoose) {
    return next(new Error('Must be called with a mongoose model'));
  }
  if (!has(req.params, target) || isUndefined(req[target])) {
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
  if (!has(model, 'base') || model.base !== mongoose) {
    return next(new Error('Must be called with a mongoose model'));
  }
  if (!has(req.params, param) || isUndefined(req[param])) {
    return next(new Error(`Invalid param ${param}`));
  }

  req.body = filterProperties(req.body, model);
  req.body.modified = new Date();
  assign(req[param], req.body).save()
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
  if (!has(req.params, param) || isUndefined(req[param])) {
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
  // Super admin can bypass ownership checks
  if (req.authUser.superAdmin) {
    return next();
  }

  if (get(req, userIdPath).equals(req.authUser._id)) {
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
  // Super admin can bypass admin checks
  if (req.authUser.superAdmin) {
    return next();
  }

  Group.findById(get(req, groupIdPath)).exec()
    .then(group => {
      if (hasIn(req, 'authUser._id') && some(group.admins, admin => admin.equals(req.authUser._id))) {
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
  return isFunction(model.getFilter) ? pick(body, model.getFilter()) : body;
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
  return isFunction(model.getFilter) ? filter(
    operations,
    operation => some(model.getFilter(), property => ~operation.path.indexOf(`/${property}`))
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

/**
 * @apiDefine NoContentResponse
 *
 * @apiSuccessExample Response
 *   HTTP/1.1 204 No Content
 */

/**
 * @apiDefine none No auth
 * No authentication required
 */

/**
 * @apiDefine user Auth user
 * Must be authenticated
 */

/**
 * @apiDefine owner Auth owner
 * Must be authenticated as the owner of the resource
 */

/**
 * @apiDefine admin Auth admin
 * Must be authenticated as an admin of the resource (eg. Group)
 */

/**
 * @apiDefine superAdmin Auth super admin
 * Must be authenticated as an unrestricted user
 */
