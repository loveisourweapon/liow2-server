var modelUtils = require('../utils/models'),
    mongoose = require('mongoose');

var CountrySchema = new mongoose.Schema({
  name: { type: String, required: true, index: { unique: true } },
  code: {
    type: String, minlength: 2, maxlength: 2, uppercase: true,
    required: true, index: { unique: true }
  }
});

CountrySchema.plugin(modelUtils.findOneOrThrow);

CountrySchema.statics.getSearchable = function () {
  return ['code', 'name'];
};

module.exports = mongoose.model('Country', CountrySchema);

/**
 * @apiDefine CountriesResponse
 *
 * @apiSuccess {Country[]} countries      List of countries
 * @apiSuccess {string}    countries._id  Country ObjectId
 * @apiSuccess {string}    countries.code 2-letter country code
 * @apiSuccess {string}    countries.name Country name
 *
 * @apiSuccessExample {json} Response
 *   HTTP/1.1 200 OK
 *   [{
 *     "_id": "55f6c56186b959ac12490e1a",
 *     "code": "AU",
 *     "name": "Australia"
 *   }]
 */

/**
 * @apiDefine CountryResponse
 *
 * @apiSuccess {Country} country      Country
 * @apiSuccess {string}  country._id  Country ObjectId
 * @apiSuccess {string}  country.code 2-letter country code
 * @apiSuccess {string}  country.name Country name
 *
 * @apiSuccessExample {json} Response
 *   HTTP/1.1 200 OK
 *   {
 *     "_id": "55f6c56186b959ac12490e1a",
 *     "code": "AU",
 *     "name": "Australia"
 *   }
 */
