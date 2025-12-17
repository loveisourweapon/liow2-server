/**
 * @apiDefine FeedsResponse
 * @apiVersion 1.27.0
 *
 * @apiSuccess {FeedItem[]} feedItems              List of feed items
 * @apiSuccess {string}     feedItems._id          Feed item ObjectId
 * @apiSuccess {string}     feedItems.user         User ObjectId
 * @apiSuccess {string}     feedItems.group        Group ObjectId
 * @apiSuccess {string}     feedItems.campaign     Campaign ObjectId
 * @apiSuccess {object}     feedItems.target       Target object. Only one property will be set
 * @apiSuccess {string}     feedItems.target.group Group ObjectId
 * @apiSuccess {string}     feedItems.target.deed  Group ObjectId
 * @apiSuccess {string}     feedItems.act          Act ObjectId
 * @apiSuccess {string}     feedItems.comment      Comment ObjectId
 * @apiSuccess {boolean}    feedItems.bulk         Whether this is a bulk feed item
 * @apiSuccess {number}     feedItems.count        Count for repeated feed items
 * @apiSuccess {Date}       feedItems.created      Created timestamp
 * @apiSuccess {Date}       feedItems.modified     Modified timestamp
 *
 * @apiSuccessExample {json} Response
 *   HTTP/1.1 200 OK
 *   [{
 *     "_id": "55f6c56186b959ac12490e1e",
 *     "user": "55f6c56186b959ac12490e1a",
 *     "group": "55f6c56186b959ac12490e1b",
 *     "campaign": "55f6c56186b959ac12490e1c",
 *     "target": {
 *       "deed": "55f6c56186b959ac12490e1d"
 *     },
 *     "act": "55f6c56186b959ac12490e1d",
 *     "bulk": false,
 *     "count": 1,
 *     "created": "2015-09-14T13:56:27.250Z",
 *     "modified": "2015-09-14T13:56:27.250Z"
 *   }, {
 *     "_id": "55f6c56186b959ac12490e1f",
 *     "user": "55f6c56186b959ac12490e1a",
 *     "group": "55f6c56186b959ac12490e1b",
 *     "campaign": "55f6c56186b959ac12490e1c",
 *     "target": {
 *       "deed": "55f6c56186b959ac12490e1d"
 *     },
 *     "bulk": true,
 *     "count": 20,
 *     "created": "2015-09-14T14:00:00.000Z",
 *     "modified": "2015-09-14T14:00:00.000Z"
 *   }]
 */

/**
 * @apiDefine CreateUserResponse
 * @apiVersion 1.7.0
 *
 * @apiSuccess (201) {User}     user            User
 * @apiSuccess (201) {string}   user._id        User ObjectId
 * @apiSuccess (201) {string}   user.firstName  User's first name
 * @apiSuccess (201) {string}   user.lastName   User's last name
 * @apiSuccess (201) {string}   user.name       User's full name
 * @apiSuccess (201) {string}   user.picture    User's profile picture URL
 * @apiSuccess (201) {string}   user.coverImage User cover image URL
 * @apiSuccess (201) {string}   user.country    Country ObjectId
 * @apiSuccess (201) {string[]} user.groups     List of group ObjectId's
 * @apiSuccess (201) {boolean}  user.confirmed  Has user confirmed email address
 * @apiSuccess (201) {Date}     user.created    Created timestamp
 *
 * @apiSuccessExample {json} Response
 *   HTTP/1.1 201 Created
 *   {
 *     "_id": "55f6c56186b959ac12490e1c",
 *     "firstName": "Fred",
 *     "lastName": "Bloggs",
 *     "name": "Fred Bloggs",
 *     "picture": "https://example.com/images/picture.png",
 *     "coverImage": "https://example.com/images/cover-image.png",
 *     "country": "55f6c56186b959ac12490e1a",
 *     "groups": ["55f6c56186b959ac12490e1b"],
 *     "confirmed": false,
 *     "created": "2015-09-14T13:56:27.250Z"
 *   }
 */

