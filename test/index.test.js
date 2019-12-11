/* eslint-env mocha */
const chai = require('chai');
const { expect } = chai;
const sinon = require('sinon');
const proxyquire = require('proxyquire');

chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));

describe('Slack', function () {
  let sandbox;
  let requestLib;
  let Slack;

  const channel = 'channel';
  const token = 'token';
  const bot_name = 'bot_name';
    
  function inject () {
    Slack = proxyquire('../index', {
      'request-promise-native': requestLib,
    });
  }

  beforeEach(function () {
    sandbox = sinon.createSandbox();
  });
  
  afterEach(function () {
    sandbox.restore();
  });

  describe('when request succeeds', function () {
    beforeEach(function () {
      requestLib = {
        post: sandbox.stub().resolves({ state: 'SUCCESSFUL' }),
      };
      inject();
    });

    describe('in live mode', function () {
      let slack;
      const live = true; 

      this.beforeEach(function () {
        slack = new Slack(channel, token, bot_name, live);
      });

      it('constructs', function () {
        expect(slack).to.contain({
          channel,
          token,
          bot_name,
          live,
        });
      });

      it('sends message', function () {
        const text = 'text';
        slack.send_message(text);
        expect(requestLib.post).to.have.been.calledOnce;
        expect(requestLib.post.args[0][0]).to.eql({
          form: {
            channel,
            text,
            username: `prod-${bot_name}`,
          },
          headers: {
            Authorization: `Bearer ${token}`,
            'content-type': 'application/x-www-form-urlencoded',
          }, 
          url: 'https://slack.com/api/chat.postMessage',
        });
      });

      it('sends message and returns response of the request', async function () {
        const response = await slack.send_message();
        expect(response).to.eql({ state: 'SUCCESSFUL' });
      });
    });

    describe('in test mode', function () {
      let slack;
      const live = false;

      this.beforeEach(function () {
        slack = new Slack(channel, token, bot_name /*, false */);
      });

      it('constructs', function () {
        expect(slack).to.contain({
          channel,
          token,
          bot_name,
          live,
        });
      });

      it('skips request when sending message', function () {
        slack.send_message();
        expect(requestLib.post).to.not.have.been.called;
      });
    });
  });

  describe('when request fails', function () {
    beforeEach(function () {
      requestLib = {
        post: sandbox.stub().rejects({ state: 'FAIL' }),
      };
      inject();
    });

    it('throws', async function() {
      const live = true; 
      const slack = new Slack(channel, token, bot_name, live);
      return expect(slack.send_message()).to.be.rejectedWith({ state: 'FAIL' });
    });
  });
});
