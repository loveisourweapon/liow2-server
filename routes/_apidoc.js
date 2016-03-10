/**
 * @api {get} /users/me Get current user
 * @apiVersion 1.0.0
 * @apiName GetUsersMe
 * @apiGroup Users
 * @apiPermission user
 *
 * @apiUse UserResponse
 */

/**
 * @api {patch} /users/:user Partial update user
 * @apiVersion 1.2.1
 * @apiName PatchUser
 * @apiGroup Users
 * @apiPermission owner
 *
 * @apiParam {string} user User ObjectId
 *
 * @apiParam (Body) {object[]} patches         JSON Patch patches
 * @apiParam (Body) {string}   patches.op      Operation
 * @apiParam (Body) {string}   patches.path    JSON Pointer path
 * @apiParam (Body) {mixed}    [patches.value] New path value
 *
 * @apiParamExample {json} Request
 *   [{
 *     "op": "add",
 *     "path": "/groups/-",
 *     "value": "55f6c56186b959ac12490e1d"
 *   }]
 *
 * @apiUse UserResponse
 */

/**
 * @api {get} /acts List acts
 * @apiVersion 1.0.0
 * @apiName GetActs
 * @apiGroup Acts
 * @apiPermission none
 *
 * @apiUse ActsResponse
 */

/**
 * @api {post} /acts Create act
 * @apiVersion 1.3.0
 * @apiName PostActs
 * @apiGroup Acts
 * @apiPermission user
 *
 * @apiUse ActRequestBody
 * @apiUse CreateActResponse
 */

/**
 * @api {get} /acts/:act/likes List act likes
 * @apiVersion 1.0.0
 * @apiName GetActLikes
 * @apiGroup Acts
 * @apiPermission none
 *
 * @apiParam {string} act Act ObjectId
 *
 * @apiUse LikesResponse
 */

/**
 * @api {post} /acts/:act/likes Create act like
 * @apiVersion 1.3.0
 * @apiName PostActLikes
 * @apiGroup Acts
 * @apiPermission user
 *
 * @apiParam {string} act Act ObjectId
 *
 * @apiUse CreateLikeResponse
 */

/**
 * @api {get} /acts/:act/comments List act comments
 * @apiVersion 1.0.0
 * @apiName GetActComments
 * @apiGroup Acts
 * @apiPermission none
 *
 * @apiParam {string} act Act ObjectId
 *
 * @apiUse CommentsResponse
 */

/**
 * @api {post} /acts/:act/comments Create act comment
 * @apiVersion 1.3.0
 * @apiName PostActComments
 * @apiGroup Acts
 * @apiPermission user
 *
 * @apiParam {string} act Act ObjectId
 *
 * @apiUse CommentRequestBody
 * @apiUse CreateCommentResponse
 */

/**
 * @api {put} /acts/:act/comments/:comment Update act comment
 * @apiVersion 1.3.0
 * @apiName PutActComment
 * @apiGroup Acts
 * @apiPermission owner
 *
 * @apiParam {string} act     Act ObjectId
 * @apiParam {string} comment Comment ObjectId
 *
 * @apiUse CommentRequestBody
 * @apiUse CommentResponse
 */

/**
 * @api {get} /comments List comments
 * @apiVersion 1.0.0
 * @apiName GetComments
 * @apiGroup Comments
 * @apiPermission none
 *
 * @apiUse CommentsResponse
 */

/**
 * @api {put} /comments/:comment Update comment
 * @apiVersion 1.3.0
 * @apiName PutComment
 * @apiGroup Comments
 * @apiPermission owner
 *
 * @apiParam {string} comment Comment ObjectId
 *
 * @apiUse CommentRequestBody
 * @apiUse CommentResponse
 */

/**
 * @api {get} /deeds/:deed/comments List deed comments
 * @apiVersion 1.0.0
 * @apiName GetDeedComments
 * @apiGroup Deeds
 * @apiPermission none
 *
 * @apiParam {string} deed Deed ObjectId
 *
 * @apiUse CommentsResponse
 */

