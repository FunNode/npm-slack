module.exports = Slack;

const request = require('request-promise-native');

function Slack (channel, token, bot_name, live = false) {
  this.channel = channel;
  this.token = token;
  this.bot_name = bot_name;
  this.live = live;
}

// Public Methods

Slack.prototype = {
  send_message: async function (text) {
    return post_request(this, text)
      .catch((err) => {
        console.error(err);
        throw err;
      });
  }
};

// Private Methods

async function post_request (slack, text) {
  const options = {
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
    return;
  }

  return request.post(options);
}
