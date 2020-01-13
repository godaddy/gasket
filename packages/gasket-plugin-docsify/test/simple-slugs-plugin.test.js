const assume = require('assume');
const sinon = require('sinon');
const path = require('path');

const setup = () => {
  const file = path.join(__dirname, '..', 'generator', 'scripts', 'simple-slugs-plugin.js');
  //
  // we need a fresh require each time
  //
  delete require.cache[file];
  require(file);

  const hooks = {};
  function afterEach(fn) {
    hooks.afterEach = fn;
  }

  global.window.$docsify.plugins[0]({ afterEach });
  return hooks;
};

describe('simple-slugs-plugin', () => {
  afterEach(() => {
    global.window.$docsify = {};
  });

  it('installs the plugin', () => {
    assume(global.window.$docsify).not.property('plugins');
    setup();
    assume(global.window.$docsify).property('plugins');
    global.window.$docsify = {};
  });

  describe('afterEach', () => {
    let hooks, nextStub;

    beforeEach(() => {
      hooks = setup();
      nextStub = sinon.stub();
    });

    it('does not modify basic slugs', () => {
      hooks.afterEach('<h1 id="basic-slug"/>', nextStub);
      assume(nextStub).calledWith('<h1 id="basic-slug"/>');
    });

    it('removes encoded text', () => {
      hooks.afterEach('<h1 id="slug-with-%encoded-data"/>', nextStub);
      assume(nextStub).calledWith('<h1 id="slug-with-data"/>');
    });

    it('removes non-basic characters', () => {
      hooks.afterEach('<h1 id="slug-with-⇒-|-more-data"/>', nextStub);
      assume(nextStub).calledWith('<h1 id="slug-with-more-data"/>');
    });

    it('reduces dash groups to single', () => {
      hooks.afterEach('<h1 id="slug-with--lots---of-------dashes"/>', nextStub);
      assume(nextStub).calledWith('<h1 id="slug-with-lots-of-dashes"/>');
    });
  });
});
