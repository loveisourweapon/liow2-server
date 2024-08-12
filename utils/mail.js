var config = require('../utils/config')(),
    defaults = require('lodash/defaults'),
    moment = require('moment'),
    path = require('path'),
    EmailTemplate = require('email-templates').EmailTemplate,
    mailgun = require('mailgun-js')(config.auth.mailgun),
    Token = require('../models/Token');

var mailDefaults = {
  from: `Love is our Weapon <${config.emails.mailer}>`
};

var templateDefaults = {
  baseUrl: config.client_urls[0]
};

/**
 * Send an email and return a Promise
 *
 * @param {object} data
 *
 * @returns {Promise}
 */
function sendEmail(data) {
  // TODO: should mailgun be mocked in tests?
  if (process.env.NODE_ENV === 'testing') {
    return Promise.resolve(data);
  }

  return new Promise((resolve, reject) => {
    mailgun.messages().send(data, (err, body) => {
      if (err) { return reject(err); }

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
      if (err) { return reject(err); }

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
    .then(token => renderHtmlTemplate('confirm-email', defaults({
      baseUrl: baseUrl,
      firstName: user.firstName,
      token: token.token,
      date: moment(token.expires).format('lll')
    }, templateDefaults)))
    .then(template => sendEmail(defaults({
      to: `${user.name} <${user.email}>`,
      subject: 'Confirm your Love is our Weapon registration',
      text: template.text,
      html: template.html
    }, mailDefaults)));
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
    .then(token => renderHtmlTemplate('password-reset', defaults({
      baseUrl: baseUrl,
      firstName: user.firstName,
      token: token.token,
      date: moment(token.expires).format('LTS')
    }, templateDefaults)))
    .then(template => sendEmail(defaults({
      to: `${user.name} <${user.email}>`,
      subject: 'Reset your Love is our Weapon password',
      text: template.text,
      html: template.html
    }, mailDefaults)));
}

/**
 * Send email to site admin when a new group registers
 *
 * @param {object} group
 * @param {object} user
 * @param {string} [baseUrl]
 *
 * @returns {Promise}
 */
function sendGroupSignup(group, user, baseUrl) {
  return renderHtmlTemplate('group-signup', defaults({
      group: group,
      owner: user,
      baseUrl: baseUrl,
    }, templateDefaults))
    .then(template => sendEmail(defaults({
      to: `Love is our Weapon <${config.emails.admin}>`,
      subject: `${group.name} joined Love is our Weapon`,
      text: template.text,
      html: template.html,
    }, mailDefaults)));
}
/**
 * Send email to site admin when the contact form is filled out
 *
 * @param {object} contactForm
 *
 * @returns {Promise}
 */
function sendContactEmail(contactForm) {
  return renderHtmlTemplate('contact-form', defaults({
      contactForm: contactForm,
    }, templateDefaults))
    .then(template => sendEmail(defaults({
      to: `Love is our Weapon <${config.emails.admin}>`,
      subject: `Received a Love is our Weapon message from ${contactForm.name}`,
      text: template.text,
      html: template.html,
    }, mailDefaults)));
}

module.exports = {
  sendConfirmEmail,
  sendPasswordReset,
  sendGroupSignup,
  sendContactEmail,
};
