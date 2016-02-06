var utils = require('../../utils/tests'),
    credentials = utils.credentials,
    expect = require('chai').expect,
    _ = require('lodash');

var User = require('../../models/User');

describe('User', () => {
  before(utils.dbConnect);
  after(utils.dbDisconnect);

  describe('#save()', () => {
    afterEach(utils.removeUsers);

    it('should require an email address, username and groups', (done) => {
      new User().save((err, user) => {
        expect(err).to.exist.and.to.have.property('name', 'ValidationError');
        expect(err).to.have.deep.property('errors.email.kind', 'required');
        expect(err).to.have.deep.property('errors.username.kind', 'required');
        //expect(err).to.have.deep.property('errors.groups.kind', 'required');
        expect(user).to.not.exist;

        done();
      });
    }); // it()

    it('should hash password on save', (done) => {
      new User(credentials).save((err, user) => {
        expect(err).to.not.exist;
        expect(user.password).to.exist.and.not.to.equal(credentials.password);

        done();
      });
    }); // it()

    it('should not hash if no password is set', (done) => {
      new User(_.omit(credentials, 'password')).save((err, user) => {
        expect(err).to.not.exist;
        expect(user.password).to.not.exist;

        done();
      });
    }); // it()

    /*it('should require at least one group', (done) => {
      new User(_.defaults({ groups: [] }, credentials)).save((err, user) => {
        expect(err).to.have.deep.property('errors.groups.kind', 'required');
        expect(user).to.not.exist;

        done();
      });
    });*/ // it()
  }); // describe()

  describe('#validatePassword()', () => {
    afterEach(utils.removeUsers);

    beforeEach((done) => {
      utils.saveUser(credentials, done);
    }); // beforeEach()

    it('should return true when password is correct', (done) => {
      User.findOne({ email: credentials.email }, (err, user) => {
        expect(err).to.not.exist;

        user.validatePassword(credentials.password, (err, res) => {
          expect(err).to.not.exist;
          expect(res).to.be.true;

          done();
        });
      });
    }); // it()

    it('should return false when password is incorrect', (done) => {
      User.findOne({ email: credentials.email }, (err, user) => {
        expect(err).to.not.exist;

        user.validatePassword('wrongpassword', (err, res) => {
          expect(err).to.not.exist;
          expect(res).to.be.false;

          done();
        });
      });
    }); // it()

    it('should return false when user has no password', (done) => {
      User.findOne({ email: credentials.email }, (err, user) => {
        expect(err).to.not.exist;

        user.password = void 0;
        user.save((err, user) => {
          expect(err).to.not.exist;

          user.validatePassword(credentials.password, (err, res) => {
            expect(err).to.not.exist;
            expect(res).to.be.false;

            done();
          });
        });
      });
    }); // it()
  }); // describe()

  describe('#findOrCreate()', () => {
    afterEach(utils.removeUsers);

    it('should return an existing user', (done) => {
      new User(credentials).save((err, user) => {
        expect(err).to.not.exist;

        User.findOrCreate(credentials, (err, foundUser) => {
          expect(err).to.not.exist;
          expect(foundUser).to.exist.and.to.be.an.instanceof(User);
          expect(foundUser.id).to.equal(user.id);
          expect(foundUser.email).to.equal(credentials.email);

          done();
        });
      });
    }); // it()

    it('should create a new user', (done) => {
      User.findOne({ email: credentials.email }, (err, user) => {
        expect(err).to.not.exist;
        expect(user).to.not.exist;

        User.findOrCreate(credentials, (err, user) => {
          expect(err).to.not.exist;
          expect(user).to.exist.and.to.be.an.instanceof(User);
          expect(user.email).to.equal(credentials.email);

          done();
        });
      });
    }); // it()
  }); // describe()

  describe('#getFilter()', () => {
    it('should return an array of strings', () => {
      expect(User.getFilter()).to.be.an('array').and.have.length.above(0);
    }); // it()
  }); // describe()
}); // describe()