/**
 * @apiDefine UsersResponse
 * @apiVersion 1.24.0
 *
 * @apiSuccess {User[]}   users           List of users
 * @apiSuccess {string}   users._id        User ObjectId
 * @apiSuccess {string}   users.firstName  User's first name
 * @apiSuccess {string}   users.lastName   User's last name
 * @apiSuccess {string}   users.name       User's full name
 * @apiSuccess {string}   users.picture    User's profile picture URL
 * @apiSuccess {string}   users.coverImage User cover image URL
 * @apiSuccess {string}   users.country    Country ObjectId
 * @apiSuccess {string[]} users.groups     List of group ObjectId's
 * @apiSuccess {boolean}  users.confirmed  Has user confirmed email address
 * @apiSuccess {Date}     users.created    Created timestamp
 * @apiSuccess {Date}     users.modified   Modified timestamp
 *
 * @apiSuccessExample {json} Response
 *   HTTP/1.1 200 OK
 *   [{
 *     "_id": "55f6c56186b959ac12490e1c",
 *     "firstName": "Fred",
 *     "lastName": "Bloggs",
 *     "name": "Fred Bloggs",
 *     "picture": "https://example.com/images/picture.png",
 *     "coverImage": "https://example.com/images/cover-image.png",
 *     "country": "55f6c56186b959ac12490e1a",
 *     "groups": ["55f6c56186b959ac12490e1b"],
 *     "confirmed": true,
 *     "created": "2015-09-14T13:56:27.250Z",
 *     "modified": "2015-09-14T14:32:27.250Z"
 *   }]
 */

/**
 * @apiDefine UserResponse
 * @apiVersion 1.6.0
 *
 * @apiSuccess {User}     user            User
 * @apiSuccess {string}   user._id        User ObjectId
 * @apiSuccess {string}   user.firstName  User's first name
 * @apiSuccess {string}   user.lastName   User's last name
 * @apiSuccess {string}   user.name       User's full name
 * @apiSuccess {string}   user.picture    User's profile picture URL
 * @apiSuccess {string}   user.coverImage User cover image URL
 * @apiSuccess {string}   user.country    Country ObjectId
 * @apiSuccess {string[]} user.groups     List of group ObjectId's
 * @apiSuccess {boolean}  user.confirmed  Has user confirmed email address
 * @apiSuccess {Date}     user.created    Created timestamp
 * @apiSuccess {Date}     user.modified   Modified timestamp
 *
 * @apiSuccessExample {json} Response
 *   HTTP/1.1 200 OK
 *   {
 *     "_id": "55f6c56186b959ac12490e1c",
 *     "firstName": "Fred",
 *     "lastName": "Bloggs",
 *     "name": "Fred Bloggs",
 *     "picture": "https://example.com/images/picture.png",
 *     "coverImage": "https://example.com/images/cover-image.png",
 *     "country": "55f6c56186b959ac12490e1a",
 *     "groups": ["55f6c56186b959ac12490e1b"],
 *     "confirmed": true,
 *     "created": "2015-09-14T13:56:27.250Z",
 *     "modified": "2015-09-14T14:32:27.250Z"
 *   }
 */

/**
 * @apiDefine GroupRequestBody
 * @apiVersion 1.0.0
 *
 * @apiParam (Body) {string} name             Group name
 * @apiParam (Body) {string} [logo]           Group logo URL
 * @apiParam (Body) {string} [coverImage]     Group cover image URL
 * @apiParam (Body) {string} [welcomeMessage] Group welcome message
 *
 * @apiParamExample {json} Request
 *   {
 *     "name": "Group Name",
 *     "logo": "https://example.com/images/group-logo.png",
 *     "coverImage": "https://example.com/images/cover-image.png",
 *     "welcomeMessage": "Example welcome message"
 *   }
 */

/**
 * @apiDefine UserResponse
 * @apiVersion 1.0.0
 *
 * @apiSuccess {User}     user            User
 * @apiSuccess {string}   user._id        User ObjectId
 * @apiSuccess {string}   user.email      User's email address
 * @apiSuccess {string}   user.firstName  User's first name
 * @apiSuccess {string}   user.lastName   User's last name
 * @apiSuccess {string}   user.name       User's full name
 * @apiSuccess {string}   user.picture    User's profile picture URL
 * @apiSuccess {string}   user.coverImage User cover image URL
 * @apiSuccess {string}   user.country    Country ObjectId
 * @apiSuccess {string[]} user.groups     List of group ObjectId's
 * @apiSuccess {Date}     user.created    Created timestamp
 * @apiSuccess {Date}     user.modified   Modified timestamp
 *
 * @apiSuccessExample {json} Response
 *   HTTP/1.1 200 OK
 *   {
 *     "_id": "55f6c56186b959ac12490e1c",
 *     "email": "fredb@example.com",
 *     "firstName": "Fred",
 *     "lastName": "Bloggs",
 *     "name": "Fred Bloggs",
 *     "picture": "https://example.com/images/picture.png",
 *     "coverImage": "https://example.com/images/cover-image.png",
 *     "country": "55f6c56186b959ac12490e1a",
 *     "groups": ["55f6c56186b959ac12490e1b"],
 *     "created": "2015-09-14T13:56:27.250Z",
 *     "modified": "2015-09-14T14:32:27.250Z"
 *   }
 */

