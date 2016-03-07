var _ = require('lodash'),
    testUtils = require('../../utils/tests'),
    routeUtils = require('../../utils/route'),
    HttpError = require('../../utils/general').HttpError,
    expect = require('chai').expect;

var ObjectId = require('mongoose').Types.ObjectId,
    User = require('../../models/User'),
    Group = require('../../models/Group'),
    Campaign = require('../../models/Campaign'),
    Country = require('../../models/Country'),
    Comment = require('../../models/Comment'),
    FeedItem = require('../../models/FeedItem');

describe('utils/routes', () => {
  before(testUtils.dbConnect);
  after(testUtils.dbDisconnect);

  describe('#paramHandler()', () => {
    var countryId = null;

    beforeEach(() => {
      return new Country({ name: 'Australia', code: 'AU' }).save()
        .then(country => (countryId = country.id));
    }); // beforeEach()
    afterEach(() => Country.remove({}));

    it('should return an error when not called with a mongoose Model', done => {
      var req = {}, res = {};
      routeUtils.paramHandler(req, res, err => {
        testUtils.catchify(() => {
          expect(err).to.be.an.instanceof(Error);
          expect(err.message).to.match(/mongoose\smodel/);
        }, done);
      }, countryId, 'country');
    }); // it()

    it('should return an error when called with an invalid ID', done => {
      var req = {}, res = {};
      routeUtils.paramHandler(req, res, err => {
        testUtils.catchify(() => {
          expect(err).to.be.an.instanceof(Error).and.to.have.property('message', 'Invalid country');
        }, done);
      }, 'invalid', 'country', Country);
    }); // it()

    it('should return an error when called with a non-existent ID', done => {
      var req = {}, res = {}, id = String(ObjectId());
      routeUtils.paramHandler(req, res, err => {
        testUtils.catchify(() => {
          expect(err).to.be.an.instanceof(Error).and.to.have.property('message', 'Not Found');
        }, done);
      }, id, 'country', Country);
    }); // it()

    it('should attach a document when given a valid ID and called with a Model', done => {
      var req = {}, res = {};
      routeUtils.paramHandler(req, res, err => {
        testUtils.catchify(() => {
          expect(err).to.not.exist;
          expect(req.country).to.be.an.instanceof(Country).and.to.have.property('id', countryId);
        }, done);
      }, countryId, 'country', Country);
    }); // it()
  }); // describe()

  describe('#buildQueryConditions', () => {
    it('should search all searchable fields if search param included', () => {
      var query = { query: 'au' };
      var conditions = routeUtils.buildQueryConditions(query, Country);

      expect(conditions).to.have.deep.property('$or[0].code');
      expect(conditions).to.have.deep.property('$or[1].name');
    }); // it()

    it('should search param if model has no searchable fields', () => {
      var query = { query: 'test' };
      var conditions = routeUtils.buildQueryConditions(query, Campaign);

      expect(conditions).to.be.empty;
    }); // it()

    it('should match any specified schema fields', () => {
      var query = { code: 'AU' };
      var conditions = routeUtils.buildQueryConditions(query, Country);

      expect(conditions).to.have.deep.property('$and[0].code', query.code);
    }); // it()

    it('should default the query operator to $and', () => {
      var query = { code: 'AU' };
      var conditions = routeUtils.buildQueryConditions(query, Country);

      expect(conditions).to.have.property('$and');
    }); // it()

    it('should allow overriding the default $and operator with $or', () => {
      var query = { code: 'AU' };
      var conditions = routeUtils.buildQueryConditions(query, Country, '$or');

      expect(conditions).to.have.property('$or');
    }); // it()

    it('should convert relevant field values to an ObjectId', () => {
      var query = { group: String(ObjectId()) };
      var conditions = routeUtils.buildQueryConditions(query, Campaign);

      expect(conditions).to.have.deep.property('$and[0].group');
      expect(conditions.$and[0].group).to.be.an.instanceof(ObjectId);
    }); // it()
  }); // describe()

  describe('#getAll', () => {
    var aus = null, uk = null;

    beforeEach(() => {
      return new Country({ name: 'Australia', code: 'AU' }).save()
        .then(country => (aus = country))
        .then(() => new Country({ name: 'United Kingdom', code: 'UK' }).save())
        .then(country => (uk = country));
    }); // beforeEach
    afterEach(() => Country.remove({}));

    it('should return an error when not called with a mongoose Model', done => {
      var req = {}, res = {};
      routeUtils.getAll(req, res, err => {
        testUtils.catchify(() => {
          expect(err).to.be.an.instanceof(Error);
          expect(err.message).to.match(/mongoose\smodel/);
        }, done);
      }, null);
    }); // it()

    it('should return all documents from a collection', done => {
      var req = { query: {} };
      var res = {
        status: function (statusCode) {
          this.statusCode = statusCode;
          return this;
        },
        json: function (documents) {
          testUtils.catchify(() => {
            expect(this).to.have.property('statusCode', 200);
            expect(documents).to.be.an('array').and.to.have.lengthOf(2);
            expect(documents[0]).to.have.property('id', aus.id);
            expect(documents[1]).to.have.property('id', uk.id);
          }, done);
        }
      };

      routeUtils.getAll(req, res, err => done(err), Country);
    }); // it()

    it('should return a count of documents from a collection', done => {
      var req = { query: { count: 'true' } };
      var res = {
        status: function (statusCode) {
          this.statusCode = statusCode;
          return this;
        },
        send: function (text) {
          testUtils.catchify(() => {
            expect(this).to.have.property('statusCode', 200);
            expect(text).to.equal('2');
          }, done);
        }
      };

      routeUtils.getAll(req, res, err => done(err), Country);
    }); // it()

    it('should limit the number of returned documents', done => {
      var req = { query: { limit: '1' } };
      var res = {
        status: function (statusCode) {
          this.statusCode = statusCode;
          return this;
        },
        json: function (documents) {
          testUtils.catchify(() => {
            expect(this).to.have.property('statusCode', 200);
            expect(documents).to.be.an('array').and.to.have.lengthOf(1);
            expect(documents[0]).to.have.property('id', aus.id);
          }, done);
        }
      };

      routeUtils.getAll(req, res, err => done(err), Country);
    }); // it()

    it('should filter the returned fields', done => {
      var req = { query: { fields: 'code' } };
      var res = {
        status: function (statusCode) {
          this.statusCode = statusCode;
          return this;
        },
        json: function (documents) {
          testUtils.catchify(() => {
            expect(this).to.have.property('statusCode', 200);
            expect(documents[0]).to.have.property('code', aus.code);
            expect(documents[0]).to.not.have.property('name');
          }, done);
        }
      };

      routeUtils.getAll(req, res, err => done(err), Country);
    }); // it()

    it('should search documents with a query string', done => {
      var req = { query: { query: 'aus' } };
      var res = {
        status: function (statusCode) {
          this.statusCode = statusCode;
          return this;
        },
        json: function (documents) {
          testUtils.catchify(() => {
            expect(this).to.have.property('statusCode', 200);
            expect(documents).to.be.an('array').and.to.have.lengthOf(1);
            expect(documents[0]).to.have.property('id', aus.id);
          }, done);
        }
      };

      routeUtils.getAll(req, res, err => done(err), Country);
    }); // it()

    it('should search documents by query paremeters', done => {
      var req = { query: { code: 'UK' } };
      var res = {
        status: function (statusCode) {
          this.statusCode = statusCode;
          return this;
        },
        json: function (documents) {
          testUtils.catchify(() => {
            expect(this).to.have.property('statusCode', 200);
            expect(documents).to.be.an('array').and.to.have.lengthOf(1);
            expect(documents[0]).to.have.property('id', uk.id);
          }, done);
        }
      };

      routeUtils.getAll(req, res, err => done(err), Country);
    }); // it()
  }); // describe()

  describe('#getByParam', () => {
    var user = null;
    var country = null;

    beforeEach(() => {
      return new Country({ name: 'Australia', code: 'AU' }).save()
        .then(newCountry => (country = newCountry))
        .then(() => new User(_.merge({ country }, testUtils.credentials)).save())
        .then(newUser => (user = newUser));
    }); // beforeEach()
    afterEach(() => User.remove({}).then(() => Country.remove({})));

    it('should return an error when called with an invalid param', done => {
      var req = {}, res = {};
      routeUtils.getByParam(req, res, err => {
        testUtils.catchify(() => {
          expect(err).to.be.an.instanceof(Error).and.to.have.property('message', 'Invalid param user');
        }, done);
      }, 'user');
    }); // it()

    it('should return a document when given a valid param', done => {
      var req = {
        params: { user: user.id },
        user
      };
      var res = {
        status: function (statusCode) {
          this.statusCode = statusCode;
          return this;
        },
        json: function (document) {
          testUtils.catchify(() => {
            expect(this).to.have.property('statusCode', 200);
            expect(document).to.have.property('_id', user._id);
          }, done);
        }
      };

      routeUtils.getByParam(req, res, err => done(err), 'user');
    }); // it()

    it('should populate a specified linked document', done => {
      var req = {
        params: { user: user.id },
        user
      };
      var res = {
        status: function (statusCode) {
          this.statusCode = statusCode;
          return this;
        },
        json: function (document) {
          testUtils.catchify(() => {
            expect(this).to.have.property('statusCode', 200);
            expect(document).to.have.property('_id', user._id);
            expect(document).to.have.deep.property('country._id', country._id);
          }, done);
        }
      };

      routeUtils.getByParam(req, res, err => done(err), 'user', 'country');
    }); // it()
  }); // describe()

  describe('#getByTarget', () => {
    var group = null;

    beforeEach(() => {
      var user = ObjectId();
      return new Group({ name: 'Group', owner: user, admins: [user] }).save()
        .then(newGroup => (group = newGroup))
        .then(() => new Comment({ user: ObjectId(), target: { group: group._id }, content: { text: 'Text' } }).save());
    }); // beforeEach()
    afterEach(() => {
      return Comment.remove({})
        .then(() => FeedItem.remove({}))
        .then(() => Group.remove({}));
    }); // afterEach()

    it('should return an error when not called with a mongoose Model', done => {
      var req = {}, res = {};
      routeUtils.getByTarget(req, res, err => {
        testUtils.catchify(() => {
          expect(err).to.be.an.instanceof(Error);
          expect(err.message).to.match(/mongoose\smodel/);
        }, done);
      }, null, 'group');
    }); // it()

    it('should return an error when called with an invalid target', done => {
      var req = {}, res = {};
      routeUtils.getByTarget(req, res, err => {
        testUtils.catchify(() => {
          expect(err).to.be.an.instanceof(Error).and.to.have.property('message', 'Invalid target group');
        }, done);
      }, Comment, 'group');
    }); // it()

    it('should return documents when given a valid target', done => {
      var req = {
        params: { group: group.id },
        group
      };
      var res = {
        status: function (statusCode) {
          this.statusCode = statusCode;
          return this;
        },
        json: function (documents) {
          testUtils.catchify(() => {
            expect(this).to.have.property('statusCode', 200);
            expect(documents).to.be.an('array').and.to.have.lengthOf(1);
          }, done);
        }
      };

      routeUtils.getByTarget(req, res, err => done(err), Comment, 'group');
    }); // it()
  }); // describe()

  describe('#putByParam', () => {
    var country = null;

    beforeEach(() => {
      return new Country({ name: 'Australia', code: 'AU' }).save()
        .then(newCountry => (country = newCountry));
    }); // beforeEach()
    afterEach(() => Country.remove({}));

    it('should return an error when not called with a mongoose Model', done => {
      var req = {}, res = {};
      routeUtils.putByParam(req, res, err => {
        testUtils.catchify(() => {
          expect(err).to.be.an.instanceof(Error);
          expect(err.message).to.match(/mongoose\smodel/);
        }, done);
      }, null, 'country');
    }); // it()

    it('should return an error when called with an invalid param', done => {
      var req = {}, res = {};
      routeUtils.putByParam(req, res, err => {
        testUtils.catchify(() => {
          expect(err).to.be.an.instanceof(Error).and.to.have.property('message', 'Invalid param country');
        }, done);
      }, Country, 'country');
    }); // it()

    it('should update a document when given a valid param', done => {
      var req = {
        body: { name: 'Test' },
        params: { country: country.id },
        country
      };
      var res = {
        status: function (statusCode) {
          this.statusCode = statusCode;
          return this;
        },
        json: function (document) {
          testUtils.catchify(() => {
            expect(this).to.have.property('statusCode', 200);
            expect(document).to.have.property('name', req.body.name);
          }, done);
        }
      };

      routeUtils.putByParam(req, res, err => done(err), Country, 'country');
    }); // it()
  }); // describe()

  describe('#deleteByParam', () => {
    var country = null;

    beforeEach(() => {
      return new Country({ name: 'Australia', code: 'AU' }).save()
        .then(newCountry => (country = newCountry));
    }); // beforeEach()
    afterEach(() => Country.remove({}));

    it('should return an error when called with an invalid param', done => {
      var req = {}, res = {};
      routeUtils.deleteByParam(req, res, err => {
        testUtils.catchify(() => {
          expect(err).to.be.an.instanceof(Error).and.to.have.property('message', 'Invalid param country');
        }, done);
      }, 'country');
    }); // it()

    it('should remove a document when given a valid param', done => {
      var req = {
        params: { country: country.id },
        country
      };
      var res = {
        status: function (statusCode) {
          this.statusCode = statusCode;
          return this;
        },
        send: function () {
          expect(this).to.have.property('statusCode', 204);

          Country.findById(country.id).exec()
            .catch(err => {
              testUtils.catchify(() => {
                expect(err).to.be.an.instanceof(HttpError).and.to.have.property('message', 'Not Found');
              }, done);
            });
        }
      };

      routeUtils.deleteByParam(req, res, err => done(err), 'country');
    }); // it()
  }); // describe()

  describe('#ensureAuthenticated', () => {
    beforeEach(() => testUtils.saveUser(testUtils.credentials));
    afterEach(testUtils.removeUsers);

    it('should return an error if no Authorization header included', done => {
      var req = { headers: {} }, res = {};
      routeUtils.ensureAuthenticated(req, res, err => {
        testUtils.catchify(() => {
          expect(err).to.be.an.instanceof(Error).and.to.have.property('status', 401);
        }, done);
      });
    }); // it()

    it('should attach the logged in user to the request', done => {
      testUtils.getApiToken()
        .then(token => {
          var req = { headers: { authorization: `Bearer ${token}` } }, res = {};
          routeUtils.ensureAuthenticated(req, res, err => {
            testUtils.catchify(() => {
              expect(err).to.not.exist;
              expect(req.authUser).to.be.an.instanceof(User).and.to.have.property('email', testUtils.credentials.email);
            }, done);
          });
        });
    }); // it()
  }); // describe()

  describe('#ensureSuperAdmin', () => {
    var authUser = null;

    beforeEach(() => {
      return testUtils.saveUser(testUtils.credentials)
        .then(user => (authUser = user));
    }); // beforeEach()
    afterEach(testUtils.removeUsers);

    it('should return an error if authorized user is not a superAdmin', done => {
      var req = { authUser }, res = {};
      routeUtils.ensureSuperAdmin(req, res, err => {
        testUtils.catchify(() => {
          expect(err).to.be.an.instanceof(HttpError).and.to.have.property('status', 403);
        }, done);
      });
    }); // it()

    it('should continue if authorized user is a superAdmin', done => {
      var req = { authUser: _.defaults({ superAdmin: true }, authUser) }, res = {};
      routeUtils.ensureSuperAdmin(req, res, err => {
        testUtils.catchify(() => {
          expect(err).to.not.exist;
        }, done);
      });
    }); // it()
  }); // describe()

  describe('#ensureSameUser', () => {
    var authUser = null;

    beforeEach(() => {
      return testUtils.saveUser(testUtils.credentials)
        .then(user => (authUser = user));
    }); // beforeEach()
    afterEach(testUtils.removeUsers);

    it('should return an error if authorized user is not the same user', done => {
      var req = { authUser, user: { _id: ObjectId() } }, res = {};
      routeUtils.ensureSameUser(req, res, err => {
        testUtils.catchify(() => {
          expect(err).to.be.an.instanceof(HttpError).and.to.have.property('status', 403);
        }, done);
      }, 'user._id');
    }); // it()

    it('should continue if authorized user is the same user', done => {
      var req = { authUser, user: { _id: authUser._id } }, res = {};
      routeUtils.ensureSameUser(req, res, err => {
        testUtils.catchify(() => {
          expect(err).to.not.exist;
        }, done);
      }, 'user._id');
    }); // it()
  }); // describe()

  describe('#ensureAdminOf', () => {
    var authUser = null;
    var group = null;

    beforeEach(() => {
      return testUtils.saveUser(testUtils.credentials)
        .then(user => (authUser = user))
        .then(() => {
          var user = ObjectId();
          return new Group({ name: 'Group', owner: user, admins: [user] }).save();
        })
        .then(newGroup => (group = newGroup));
    }); // beforeEach()
    afterEach(() => {
      return Group.remove({})
        .then(testUtils.removeUsers);
    }); // afterEach()

    it('should return an error if group not found', done => {
      var req = {}, res = {};
      routeUtils.ensureAdminOf(req, res, err => {
        testUtils.catchify(() => {
          expect(err).to.be.an.instanceof(HttpError).and.to.have.property('status', 404);
        }, done);
      }, 'group._id');
    }); // it()

    it('should return an error if authorized user is not an admin of group', done => {
      var req = { authUser, group }, res = {};
      routeUtils.ensureAdminOf(req, res, err => {
        testUtils.catchify(() => {
          expect(err).to.be.an.instanceof(HttpError).and.to.have.property('status', 403);
        }, done);
      }, 'group._id');
    }); // it()

    it('should continue if authorized user is an admin of group', done => {
      group.admins.push(authUser._id);
      group.save()
        .then(group => {
          var req = { authUser, group }, res = {};
          routeUtils.ensureAdminOf(req, res, err => {
            testUtils.catchify(() => {
              expect(err).to.not.exist;
            }, done);
          }, 'group._id');
        })
        .catch(done);
    }); // it()
  }); // describe()

  describe('#filterProperties', () => {
    var properties = {
      firstName: 'Foobar',
      superAdmin: true
    };

    it('should return all properties if model has no filter', () => {
      expect(routeUtils.filterProperties(properties, Country)).to.deep.equal(properties);
    }); // it()

    it('should filter properties by keys using model\'s filter', () => {
      var filtered = routeUtils.filterProperties(properties, User);

      expect(filtered).to.not.deep.equal(properties);
      expect(filtered).to.have.keys('firstName');
      expect(filtered).to.not.have.keys('superAdmin');
    }); // it()
  }); // describe()

  describe('#filterJsonPatch', () => {
    var patches = [
      { op: 'replace', path: '/firstName', value: 'Foobar' },
      { op: 'replace', path: '/superAdmin', value: true }
    ];

    it('should return all patches if model has no filter', () => {
      expect(routeUtils.filterJsonPatch(patches, Country)).to.deep.equal(patches);
    }); // it()

    it('should filter patches by paths using model\'s filter', () => {
      var filtered = routeUtils.filterJsonPatch(patches, User);
      var paths = _.map(filtered, 'path');

      expect(filtered).to.not.deep.equal(patches);
      expect(paths).to.include('/firstName');
      expect(paths).to.not.include('/superAdmin');
    }); // it()
  }); // describe()

  describe('#getCurrentCampaign', () => {
    var group = null;
    var campaign = null;

    beforeEach(() => {
      var user = ObjectId();
      return new Group({ name: 'Group', owner: user, admins: [user] }).save()
        .then(newGroup => (group = newGroup))
        .then(() => new Campaign({ group: group._id, deeds: [{ deed: ObjectId() }] }).save())
        .then(newCampaign => (campaign = newCampaign));
    }); // beforeEach()
    afterEach(() => {
      return Campaign.remove({})
        .then(() => Group.remove({}));
    }); // afterEach()

    it('should do nothing if request doesn\'t have group', () => {
      var req = { body: { property: 'value' } };
      return routeUtils.getCurrentCampaign(_.cloneDeep(req))
        .then(newReq => expect(newReq).to.deep.equal(req));
    }); // it()

    it('should do nothing if request already has group and campaign', () => {
      var req = { body: { group, campaign } };
      return routeUtils.getCurrentCampaign(_.cloneDeep(req))
        .then(newReq => expect(newReq).to.deep.equal(req));
    }); // it()

    it('should do nothing if group doesn\'t have an active campaign', () => {
      var req = { body: { group } };

      campaign.active = false;
      return campaign.save()
        .then(() => routeUtils.getCurrentCampaign(_.cloneDeep(req)))
        .then(newReq => expect(newReq).to.deep.equal(req));
    }); // it()

    it('should add campaign to request if group has an active campaign', () => {
      var req = { body: { group } };
      return routeUtils.getCurrentCampaign(_.cloneDeep(req))
        .then(newReq => expect(newReq.body.campaign).to.deep.equal(campaign._id));
    }); // it()
  }); // describe()
}); // describe()
