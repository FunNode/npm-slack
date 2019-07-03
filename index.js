/* eslint-disable brace-style, camelcase, semi */
/* global R5 */

module.exports = Slack;

if (!global.R5) {
  global.R5 = {
    out: console
  }
}

let request = require('request');

function Slack (token, channel, live = false) {
  this.channel = channel;
  this.token = token;
  this.live = live;
  this.host = require('os').hostname();
  this.process = process.title;
}

// Public Methods

Slack.prototype = {
  send_message: function (text, callback) {
    post_request(this, text, function (err, res, body) {
      if (err) { R5.out.error(err); }
      if (callback) { return callback(err); }
    });
  }
};

// Private Methods

function post_request (slack, text, callback) {
  let options = {
    url: 'https://slack.com/api/chat.postMessage',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${process.env.SLACK_TOKEN}`
    },
    form: {
      channel: slack.channel,
      text: text,
      username: `${this.live ? 'prod' : 'dev'}-${slack.host}`
    }
  };

  if (!this.live) {
    R5.out.log(`Slack message not sent (on DEV): ${text}`);
    return callback(false, {}, {});
  }

  request.post(options, function (err, res, body) {
    callback(err, res, body);
  });
}
