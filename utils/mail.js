var config = require('../utils/config')();
var defaults = require('lodash/defaults');
var isArray = require('lodash/isArray');
var moment = require('moment');
var path = require('path');
var request = require('request');
var EmailTemplate = require('email-templates').EmailTemplate;
var mailgun = require('mailgun-js')(config.auth.mailgun);

var Token = require('../models/Token');

var MAIL_DEFAULTS = {
  from: `Love is our Weapon <${config.emails.mailer}>`,
};

var TEMPLATE_DEFAULTS = {
  baseUrl: isArray(config.client_urls) ? config.client_urls[0] : config.client_urls,
};

/**
 * Send an email and return a Promise
 *
 * @param {object} data
 *
 * @returns {Promise}
 */
function sendEmail(data) {
  if (process.env.NODE_ENV === 'testing') {
    return Promise.resolve(data);
  }

  return new Promise((resolve, reject) => {
    mailgun.messages().send(data, (err, body) => {
      if (err) {
        return reject(err);
      }

      resolve(body);
    });
  });
}

/**
 * Load an email template, inline the CSS and replace template tags
 *
 * @param {string} template
 * @param {object} tags
 *
 * @returns {Promise}
 */
function renderHtmlTemplate(template, tags) {
  var templatePath = path.join(__dirname, '..', 'templates', template);
  var emailTemplate = new EmailTemplate(templatePath);

  return new Promise((resolve, reject) => {
    emailTemplate.render(tags, (err, result) => {
      if (err) {
        return reject(err);
      }

      resolve(result);
    });
  });
}

/**
 * Get a token for confirmation, reset password and approve group emails
 *
 * @param {string} type
 * @param {object} user
 * @param {object} group
 *
 * @returns {Promise}
 */
function getToken(type, user, group) {
  var tokenDetails = { type };
  if (type === 'confirm' || type === 'reset') {
    tokenDetails.user = user._id;
  }
  if (type === 'approve') {
    tokenDetails.group = group._id;
  }
  return new Token(tokenDetails).save();
}

/**
 * Send email for user to confirm email address
 *
 * @param {object} user
 * @param {string} [baseUrl]
 *
 * @returns {Promise}
 */
function sendConfirmEmail(user, baseUrl) {
  return getToken('confirm', user)
    .then((token) =>
      renderHtmlTemplate(
        'confirm-email',
        defaults(
          {
            baseUrl,
            firstName: user.firstName,
            token: token.token,
            date: moment(token.expires).format('lll'),
          },
          TEMPLATE_DEFAULTS
        )
      )
    )
    .then((template) =>
      sendEmail(
        defaults(
          {
            to: `${user.name} <${user.email}>`,
            subject: 'Confirm your Love is our Weapon registration',
            text: template.text,
            html: template.html,
          },
          MAIL_DEFAULTS
        )
      )
    );
}

/**
 * Send email for user to reset their password
 *
 * @param {object} user
 * @param {string} [baseUrl]
 *
 * @returns {Promise}
 */
function sendPasswordReset(user, baseUrl) {
  return getToken('reset', user)
    .then((token) =>
      renderHtmlTemplate(
        'password-reset',
        defaults(
          {
            baseUrl,
            firstName: user.firstName,
            token: token.token,
            date: moment(token.expires).format('LTS'),
          },
          TEMPLATE_DEFAULTS
        )
      )
    )
    .then((template) =>
      sendEmail(
        defaults(
          {
            to: `${user.name} <${user.email}>`,
            subject: 'Reset your Love is our Weapon password',
            text: template.text,
            html: template.html,
          },
          MAIL_DEFAULTS
        )
      )
    );
}

/**
 * Send email to site admin when a new group registers
 *
 * @param {object} group
 * @param {object} owner
 * @param {string} [baseUrl]
 *
 * @returns {Promise}
 */
function sendGroupSignup(group, owner, baseUrl) {
  return getToken('approve', null, group).then((token) =>
    renderHtmlTemplate(
      'group-signup',
      defaults(
        {
          group,
          owner,
          baseUrl,
          token: token.token,
        },
        TEMPLATE_DEFAULTS
      )
    ).then((template) =>
      sendEmail(
        defaults(
          {
            to: `Love is our Weapon <${config.emails.admin}>`,
            subject: `${group.name} joined Love is our Weapon`,
            text: template.text,
            html: template.html,
          },
          MAIL_DEFAULTS
        )
      )
    )
  );
}

/**
 * Send email to site admin when a new salvation testimony is recorded
 *
 * @param {object} salvationTestimony
 * @param {object} user
 * @param {object} group
 *
 * @returns {Promise}
 */
function sendSalvationTestimony(salvationTestimony, user, group) {
  return renderHtmlTemplate(
    'salvation-testimony',
    defaults(
      {
        salvationTestimony,
        user,
        group,
      },
      TEMPLATE_DEFAULTS
    )
  ).then((template) =>
    sendEmail(
      defaults(
        {
          to: `Love is our Weapon <${config.emails.admin}>`,
          subject: `New Salvation Testimony from ${user.name}`,
          text: template.text,
          html: template.html,
        },
        MAIL_DEFAULTS
      )
    )
  );
}

/**
 * Send email to site admin when the contact form is filled out
 *
 * @param {object} contactForm
 *
 * @returns {Promise}
 */
function sendContactEmail(contactForm) {
  return renderHtmlTemplate('contact-form', defaults({ contactForm }, TEMPLATE_DEFAULTS)).then(
    (template) =>
      sendEmail(
        defaults(
          {
            to: `Love is our Weapon <${config.emails.admin}>`,
            subject: `Received a Love is our Weapon message from ${contactForm.name}`,
            text: template.text,
            html: template.html,
          },
          MAIL_DEFAULTS
        )
      )
  );
}

var BREVO_BASE_URL = 'https://api.brevo.com';

/**
 * Send new signup email to Brevo (email marketing platform)
 *
 * @param {object} user
 * @param {boolean} marketingOptIn
 *
 * @returns {Promise}
 */
function sendMarketingContact(user, marketingOptIn) {
  const url = `${BREVO_BASE_URL}/v3/contacts`;
  const payload = {
    email: user.email,
    attributes: {
      FIRSTNAME: user.firstName,
      LASTNAME: user.lastName,
    },
    listIds: [config.auth.brevo.signupListId],
    emailBlacklisted: !marketingOptIn,
  };
  return new Promise((resolve, reject) => {
    request.post(
      { url, body: payload, json: true, headers: { 'api-key': config.auth.brevo.apiKey } },
      (err, response, body) => {
        if (err || response.statusCode < 200 || response.statusCode >= 300) {
          return reject(err);
        }
        resolve(body);
      }
    );
  });
}

module.exports = {
  sendConfirmEmail,
  sendPasswordReset,
  sendGroupSignup,
  sendSalvationTestimony,
  sendContactEmail,

  sendMarketingContact,
};