/**
 * @apiDefine ActsResponse
 * @apiVersion 1.27.0
 *
 * @apiSuccess {Act[]}    acts          List of acts
 * @apiSuccess {string}   acts._id      Act ObjectId
 * @apiSuccess {string}   acts.user     User ObjectId
 * @apiSuccess {string}   acts.deed     Deed ObjectId
 * @apiSuccess {string}   acts.group    Group ObjectId
 * @apiSuccess {string}   acts.campaign Campaign ObjectId
 * @apiSuccess {boolean}  acts.bulk     Whether this is a bulk act
 * @apiSuccess {Date}     acts.created  Created timestamp
 *
 * @apiSuccessExample {json} Response
 *   HTTP/1.1 200 OK
 *   [{
 *     "_id": "55f6c56186b959ac12490e1e",
 *     "user": "55f6c57486b959ac12490e1a",
 *     "deed": "55f6c58b86b959ac12490e1b",
 *     "group": "55f6c58086b959ac12490e1c",
 *     "campaign": "55f6c58086b959ac12490e1d",
 *     "bulk": false,
 *     "created": "2015-09-14T13:56:27.250Z"
 *   }]
 */

/**
 * @apiDefine CreateActResponse
 * @apiVersion 1.27.0
 *
 * @apiSuccess (201) {Act}      act          Act
 * @apiSuccess (201) {string}   act._id      Act ObjectId
 * @apiSuccess (201) {string}   act.user     User ObjectId
 * @apiSuccess (201) {string}   act.deed     Deed ObjectId
 * @apiSuccess (201) {string}   act.group    Group ObjectId
 * @apiSuccess (201) {string}   act.campaign Campaign ObjectId
 * @apiSuccess (201) {boolean}  act.bulk     Whether this is a bulk act
 * @apiSuccess (201) {Date}     act.created  Created timestamp
 *
 * @apiSuccessExample {json} Response
 *   HTTP/1.1 201 Created
 *   {
 *     "_id": "55f6c56186b959ac12490e1e",
 *     "user": "55f6c57486b959ac12490e1a",
 *     "deed": "55f6c58b86b959ac12490e1b",
 *     "group": "55f6c58086b959ac12490e1c",
 *     "campaign": "55f6c58086b959ac12490e1d",
 *     "bulk": false,
 *     "created": "2015-09-14T13:56:27.250Z"
 *   }
 */

/**
 * @apiDefine CommentsResponse
 * @apiVersion 1.27.0
 *
 * @apiSuccess {Comment[]} comments               List of comments
 * @apiSuccess {string}    comments._id           Comment ObjectId
 * @apiSuccess {object}    comments.user          User object (populated)
 * @apiSuccess {string}    comments.user._id      User ObjectId
 * @apiSuccess {string}    comments.user.firstName User's first name
 * @apiSuccess {string}    comments.user.lastName  User's last name
 * @apiSuccess {string}    comments.user.name      User's full name
 * @apiSuccess {string}    comments.user.picture   User's profile picture URL
 * @apiSuccess {boolean}   comments.user.anonymous Whether user is anonymous
 * @apiSuccess {object}    comments.target        Target object. Only one property will be set
 * @apiSuccess {string}    comments.target.user   User ObjectId
 * @apiSuccess {string}    comments.target.group  Group ObjectId
 * @apiSuccess {string}    comments.target.deed   Deed ObjectId
 * @apiSuccess {string}    comments.target.act    Act ObjectId
 * @apiSuccess {object}    comments.content       Content object
 * @apiSuccess {string}    comments.content.text  Text content
 * @apiSuccess {string}    comments.content.image Image content
 * @apiSuccess {Date}      comments.created       Created timestamp
 * @apiSuccess {Date}      comments.modified      Modified timestamp
 *
 * @apiSuccessExample {json} Response
 *   HTTP/1.1 200 OK
 *   [{
 *     "_id": "55f6c56186b959ac12490e1e",
 *     "user": {
 *       "_id": "55f6c56186b959ac12490e1a",
 *       "firstName": "Fred",
 *       "lastName": "Bloggs",
 *       "name": "Fred Bloggs",
 *       "picture": "https://example.com/images/picture.png",
 *       "anonymous": false
 *     },
 *     "target": {
 *       "act": "55f6c56186b959ac12490e1d"
 *     },
 *     "content": {
 *       "text": "Example comment text"
 *     },
 *     "created": "2015-09-14T13:56:27.250Z",
 *     "modified": "2015-09-14T14:32:27.250Z"
 *   }]
 */

