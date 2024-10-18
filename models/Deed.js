var kebabCase = require('lodash/kebabCase'),
    modelUtils = require('../utils/models'),
    mongoose = require('mongoose'),
    uniqueValidator = require('mongoose-unique-validator');

var DeedSchema = new mongoose.Schema({
  title: { type: String, required: true },
  urlTitle: { type: String, required: true, index: { unique: true } },
  content: { type: String, required: true },
  logo: String,
  videoUrl: String,
  coverImage: String,
  order: { type: Number, default: 0, required: true },
  enabled: { type: Boolean, default: true, required: true },
  created: { type: Date, default: Date.now, required: true },
  modified: Date
});

DeedSchema.plugin(modelUtils.findOneOrThrow);
DeedSchema.plugin(uniqueValidator, { message: 'Title is already taken' });

DeedSchema.pre('validate', function (next) {
  this.urlTitle = kebabCase(this.title);
  next();
});

DeedSchema.statics.getFilter = function () {
  return ['title', 'content', 'logo', 'videoUrl', 'coverImage'];
};

DeedSchema.statics.getSearchable = function () {
  return ['title'];
};

module.exports = mongoose.model('Deed', DeedSchema);

/**
 * @apiDefine DeedsResponse
 *
 * @apiSuccess {Deed[]} deeds            List of deeds
 * @apiSuccess {string} deeds._id        Deed ObjectId
 * @apiSuccess {string} deeds.title      Deed title
 * @apiSuccess {string} deeds.urlTitle   Deed URL title
 * @apiSuccess {string} deeds.content    Deed text content
 * @apiSuccess {string} deeds.logo       Deed logo URL
 * @apiSuccess {string} deeds.videoUrl   Deed video URL
 * @apiSuccess {string} deeds.coverImage Deed cover image URL
 * @apiSuccess {Date}   deeds.created    Created timestamp
 * @apiSuccess {Date}   deeds.modified   Modified timestamp
 *
 * @apiSuccessExample {json} Response
 *   HTTP/1.1 200 OK
 *   [{
 *     "_id": "55f6c56186b959ac12490e1a",
 *     "title": "Deed Title",
 *     "urlTitle": "deed-title",
 *     "content": "Example deed content",
 *     "logo": "https://example.com/images/deed-logo.png",
 *     "videoUrl": "https://youtube.com/example",
 *     "coverImage": "https://example.com/images/cover-image.png",
 *     "created": "2015-09-14T13:56:27.250Z",
 *     "modified": "2015-09-14T14:32:27.250Z"
 *   }]
 */

/**
 * @apiDefine DeedResponse
 *
 * @apiSuccess {Deed}   deed            Deed
 * @apiSuccess {string} deed._id        Deed ObjectId
 * @apiSuccess {string} deed.title      Deed title
 * @apiSuccess {string} deed.urlTitle   Deed URL title
 * @apiSuccess {string} deed.content    Deed text content
 * @apiSuccess {string} deed.logo       Deed logo URL
 * @apiSuccess {string} deed.videoUrl   Deed video URL
 * @apiSuccess {string} deed.coverImage Deed cover image URL
 * @apiSuccess {Date}   deed.created    Created timestamp
 * @apiSuccess {Date}   deed.modified   Modified timestamp
 *
 * @apiSuccessExample {json} Response
 *   HTTP/1.1 200 OK
 *   {
 *     "_id": "55f6c56186b959ac12490e1a",
 *     "title": "Deed Title",
 *     "urlTitle": "deed-title",
 *     "content": "Example deed content",
 *     "logo": "https://example.com/images/deed-logo.png",
 *     "videoUrl": "https://youtube.com/example",
 *     "coverImage": "https://example.com/images/cover-image.png",
 *     "created": "2015-09-14T13:56:27.250Z",
 *     "modified": "2015-09-14T14:32:27.250Z"
 *   }
 */

/**
 * @apiDefine DeedRequestBody
 *
 * @apiParam (Body) {string} title        Deed title
 * @apiParam (Body) {string} content      Deed text content
 * @apiParam (Body) {string} [logo]       Deed logo URL
 * @apiParam (Body) {string} [videoUrl]   Deed video URL
 * @apiParam (Body) {string} [coverImage] Deed cover image URL
 *
 * @apiParamExample {json} Request
 *   {
 *     "title": "Deed Title",
 *     "content": "Example deed content",
 *     "logo": "https://example.com/images/deed-logo.png",
 *     "videoUrl": "https://youtube.com/example",
 *     "coverImage": "https://example.com/images/cover-image.png"
 *   }
 */

/**
 * @apiDefine CreateDeedResponse
 *
 * @apiSuccess (201) {Deed}   deed            Deed
 * @apiSuccess (201) {string} deed._id        Deed ObjectId
 * @apiSuccess (201) {string} deed.title      Deed title
 * @apiSuccess (201) {string} deed.urlTitle   Deed URL title
 * @apiSuccess (201) {string} deed.content    Deed text content
 * @apiSuccess (201) {string} deed.logo       Deed logo URL
 * @apiSuccess (201) {string} deed.videoUrl   Deed video URL
 * @apiSuccess (201) {string} deed.coverImage Deed cover image URL
 * @apiSuccess (201) {Date}   deed.created    Created timestamp
 *
 * @apiSuccessExample {json} Response
 *   HTTP/1.1 201 Created
 *   {
 *     "_id": "55f6c56186b959ac12490e1a",
 *     "title": "Deed Title",
 *     "urlTitle": "deed-title",
 *     "content": "Example deed content",
 *     "logo": "https://example.com/images/deed-logo.png",
 *     "videoUrl": "https://youtube.com/example",
 *     "coverImage": "https://example.com/images/cover-image.png",
 *     "created": "2015-09-14T13:56:27.250Z"
 *   }
 */
