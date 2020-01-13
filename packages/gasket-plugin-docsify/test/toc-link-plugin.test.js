const assume = require('assume');
const sinon = require('sinon');
const path = require('path');

const setup = () => {
  const file = path.join(__dirname, '..', 'generator', 'scripts', 'toc-link-plugin.js');
  window.Docsify = { dom: { create: sinon.stub() } };
  delete require.cache[file];
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
    assume(global.window.$docsify).not.property('plugins');
    setup();
    assume(global.window.$docsify).property('plugins');
    global.window.$docsify = {};
  });
});
