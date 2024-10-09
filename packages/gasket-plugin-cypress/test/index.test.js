const self = require('../package.json');
const plugin = require('../lib/index.js');
const { name, version, description } = require('../package');
const createHook = plugin.hooks.create.handler;

describe('Plugin', function () {
  let gasket, createContext;
  let ctxPkg, ctxFiles;
  const addReact = () => {
    ctxPkg.dependencies = {
      react: '1.0.0'
    };
  };

  beforeEach(() => {
    ctxPkg = {};
    ctxFiles = [];
    gasket = {};
    createContext = {
      pkg: {
        add: (key, value) => {
          ctxPkg[key] = ctxPkg[key] ?? {};
          ctxPkg[key] = { ...ctxPkg[key], ...value };
        },
        has: (key, value) => !!ctxPkg[key] && !!ctxPkg[key][value]
      },
      files: {
        add: (...args) => {
          ctxFiles.push(...args);
        }
      }
    };
  });

  it('is an object', function () {
    expect(plugin).toBeInstanceOf(Object);
  });

  it('has expected properties', function () {
    expect(plugin).toHaveProperty('name', name);
    expect(plugin).toHaveProperty('version', version);
    expect(plugin).toHaveProperty('description', description);
  });

  it('has expected hooks', function () {
    const expected = ['create', 'metadata'];

    expect(plugin).toHaveProperty('hooks');

    const hooks = Object.keys(plugin.hooks);
    expect(hooks).toEqual(expected);
    expect(hooks).toHaveLength(expected.length);
  });

  it('has the correct create hook timings', function () {
    expect(plugin.hooks.create.timing.after).toEqual(['@gasket/plugin-nextjs']);
  });

  describe('react', function () {
    it('includes a glob for the `generator/cypress.config.js` contents for react projects', async function () {
      addReact();
      await createHook(gasket, createContext);

      expect(ctxFiles[0]).toContain('/../generator/*');
      expect(ctxFiles[1]).toContain('/../generator/**/*');
    });
  });

  describe('adds react specific dependencies', function () {
    ['cypress', 'start-server-and-test'].forEach((name) => {
      it(`adds "${name}" in the devDependencies`, async function () {
        addReact();
        await createHook(gasket, createContext);

        expect(ctxPkg.devDependencies).toHaveProperty(name);
      });
    });

    it('depends on the same versions', async function () {
      addReact();
      await createHook(gasket, createContext);

      expect(typeof ctxPkg.devDependencies).toBe('object');
      Object.keys(ctxPkg.devDependencies).forEach((key) => {
        expect(self.devDependencies).toHaveProperty(key);
        expect(self.devDependencies[key]).toEqual(ctxPkg.devDependencies[key]);
      });
    });
  });

  describe('dependencies', function () {
    it('adds "cypress" in the devDependencies', async function () {
      await createHook(gasket, createContext);

      expect(ctxPkg.devDependencies).toHaveProperty('cypress');
    });

    it('depends on the same versions', async function () {
      await createHook(gasket, createContext);

      expect(typeof ctxPkg.devDependencies).toBe('object');
      Object.keys(ctxPkg.devDependencies).forEach((key) => {
        expect(self.devDependencies).toHaveProperty(key);
        expect(self.devDependencies[key]).toEqual(ctxPkg.devDependencies[key]);
      });
    });
  });

  describe('scripts', function () {
    it('add expected scripts', async function () {
      await createHook(gasket, createContext);

      const expected = {
        'cypress': 'cypress open',
        'cypress:headless': 'cypress run',
        'e2e': 'start-server-and-test start http://localhost:3000 cypress',
        'e2e:headless':
          'start-server-and-test start http://localhost:3000 cypress:headless'
      };

      expect(typeof ctxPkg.scripts).toBe('object');
      Object.keys(ctxPkg.scripts).forEach((key) => {
        expect(expected).toHaveProperty(key);
        expect(expected[key]).toEqual(ctxPkg.scripts[key]);
      });
    });

    it('use start:local script if set', async function () {
      ctxPkg.scripts = { 'start:local': 'GASKET_ENV=local next start' };
      await createHook(gasket, createContext);

      const expected = {
        'start:local': 'GASKET_ENV=local next start',
        'cypress': 'cypress open',
        'cypress:headless': 'cypress run',
        'e2e': 'start-server-and-test start:local http://localhost:3000 cypress',
        'e2e:headless':
          'start-server-and-test start:local http://localhost:3000 cypress:headless'
      };

      expect(typeof ctxPkg.scripts).toBe('object');
      Object.keys(ctxPkg.scripts).forEach((key) => {
        expect(expected).toHaveProperty(key);
        expect(expected[key]).toEqual(ctxPkg.scripts[key]);
      });
    });
  });
});