/**
 * @apiDefine CommentResponse
 * @apiVersion 1.27.0
 *
 * @apiSuccess {Comment}  comment               Comment
 * @apiSuccess {string}   comment._id           Comment ObjectId
 * @apiSuccess {object}   comment.user          User object (populated)
 * @apiSuccess {string}   comment.user._id      User ObjectId
 * @apiSuccess {string}   comment.user.firstName User's first name
 * @apiSuccess {string}   comment.user.lastName  User's last name
 * @apiSuccess {string}   comment.user.name      User's full name
 * @apiSuccess {string}   comment.user.picture   User's profile picture URL
 * @apiSuccess {boolean}  comment.user.anonymous Whether user is anonymous
 * @apiSuccess {object}   comment.target        Target object. Only one property will be set
 * @apiSuccess {string}   comment.target.user   User ObjectId
 * @apiSuccess {string}   comment.target.group  Group ObjectId
 * @apiSuccess {string}   comment.target.deed   Deed ObjectId
 * @apiSuccess {string}   comment.target.act    Act ObjectId
 * @apiSuccess {object}   comment.content       Content object
 * @apiSuccess {string}   comment.content.text  Text content
 * @apiSuccess {string}   comment.content.image Image content
 * @apiSuccess {Date}     comment.created       Created timestamp
 * @apiSuccess {Date}     comment.modified      Modified timestamp
 *
 * @apiSuccessExample {json} Response
 *   HTTP/1.1 200 OK
 *   {
 *     "_id": "55f6c56186b959ac12490e1e",
 *     "user": {
 *       "_id": "55f6c56186b959ac12490e1a",
 *       "firstName": "Fred",
 *       "lastName": "Bloggs",
 *       "name": "Fred Bloggs",
 *       "picture": "https://example.com/images/picture.png",
 *       "anonymous": false
 *     },
 *     "target": {
 *       "act": "55f6c56186b959ac12490e1d"
 *     },
 *     "content": {
 *       "text": "Example comment text"
 *     },
 *     "created": "2015-09-14T13:56:27.250Z",
 *     "modified": "2015-09-14T14:32:27.250Z"
 *   }
 */

/**
 * @apiDefine CommentRequestBody
 * @apiVersion 1.3.0
 *
 * @apiParam (Body) {object} content         Content object. Text or image property is required
 * @apiParam (Body) {string} [content.text]  Text content
 * @apiParam (Body) {string} [content.image] Image content
 *
 * @apiParamExample {json} Request
 *   {
 *     "content": {
 *       "text": "Example comment text"
 *     }
 *   }
 */

