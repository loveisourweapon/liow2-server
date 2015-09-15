// LIOW2 Server config
// Environment variables shown in comments will override parameters set here
// Copy to 'config.js'

module.exports = {

  // Sign all access tokens, change to something secret
  secret: 'notsosecret', // LIOW_SECRET

  // MongoDB connection
  db: {
    url: 'mongodb://localhost/liow2' // LIOW_DB_URL
  },

  // Auth parameters
  auth: {
    facebook: {
      clientID: 'YOUR_FACEBOOK_CLIENT_ID', // LIOW_AUTH_FACEBOOK_CLIENT_ID
      clientSecret: 'YOUR_FACEBOOK_CLIENT_SECRET', // LIOW_AUTH_FACEBOOK_CLIENT_SECRET
      callbackURL: 'http://api.loveisourweapon.com/v1/auth/facebook/callback' // LIOW_AUTH_FACEBOOK_CALLBACK_URL
    }
  }

};
