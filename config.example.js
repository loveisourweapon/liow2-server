// LIOW2 Server config
// Environment variables shown in comments will override parameters set here
// Copy to 'config.js'

module.exports = {
  // Sign all access tokens, change to something secret
  secret: 'notsosecret', // LIOW_SECRET

  // Client application URLs
  client_urls: ['http://localhost:3000'], // LIOW_CLIENT_URLS

  // Email addresses for sending and receiving transactional emails
  emails: {
    mailer: 'support@loveisourweapon.com', // LIOW_EMAILS_MAILER
    admin: 'hello@loveisourweapon.com', // LIOW_EMAILS_ADMIN
  },

  // MongoDB connection
  db: {
    url: 'mongodb://localhost/liow2', // LIOW_DB_URL
  },

  // Auth parameters
  auth: {
    facebook: {
      clientID: 'YOUR_FACEBOOK_CLIENT_ID', // LIOW_AUTH_FACEBOOK_CLIENT_ID
      clientSecret: 'YOUR_FACEBOOK_CLIENT_SECRET', // LIOW_AUTH_FACEBOOK_CLIENT_SECRET
      callbackURL: 'http://api.loveisourweapon.com/v1/auth/facebook/callback', // LIOW_AUTH_FACEBOOK_CALLBACK_URL
    },

    mailgun: {
      domain: 'YOUR_MAILGUN_DOMAIN', // LIOW_AUTH_MAILGUN_DOMAIN
      apiKey: 'YOUR_MAILGUN_API_KEY', // LIOW_AUTH_MAILGUN_API_KEY
    },

    brevo: {
      apiKey: 'YOUR_BREVO_API_KEY', // LIOW_AUTH_BREVO_API_KEY
      signupListId: 0, // LIOW_AUTH_BREVO_SIGNUP_LIST_ID
    },
  },
};
