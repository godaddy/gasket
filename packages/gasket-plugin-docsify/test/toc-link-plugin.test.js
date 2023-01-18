const path = require('path');
Object.defineProperty(global, 'window', {
  value: {
    $docsify: {}
  },
  writable: true,
  enumerable: true
});


const setup = () => {
  const file = path.join(__dirname, '..', 'generator', 'scripts', 'toc-link-plugin.js');
  window.Docsify = { dom: { create: jest.fn() } };
  jest.resetModules();
  require(file);

  const hooks = {};
  function doneEach(fn) {
    hooks.doneEach = fn;
  }

  global.window.$docsify.plugins[0]({ doneEach }, {});
  return hooks;
};

describe('toc-link-plugin', () => {
  afterEach(() => {
    global.window.$docsify = {};
    delete global.window.Docsify;
  });

  it('installs the plugin', () => {
    expect(global.window.$docsify).not.toHaveProperty('plugins');
    setup();
    expect(global.window.$docsify).toHaveProperty('plugins');
    global.window.$docsify = {};
  });
});