/**
 * @api {post} /deeds/:deed/comments Create deed comment
 * @apiVersion 1.3.0
 * @apiName PostDeedComment
 * @apiGroup Deeds
 * @apiPermission user
 *
 * @apiParam {string} deed Deed ObjectId
 *
 * @apiUse CommentRequestBody
 * @apiUse CreateCommentResponse
 */

/**
 * @api {put} /deeds/:deed/comments/:comment Update deed comment
 * @apiVersion 1.3.0
 * @apiName PutDeedComment
 * @apiGroup Deeds
 * @apiPermission owner
 *
 * @apiParam {string} deed    Deed ObjectId
 * @apiParam {string} comment Comment ObjectId
 *
 * @apiUse CommentRequestBody
 * @apiUse CommentResponse
 */

/**
 * @api {get} /likes List likes
 * @apiVersion 1.0.0
 * @apiName GetLikes
 * @apiGroup Likes
 * @apiPermission none
 *
 * @apiUse LikesResponse
 */

/**
 * @api {post} /acts Create act
 * @apiVersion 1.0.0
 * @apiName PostActs
 * @apiGroup Acts
 * @apiPermission none
 *
 * @apiUse ActRequestBody
 * @apiUse CreateActResponse
 */

/**
 * @api {post} /acts/:act/comments Create act comment
 * @apiVersion 1.0.0
 * @apiName PostActComments
 * @apiGroup Acts
 * @apiPermission none
 *
 * @apiParam {string} act Act ObjectId
 *
 * @apiUse CommentRequestBody
 * @apiUse CreateCommentResponse
 */

/**
 * @api {put} /acts/:act/comments/:comment Update act comment
 * @apiVersion 1.0.0
 * @apiName PutActComment
 * @apiGroup Acts
 * @apiPermission none
 *
 * @apiParam {string} act     Act ObjectId
 * @apiParam {string} comment Comment ObjectId
 *
 * @apiUse CommentRequestBody
 * @apiUse CommentResponse
 */

/**
 * @api {put} /comments/:comment Update comment
 * @apiVersion 1.0.0
 * @apiName PutComment
 * @apiGroup Comments
 * @apiPermission none
 *
 * @apiParam {string} comment Comment ObjectId
 *
 * @apiUse CommentRequestBody
 * @apiUse CommentResponse
 */

/**
 * @api {post} /deeds/:deed/comments Create deed comment
 * @apiVersion 1.0.0
 * @apiName PostDeedComment
 * @apiGroup Deeds
 * @apiPermission none
 *
 * @apiParam {string} deed Deed ObjectId
 *
 * @apiUse CommentRequestBody
 * @apiUse CreateCommentResponse
 */

/**
 * @api {put} /deeds/:deed/comments/:comment Update deed comment
 * @apiVersion 1.0.0
 * @apiName PutDeedComment
 * @apiGroup Deeds
 * @apiPermission none
 *
 * @apiParam {string} deed    Deed ObjectId
 * @apiParam {string} comment Comment ObjectId
 *
 * @apiUse CommentRequestBody
 * @apiUse CommentResponse
 */

/**
 * @api {post} /acts/:act/likes Create act like
 * @apiVersion 1.0.0
 * @apiName PostActLikes
 * @apiGroup Acts
 * @apiPermission none
 *
 * @apiParam {string} act Act ObjectId
 *
 * @apiUse LikeRequestBody
 * @apiUse CreateLikeResponse
 */

/**
 * @api {delete} /acts/:act Remove act
 * @apiVersion 1.0.0
 * @apiName DeleteAct
 * @apiGroup Acts
 * @apiPermission none
 *
 * @apiParam {string} act Act ObjectId
 *
 * @apiUse NoContentResponse
 */

/**
 * @api {delete} /acts/:act/likes/:like Remove act like
 * @apiVersion 1.0.0
 * @apiName DeleteActLike
 * @apiGroup Acts
 * @apiPermission none
 *
 * @apiParam {string} act  Act ObjectId
 * @apiParam {string} like Like ObjectId
 *
 * @apiUse NoContentResponse
 */

