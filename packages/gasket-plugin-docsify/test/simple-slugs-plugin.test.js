const path = require('path');
Object.defineProperty(global, 'window', {
  value: {
    $docsify: {}
  },
  writable: true,
  enumerable: true
});

const setup = () => {
  const file = path.join(__dirname, '..', 'generator', 'scripts', 'simple-slugs-plugin.js');
  //
  // we need a fresh require each time
  //
  jest.resetModules();
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
    expect(global.window.$docsify).not.toHaveProperty('plugins');
    setup();
    expect(global.window.$docsify).toHaveProperty('plugins');
    global.window.$docsify = {};
  });

  describe('afterEach', () => {
    let hooks, nextStub;

    beforeEach(() => {
      hooks = setup();
      nextStub = jest.fn();
    });

    it('does not modify basic slugs', () => {
      hooks.afterEach('<h1 id="basic-slug"/>', nextStub);
      expect(nextStub).toHaveBeenCalledWith('<h1 id="basic-slug"/>');
    });

    it('removes encoded text', () => {
      hooks.afterEach('<h1 id="slug-with-%encoded-data"/>', nextStub);
      expect(nextStub).toHaveBeenCalledWith('<h1 id="slug-with-data"/>');
    });

    it('removes non-basic characters', () => {
      hooks.afterEach('<h1 id="slug-with-⇒-|-more-data"/>', nextStub);
      expect(nextStub).toHaveBeenCalledWith('<h1 id="slug-with-more-data"/>');
    });

    it('reduces dash groups to single', () => {
      hooks.afterEach('<h1 id="slug-with--lots---of-------dashes"/>', nextStub);
      expect(nextStub).toHaveBeenCalledWith('<h1 id="slug-with-lots-of-dashes"/>');
    });
  });
});
