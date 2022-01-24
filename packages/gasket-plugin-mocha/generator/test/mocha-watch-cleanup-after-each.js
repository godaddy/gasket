const { cleanup } = require('@testing-library/react');

exports.mochaHooks = {
  afterEach() {
    cleanup();
  }
};
