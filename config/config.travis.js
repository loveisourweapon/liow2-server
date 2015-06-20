// Travis CI environment config
module.exports = {
  secret: 'thisisnotsecretbutitsjustfortravis',
  db: {
    url: 'mongodb://localhost/liow2'
  },
  auth: {
    facebook: {
      clientID: '1438693386453447',
      clientSecret: 'f0380da09ad0aebd63a3003f09553fbe',
      callbackURL: 'http://loveisourweapon.travis:3000/auth/facebook/callback'
    }
  }
};
