var config = require('../utils/config')();
var defaults = require('lodash/defaults');
var moment = require('moment');
var path = require('path');
var EmailTemplate = require('email-templates').EmailTemplate;
var mailgun = require('mailgun-js')(config.auth.mailgun);

var Token = require('../models/Token');

var MAIL_DEFAULTS = {
  from: `Love is our Weapon <${config.emails.mailer}>`,
};

var TEMPLATE_DEFAULTS = {
  baseUrl: config.client_urls[0],
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
 * Get a token for confirmation and reset password emails
 *
 * @param {object} user
 * @param {string} type
 *
 * @returns {Promise}
 */
function getToken(user, type) {
  return new Token({ user: user._id, type }).save();
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
  return getToken(user, 'confirm')
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
  return getToken(user, 'reset')
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
  return renderHtmlTemplate(
    'group-signup',
    defaults(
      {
        group,
        owner,
        baseUrl,
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

module.exports = {
  sendConfirmEmail,
  sendPasswordReset,
  sendGroupSignup,
  sendContactEmail,
};
