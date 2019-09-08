/* eslint-disable brace-style, camelcase, semi */

module.exports = Slack;

let request = require('request');

function Slack (channel, token, bot_name, live = false) {
  this.channel = channel;
  this.token = token;
  this.bot_name = bot_name;
  this.live = live;
}

// Public Methods

Slack.prototype = {
  send_message: function (text, callback) {
    post_request(this, text, function (err, res, body) {
      if (err) { console.error(err); }
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
      'Authorization': `Bearer ${slack.token}`
    },
    form: {
      channel: slack.channel,
      text: text,
      username: `${slack.live ? 'prod' : 'dev'}-${slack.bot_name}`
    }
  };

  if (!slack.live) {
    console.log(`Slack message not sent (on DEV): ${text}`);
    return callback(false, {}, {});
  }

  request.post(options, function (err, res, body) {
    callback(err, res, body);
  });
}