/**
 * @api {delete} /acts/:act/comments/:comment Remove act comment
 * @apiVersion 1.0.0
 * @apiName DeleteActComment
 * @apiGroup Acts
 * @apiPermission none
 *
 * @apiParam {string} act     Act ObjectId
 * @apiParam {string} comment Comment ObjectId
 *
 * @apiUse NoContentResponse
 */

/**
 * @api {delete} /comments/:comment Remove comment
 * @apiVersion 1.0.0
 * @apiName DeleteComment
 * @apiGroup Comments
 * @apiPermission none
 *
 * @apiParam {string} comment Comment ObjectId
 *
 * @apiUse NoContentResponse
 */

/**
 * @api {post} /deeds Create deed
 * @apiVersion 1.0.0
 * @apiName PostDeeds
 * @apiGroup Deeds
 * @apiPermission none
 *
 * @apiUse DeedRequestBody
 * @apiUse CreateDeedResponse
 */

/**
 * @api {put} /deeds/:deed Update deed
 * @apiVersion 1.0.0
 * @apiName PutDeed
 * @apiGroup Deeds
 * @apiPermission none
 *
 * @apiUse DeedRequestBody
 * @apiUse DeedResponse
 */

/**
 * @api {delete} /deeds/:deed Remove deed
 * @apiVersion 1.0.0
 * @apiName DeleteDeed
 * @apiGroup Deeds
 * @apiPermission none
 *
 * @apiUse NoContentResponse
 */

/**
 * @api {delete} /deeds/:deed/comments/:comment Remove deed comment
 * @apiVersion 1.0.0
 * @apiName DeleteDeedComment
 * @apiGroup Deeds
 * @apiPermission none
 *
 * @apiParam {string} deed    Deed ObjectId
 * @apiParam {string} comment Comment ObjectId
 *
 * @apiUse NoContentResponse
 */

/**
 * @api {post} /groups Create group
 * @apiVersion 1.0.0
 * @apiName PostGroups
 * @apiGroup Groups
 * @apiPermission none
 *
 * @apiUse GroupRequestBody
 * @apiUse CreateGroupResponse
 */

/**
 * @api {put} /groups/:group Update group
 * @apiVersion 1.0.0
 * @apiName PutGroup
 * @apiGroup Groups
 * @apiPermission none
 *
 * @apiParam {string} group Group ObjectId
 *
 * @apiUse GroupRequestBody
 * @apiUse GroupResponse
 */

/**
 * @api {delete} /groups/:group Remove group
 * @apiVersion 1.0.0
 * @apiName DeleteGroup
 * @apiGroup Groups
 * @apiPermission none
 *
 * @apiParam {string} group Group ObjectId
 *
 * @apiUse NoContentResponse
 */

/**
 * @api {delete} /likes/:like Remove like
 * @apiVersion 1.0.0
 * @apiName DeleteLike
 * @apiGroup Likes
 * @apiPermission none
 *
 * @apiParam {string} like Like ObjectId
 *
 * @apiUse NoContentResponse
 */

/**
 * @api {patch} /users/:user Partial update user
 * @apiVersion 1.0.0
 * @apiName PatchUser
 * @apiGroup Users
 * @apiPermission owner
 *
 * @apiParam {string} user User ObjectId
 *
 * @apiParam (Body) {string}   [firstName]  User's first name
 * @apiParam (Body) {string}   [lastName]   User's last name
 * @apiParam (Body) {string}   [picture]    User's profile picture URL
 * @apiParam (Body) {string}   [coverImage] User's cover image URL
 * @apiParam (Body) {string[]} [groups]     List of group ObjectId's
 *
 * @apiParamExample {json} Request
 *   {
 *     "firstName": "Foo",
 *     "groups": ["55f6c56186b959ac12490e1h"]
 *   }
 *
 * @apiUse UserResponse
 */
