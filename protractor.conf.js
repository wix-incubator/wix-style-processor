const fakeServer = require('./test/mock/fake-server');

module.exports = {
  config: {
    baseUrl: 'http://localhost:3100/',
    onPrepare() {
      browser.ignoreSynchronization = true;
      fakeServer.start(3100, false);
    }
  }
};
