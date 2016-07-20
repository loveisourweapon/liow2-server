const isString = require('lodash/isString');

/**
 * New Error class that adds a HTTP status code
 *
 * @param {string} [message='Error']
 * @param {number} [status=400]
 *
 * @constructor
 */
function HttpError(message, status) {
  this.name = 'HttpError';
  this.message = message || 'Error';
  this.status = status || 400;
  this.stack = (new Error()).stack;
}
HttpError.prototype = Object.create(Error.prototype);
HttpError.prototype.constructor = HttpError;

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
 * Check if value is a valid ObjectId
 *
 * @param {*} value
 *
 * @returns {boolean}
 */
function isValidObjectId(value) {
  return isString(value) && /^[a-fA-F0-9]{24}$/.test(value);
}

module.exports = {
  HttpError,
  isNumeric,
  isValidObjectId,
};