/**
 * @apiDefine CreateCommentResponse
 * @apiVersion 1.27.0
 *
 * @apiSuccess (201) {Comment}  comment               Comment
 * @apiSuccess (201) {string}   comment._id           Comment ObjectId
 * @apiSuccess (201) {object}   comment.user          User object (populated)
 * @apiSuccess (201) {string}   comment.user._id      User ObjectId
 * @apiSuccess (201) {string}   comment.user.firstName User's first name
 * @apiSuccess (201) {string}   comment.user.lastName  User's last name
 * @apiSuccess (201) {string}   comment.user.name      User's full name
 * @apiSuccess (201) {string}   comment.user.picture   User's profile picture URL
 * @apiSuccess (201) {boolean}  comment.user.anonymous  Whether user is anonymous
 * @apiSuccess (201) {object}   comment.target        Target object. Only one property will be set
 * @apiSuccess (201) {string}   comment.target.user   User ObjectId
 * @apiSuccess (201) {string}   comment.target.group  Group ObjectId
 * @apiSuccess (201) {string}   comment.target.deed   Deed ObjectId
 * @apiSuccess (201) {string}   comment.target.act    Act ObjectId
 * @apiSuccess (201) {object}   comment.content       Content object
 * @apiSuccess (201) {string}   comment.content.text  Text content
 * @apiSuccess (201) {string}   comment.content.image Image content
 * @apiSuccess (201) {Date}     comment.created       Created timestamp
 *
 * @apiSuccessExample {json} Response
 *   HTTP/1.1 201 Created
 *   {
 *     "_id": "55f6c56186b959ac12490e1e",
 *     "user": {
 *       "_id": "55f6c56186b959ac12490e1a",
 *       "firstName": "Fred",
 *       "lastName": "Bloggs",
 *       "name": "Fred Bloggs",
 *       "picture": "https://example.com/images/picture.png",
 *       "anonymous": false
 *     },
 *     "target": {
 *       "act": "55f6c56186b959ac12490e1d"
 *     },
 *     "content": {
 *       "text": "Example comment text"
 *     },
 *     "created": "2015-09-14T13:56:27.250Z"
 *   }
 */

/**
 * @apiDefine LikesResponse
 * @apiVersion 1.0.0
 *
 * @apiSuccess {Like[]} likes             List of likes
 * @apiSuccess {string} likes._id         Like ObjectId
 * @apiSuccess {string} likes.user        User ObjectId
 * @apiSuccess {object} likes.target      Target object. Only one property will be set
 * @apiSuccess {string} likes.target.deed Deed ObjectId
 * @apiSuccess {string} likes.target.act  Act ObjectId
 * @apiSuccess {Date}   likes.created     Created timestamp
 *
 * @apiSuccessExample {json} Response
 *   HTTP/1.1 200 OK
 *   [{
 *     "_id": "55f6c56186b959ac12490e1e",
 *     "user": "55f6c56186b959ac12490e1a",
 *     "target": {
 *       "act": "55f6c56186b959ac12490e1d"
 *     },
 *     "created": "2015-09-14T13:56:27.250Z,
 *   }]
 */

/**
 * @apiDefine CreateLikeResponse
 * @apiVersion 1.0.0
 *
 * @apiSuccess (201) {Like}   like             Like
 * @apiSuccess (201) {string} like._id         Like ObjectId
 * @apiSuccess (201) {string} like.user        User ObjectId
 * @apiSuccess (201) {object} like.target      Target object. Only one property will be set
 * @apiSuccess (201) {string} like.target.deed Deed ObjectId
 * @apiSuccess (201) {string} like.target.act  Act ObjectId
 * @apiSuccess (201) {Date}   like.created     Created timestamp
 *
 * @apiSuccessExample {json} Response
 *   HTTP/1.1 201 Created
 *   {
 *     "_id": "55f6c56186b959ac12490e1e",
 *     "user": "55f6c56186b959ac12490e1a",
 *     "target": {
 *       "act": "55f6c56186b959ac12490e1d"
 *     },
 *     "created": "2015-09-14T13:56:27.250Z,
 *   }
 */

/**
 * @apiDefine ActRequestBody
 * @apiVersion 1.0.0
 *
 * @apiParam (Body) {string} deed       Deed ObjectId
 * @apiParam (Body) {string} [group]    Group ObjectId
 *
 * @apiParamExample {json} Request
 *   {
 *     "deed": "55f6c58b86b959ac12490e1b",
 *     "group": "55f6c58086b959ac12490e1c"
 *   }
 */

/**
 * @apiDefine CommentRequestBody
 * @apiVersion 1.0.0
 *
 * @apiParam (Body) {string} [user]          User ObjectId
 * @apiParam (Body) {object} content         Content object. Text or image property is required
 * @apiParam (Body) {string} [content.text]  Text content
 * @apiParam (Body) {string} [content.image] Image content
 *
 * @apiParamExample {json} Request
 *   {
 *     "content": {
 *       "text": "Example comment text"
 *     }
 *   }
 */

/**
 * @apiDefine LikeRequestBody
 * @apiVersion 1.0.0
 *
 * @apiParam (Body) {string} [user]    User ObjectId
 *
 * @apiParamExample {json} Request
 *   {
 *     "user": "55f6c57486b959ac12490e1h"
 *   }
 */
